import express from 'express';
import * as searchService from '../services/search.service.js';
import * as categoryService from '../services/category.service.js';
import * as bidService from '../services/bid.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const query = req.query.q || '';
  const categoryId = req.query.categoryId || null;
  const sortBy = req.query.sortBy || null;

  const result = await searchService.searchProducts(query, categoryId, sortBy, page, 6);
  const categories = await categoryService.findAllWithSubcategories();

  const highlightMinutes = parseInt(process.env.NEW_PRODUCT_HIGHLIGHT_MINUTES || '10');
  const highlightThreshold = new Date(Date.now() - highlightMinutes * 60 * 1000);

  const enrichedItems = await Promise.all(
    result.items.map(async (item) => {
      const bidCount = await bidService.countByProductId(item._id);
      const isNew = item.createdAt > highlightThreshold;
      return {
        ...item.toObject(),
        bidCount,
        isNew,
      };
    })
  );

  res.render('vwSearch/results', {
    items: enrichedItems,
    pagination: result.pagination,
    query,
    categoryId,
    sortBy,
    categories,
  });
});

export default router;

