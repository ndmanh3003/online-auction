import Product from '../models/Product.js';

export async function searchProducts(query, categoryId = null, sortBy = null, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const searchQuery = {
    status: 'active',
  };

  if (query && query.trim() !== '') {
    searchQuery.$text = { $search: query };
  }

  if (categoryId) {
    searchQuery.categoryId = categoryId;
  }

  let sortOptions = { createdAt: -1 };
  if (sortBy === 'endTime_asc') {
    sortOptions = { endTime: 1 };
  } else if (sortBy === 'currentPrice_asc') {
    sortOptions = { currentPrice: 1 };
  }

  const total = await Product.countDocuments(searchQuery);
  const items = await Product.find(searchQuery)
    .populate('categoryId', 'name')
    .populate('sellerId', 'name')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

