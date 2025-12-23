import express from 'express'
import * as categoryService from '../../services/category.service.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1
  const parentId = req.query.parentId || 'none'
  const result = await categoryService.findAll(page, 10, parentId)
  res.render('vwAdmin/categories/index', { ...result })
})

router.get('/create', function (req, res) {
  res.render('vwAdmin/categories/create')
})

router.post('/create', async function (req, res) {
  const { name, img_url, description, parentId } = req.body

  await categoryService.create({
    name: name.trim(),
    img_url: img_url.trim(),
    description: description ? description.trim() : '',
    parentId: parentId || null,
  })

  res.redirect('/admin/categories')
})

router.get('/:id/edit', async function (req, res) {
  const category = await categoryService.findById(req.params.id)
  res.render('vwAdmin/categories/edit', { category })
})

router.put('/:id', async function (req, res) {
  const { id } = req.params
  const { name, img_url, description, parentId } = req.body

  await categoryService.update(id, {
    name: name.trim(),
    img_url: img_url.trim(),
    description: description ? description.trim() : '',
    parentId: parentId || null,
  })

  res.redirect('/admin/categories')
})

router.delete('/:id', async function (req, res) {
  await categoryService.remove(req.params.id)
  res.redirect('/admin/categories')
})

export default router
