import bcrypt from 'bcryptjs'
import express from 'express'
import Rating from '../../models/Rating.js'
import User from '../../models/User.js'
import * as emailService from '../../utils/email.js'

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

router.post('/:id/reset-password', async function (req, res) {
  const user = await User.findById(req.params.id)
  if (!user) {
    return res.error('User not found')
  }

  const newPassword =
    Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
  const hashedPassword = bcrypt.hashSync(newPassword, 10)

  await User.findByIdAndUpdate(req.params.id, { password: hashedPassword })

  await emailService.sendPasswordResetNotificationEmail(
    user.email,
    user.name,
    newPassword
  )

  req.session.success_messages = [
    'Password reset successfully. New password has been sent to user email.',
  ]
  res.redirect('/admin/users')
})

export default router
