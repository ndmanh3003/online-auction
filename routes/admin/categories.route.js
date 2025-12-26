import express from 'express'
import Category from '../../models/Category.js'

const router = express.Router()

function buildParentIdQuery(parentId) {
  if (parentId === 'none' || parentId === '' || parentId === null) {
    return { parentId: null }
  }
  return { parentId }
}

router.get('/', async function (req, res) {
  const parentId = req.query.parentId || 'none'
  const filter = buildParentIdQuery(parentId)
  const result = await Category.paginate(req, filter)

  const parents = await Category.find({ parentId: null }).sort({ name: 1 })
  const allCategories = await Promise.all(
    parents.map(async (parent) => {
      const children = await Category.find({ parentId: parent._id }).sort({
        name: 1,
      })
      return {
        ...parent.toObject(),
        subcategories: children,
      }
    })
  )
  const drpdwnParents = allCategories.map((cat) => ({
    value: cat._id.toString(),
    label: cat.name,
  }))

  res.render('vwAdmin/categories/index', { ...result, drpdwnParents })
})

router.get('/create', function (req, res) {
  res.render('vwAdmin/categories/create')
})

router.post('/create', async function (req, res) {
  const { name, parentId } = req.body
  const category = new Category({
    name,
    parentId: parentId || null,
  })
  await category.save()
  res.redirect('/admin/categories')
})

router.get('/:id/edit', async function (req, res) {
  const category = await Category.findById(req.params.id)
  res.render('vwAdmin/categories/edit', { category })
})

router.put('/:id', async function (req, res) {
  const { id } = req.params
  const { name, parentId } = req.body
  await Category.findByIdAndUpdate(
    id,
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
