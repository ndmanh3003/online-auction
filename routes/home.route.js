import express from 'express';
import * as productService from '../services/product.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const endingSoon = await productService.getTopEndingSoon(5);
  const mostBids = await productService.getTopMostBids(5);
  const highestPrice = await productService.getTopHighestPrice(5);

  res.render('home', {
    endingSoon,
    mostBids,
    highestPrice,
  });
});

export default router;

