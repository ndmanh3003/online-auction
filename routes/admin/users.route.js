import express from 'express'
import User from '../../models/User.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const result = await User.paginate(req)

  res.render('vwAdmin/users/index', {
    ...result,
    items: await Promise.all(
      result.items.map(async (user) => {
        const userObj = user.toObject()
        delete userObj.password
        return {
          ...userObj,
          ratingStats: await user.getRatingStats(),
        }
      })
    ),
  })
})

router.get('/:id', async function (req, res) {
  res.render('vwAdmin/users/detail', {
    user: await User.findById(req.params.id),
  })
})

router.put('/:id', async function (req, res) {
  const { name, email, role } = req.body
  await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role },
    { new: true }
  )
  res.redirect('/admin/users')
})

router.delete('/:id', async function (req, res) {
  await User.findByIdAndDelete(req.params.id)
  res.redirect('/admin/users')
})

router.get('/:id/ratings', async function (req, res) {
  const ratingsResult = await Rating.paginate(req, {
    toUserId: req.params.id,
  })
  res.json(ratingsResult)
})

export default router
