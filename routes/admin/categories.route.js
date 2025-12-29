import express from 'express'
import Category from '../../models/Category.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const parentId = req.query.parentId
  const [result, parents] = await Promise.all([
    Category.paginate(
      req,
      !parentId || parentId === 'none' ? { parentId: null } : { parentId }
    ),
    Category.find({ parentId: null }).sort({ name: 1 }),
  ])

  res.render('vwAdmin/categories/index', {
    ...result,
    drpdwnParents: parents.map((p) => ({
      value: p._id.toString(),
      label: p.name,
    })),
  })
})

router.get('/create', function (req, res) {
  res.render('vwAdmin/categories/create')
})

router.post('/create', async function (req, res) {
  const { name, parentId } = req.body
  await new Category({
    name,
    parentId: parentId || null,
  }).save()
  res.redirect('/admin/categories')
})

router.get('/:id/edit', async function (req, res) {
  res.render('vwAdmin/categories/edit', {
    category: await Category.findById(req.params.id),
  })
})

router.put('/:id', async function (req, res) {
  const { name, parentId } = req.body
  await Category.findByIdAndUpdate(
    req.params.id,
    { name, parentId: parentId || null },
    { new: true }
  )
  res.redirect('/admin/categories')
})

router.delete('/:id', async function (req, res) {
  await Category.findByIdAndDelete(req.params.id)
  res.redirect('/admin/categories')
})

export default router
