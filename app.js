import 'dotenv/config'
import express from 'express'
import { engine } from 'express-handlebars'
import expressHandlebarsSections from 'express-handlebars-sections'
import session from 'express-session'
import handlebarsHelpers from 'handlebars-helpers'
import methodOverride from 'method-override'
import './jobs/auction-end.job.js'
import { handleError } from './middlewares/error.mdw.js'
import Category from './models/Category.js'
import routes from './routes/index.js'
import './utils/db.js'
import { paginationHelper } from './utils/pagination.js'

const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', 1)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'SESSION_SECRET',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
)

const handlebarsEngine = engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  partialsDir: [
    './views/partials',
    './views/vwAdmin/layout',
    './views/vwAdmin/partials',
  ],
  helpers: {
    ...handlebarsHelpers.comparison(),
    ...handlebarsHelpers.array(),
    ...handlebarsHelpers.string(),
    ...handlebarsHelpers.number(),
    ...handlebarsHelpers.math(),
    ...handlebarsHelpers.object(),
    eq(a, b) {
      const aStr = a && typeof a.toString === 'function' ? a.toString() : a
      const bStr = b && typeof b.toString === 'function' ? b.toString() : b
      return aStr === bStr
    },
    startsWith(str, prefix) {
      if (!str || !prefix) return false
      return String(str).startsWith(String(prefix))
    },
    ne(a, b) {
      const aStr = a && typeof a.toString === 'function' ? a.toString() : a
      const bStr = b && typeof b.toString === 'function' ? b.toString() : b
      return aStr !== bStr
    },
    concat(...args) {
      return args.join('')
    },
    format_currency(value) {
      return new Intl.NumberFormat('en-US').format(value)
    },
    section: expressHandlebarsSections(),
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const m = ('0' + (d.getMonth() + 1)).slice(-2)
      const day = ('0' + d.getDate()).slice(-2)
      const h = ('0' + d.getHours()).slice(-2)
      const min = ('0' + d.getMinutes()).slice(-2)
      return `${d.getFullYear()}-${m}-${day} ${h}:${min}`
    },
    toString(value) {
      if (!value) return ''
      return value.toString ? value.toString() : String(value)
    },
    menuItem(key, label, url, icon) {
      return { key, label, url, icon }
    },
    menuItems(...items) {
      return items.filter((item) => item && item.key && item.label)
    },
    for(from, to, incr, block) {
      var accum = ''
      for (var i = from; i < to; i += incr) {
        accum += block.fn(i)
      }
      return accum
    },
    pagination(currentPage, totalPages, total) {
      return paginationHelper(currentPage, totalPages, total)
    },
    maskBidderName(name) {
      if (!name || name.length <= 4) return '****'
      return '****' + name.slice(-4)
    },
    isNewProduct(createdAt, highlightMinutes = 30) {
      if (!createdAt) return false
      const diff = Date.now() - new Date(createdAt).getTime()
      return diff < highlightMinutes * 60 * 1000
    },
    formatStatus(status) {
      if (!status) return ''
      return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },
    now() {
      return new Date()
    },
    roundPercent(value) {
      if (!value && value !== 0) return 0
      return parseFloat(value).toFixed(2)
    },
  },
})

app.engine('handlebars', handlebarsEngine)
app.set('view engine', 'handlebars')
app.set('views', './views')

app.use('/static', express.static('static'))
app.use(express.urlencoded({ extended: true }))
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = req.body._method
      delete req.body._method
      return method
    }
  })
)

app.use(handleError)
app.use(async function (req, res, next) {
  res.locals.err_messages = req.session.err_messages || []
  res.locals.success_messages = req.session.success_messages || []
  delete req.session.err_messages
  delete req.session.success_messages
  res.locals.isAuthenticated = req.session.isAuthenticated
  res.locals.authUser = req.session.authUser
  if (req.session.authUser?.sellerExpiresAt) {
    res.locals.isSellerExpired =
      new Date() >= new Date(req.session.authUser.sellerExpiresAt)
  } else {
    res.locals.isSellerExpired = false
  }
  res.locals.recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || ''
  res.locals.req = {
    path: req.path,
    originalUrl: req.originalUrl,
    params: req.params,
    query: req.query,
  }
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
  res.locals.allCategories = allCategories
  if (req.session.showOtpModal) {
    res.locals.showOtpModal = true
    res.locals.otpModalType = req.session.otpModalType
    res.locals.otpModalTitle = req.session.otpModalTitle
    res.locals.otpModalMessage = req.session.otpModalMessage
    res.locals.otpModalAction = req.session.otpModalAction
    delete req.session.showOtpModal
    delete req.session.otpModalType
    delete req.session.otpModalTitle
    delete req.session.otpModalMessage
    delete req.session.otpModalAction
  }
  next()
})

app.use(routes)

app.use(function (req, res) {
  res.status(404).render('404')
})

app.listen(PORT, function () {
  console.log(`Server is running on http://localhost:${PORT}`)
})
