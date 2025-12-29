import express from 'express'
import Product from '../../models/Product.js'

const router = express.Router()

router.get('/', async function (req, res) {
  res.render(
    'vwAdmin/products/index',
    await Product.paginate(
      req,
      req.query.status ? { status: req.query.status } : {}
    )
  )
})

router.delete('/:id', async function (req, res) {
  await Product.findByIdAndDelete(req.params.id)
  res.redirect('/admin/products')
})

export default router
