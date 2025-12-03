# Online Auction System - PTUDW Final Project

A comprehensive online auction platform built with Express.js, Handlebars, MongoDB, and TailwindCSS.

## Tech Stack

- **Backend**: Express.js 5
- **View Engine**: Handlebars
- **Database**: MongoDB with Mongoose
- **Authentication**: Session-based authentication
- **Email**: Nodemailer
- **Styling**: TailwindCSS (Apple-like design)
- **Validation**: express-validator
- **Security**: bcryptjs, reCAPTCHA

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- SMTP email account (Gmail recommended)

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd app
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
BASE_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/auction

# Session
SESSION_SECRET=your_secret_key_here

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# reCAPTCHA
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Auction Settings
AUTO_EXTEND_THRESHOLD_MINUTES=5
AUTO_EXTEND_DURATION_MINUTES=10
NEW_PRODUCT_HIGHLIGHT_MINUTES=10
DEFAULT_AUCTION_DURATION_DAYS=7
MIN_BIDDER_RATING_PERCENT=80
```

4. **Seed Database** (Optional)
```bash
npm run seed:categories
```

5. **Run the Application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

6. **Access the Application**
- Open browser: `http://localhost:3000`
- Default admin account needs to be created manually in MongoDB

## Project Structure

```
/app
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── Bid.js
│   ├── Watchlist.js
│   ├── Rating.js
│   ├── ProductQuestion.js
│   ├── Transaction.js
│   ├── OTP.js
│   └── SellerRequest.js
├── services/            # Business logic layer
│   ├── user.service.js
│   ├── category.service.js
│   ├── product.service.js
│   ├── bid.service.js
│   ├── watchlist.service.js
│   ├── rating.service.js
│   ├── question.service.js
│   ├── transaction.service.js
│   ├── search.service.js
│   ├── otp.service.js
│   ├── seller-request.service.js
│   └── dropdown.service.js
├── routes/              # Route handlers
│   ├── auth.route.js
│   ├── account.route.js
│   ├── home.route.js
│   ├── product.route.js
│   ├── search.route.js
│   ├── checkout.route.js
│   ├── bidder/
│   │   ├── watchlist.route.js
│   │   ├── bid.route.js
│   │   └── question.route.js
│   ├── seller/
│   │   ├── product.route.js
│   │   └── question.route.js
│   └── admin/
│       ├── categories.route.js
│       ├── seller-requests.route.js
│       ├── users.route.js
│       └── products.route.js
├── middlewares/         # Express middlewares
│   ├── auth.mdw.js
│   └── error.mdw.js
├── utils/               # Utility functions
│   ├── db.js
│   ├── email.js
│   ├── otp.js
│   ├── pagination.js
│   ├── recaptcha.js
│   └── redirect.js
├── views/               # Handlebars templates
│   ├── layouts/
│   ├── partials/
│   ├── vwAuth/
│   ├── vwAccount/
│   ├── vwProducts/
│   ├── vwSearch/
│   ├── vwBidder/
│   ├── vwSeller/
│   ├── vwCheckout/
│   └── vwAdmin/
├── jobs/                # Background jobs
│   └── auction-end.job.js
└── scripts/             # Utility scripts
    └── seed-categories.js
```

## Feature Checklists

### Subsystem 1: Guest Users (Anonymous) ✅

- [x] **Menu System**
  - [x] Display 2-level category hierarchy
  - [x] Parent categories with subcategories
  - [x] Navigation to category listings

- [x] **Homepage**
  - [x] Top 5 products ending soon
  - [x] Top 5 products with most bids
  - [x] Top 5 highest price products
  - [x] Links to product details

- [x] **Product Listing**
  - [x] List products by category
  - [x] Pagination (10 items per page)
  - [x] Display: image, name, current price, bidder, buy-now price, post date, time remaining, bid count
  - [x] Click category to filter

- [x] **Full-Text Search**
  - [x] Search by product name
  - [x] Filter by category
  - [x] Sort by: ending soon, price low to high
  - [x] Highlight new products (within N minutes)
  - [x] Pagination of results

- [x] **Product Detail View**
  - [x] Full product information
  - [x] Large main image + thumbnails (min 3)
  - [x] Current price, buy-now price
  - [x] Seller information and rating
  - [x] Top bidder information and rating
  - [x] Post date, end date (relative time if <3 days)
  - [x] Full description
  - [x] Q&A history
  - [x] 5 related products (same category)

- [x] **User Registration**
  - [x] reCAPTCHA validation
  - [x] Email OTP verification
  - [x] Password hashing (bcrypt)
  - [x] Required: name, email, address
  - [x] No duplicate emails

---

### Subsystem 2: Bidders ✅

- [x] **Watchlist Management**
  - [x] Add product to watchlist (list & detail views)
  - [x] Remove from watchlist
  - [x] View watchlist with pagination

- [x] **Bidding System**
  - [x] Place bid from product detail view
  - [x] Validate bidder rating ≥80% OR seller allows non-rated bidders
  - [x] Check if bidder is blocked
  - [x] Suggest valid bid amount (current + step price)
  - [x] Confirmation required
  - [x] Auto-extend auction (if enabled)

- [x] **Bid History**
  - [x] View all bids for a product
  - [x] Mask bidder names (****Name)
  - [x] Sort by amount (descending) and time (ascending)
  - [x] Show auto-bid indicator

- [x] **Ask Seller Questions**
  - [x] Post question from product detail
  - [x] Email notification to seller with product link
  - [x] View all Q&A on product page

- [x] **Profile Management**
  - [x] Update email, name, password
  - [x] View rating score and details
  - [x] View watchlist
  - [x] View active bids
  - [x] View won auctions
  - [x] Rate seller (+1/-1 with comment)
  - [x] Update ratings

---

### Subsystem 3: Sellers ✅

- [x] **Post Auction Product**
  - [x] All required fields: name, images (min 3), category, start price, step price, buy-now price (optional), description (WYSIWYG), duration
  - [x] Auto-extend option
  - [x] Allow non-rated bidders option
  - [x] Rich text editor for description

- [x] **Append Product Description**
  - [x] Add timestamped updates
  - [x] Append to existing description (not replace)
  - [x] Format: "✏️ {date}\n\n- {new content}"

- [x] **Block Bidder**
  - [x] Block bidder from specific product
  - [x] If blocked bidder is top, revert to 2nd highest
  - [x] Blocked bidder cannot bid again

- [x] **Answer Questions**
  - [x] Answer buyer questions
  - [x] Email notification to all participants
  - [x] Display on product detail page

- [x] **Profile Management**
  - [x] View active products
  - [x] View ended products with winners
  - [x] Rate winner (+1/-1 with comment)
  - [x] Cancel transaction (auto -1 to winner)

- [x] **Request Seller Upgrade**
  - [x] Bidders can request upgrade
  - [x] Admin approval required
  - [x] 7-day waiting period

---

### Subsystem 4: Admin ✅

- [x] **Category Management**
  - [x] CRUD operations
  - [x] 2-level hierarchy support
  - [x] Cannot delete category with subcategories
  - [x] Cannot delete category with products
  - [x] Filter by parent category

- [x] **User Management**
  - [x] List all users with pagination
  - [x] View user details
  - [x] Edit user (name, email, role)
  - [x] Delete user (validate no active products/bids)
  - [x] Cannot delete users with active products/bids

- [x] **Product Management**
  - [x] List all products with filters (status, category)
  - [x] View product details
  - [x] Remove product
  - [x] Filter by status (active/ended/cancelled)

- [x] **Seller Request Management**
  - [x] View pending requests
  - [x] Approve requests (upgrade to seller)
  - [x] Deny requests
  - [x] Pagination

---

### Subsystem 5: Common User Features ✅

- [x] **Authentication**
  - [x] Register with reCAPTCHA + OTP
  - [x] Login/Logout
  - [x] Session-based authentication
  - [x] Forgot password with OTP
  - [x] Email verification required

- [x] **Profile Management**
  - [x] Update name, email, date of birth, address
  - [x] Change password (require old password)
  - [x] Email change with OTP verification
  - [x] View ratings received

---

### Subsystem 6: System Features ✅

- [x] **Email Notifications**
  - [x] Bid placed → seller, new bidder, previous top bidder
  - [x] Bidder blocked → blocked bidder
  - [x] Auction ended (no winner) → seller
  - [x] Auction ended (with winner) → seller + winner
  - [x] Question posted → seller
  - [x] Question answered → all participants

- [x] **Auto-Bidding System**
  - [x] Accept max bid amount
  - [x] Auto-increment when outbid
  - [x] Handle ties (first bidder wins)
  - [x] Stop at max bid amount
  - [x] Show auto-bid indicator

- [x] **Auto-Extend Auction**
  - [x] Configurable threshold (default: 5 min)
  - [x] Configurable extension (default: 10 min)
  - [x] Triggered by bids near end time
  - [x] Environment variable configuration

- [x] **Background Jobs**
  - [x] Check ended auctions every minute
  - [x] Update product status to 'ended'
  - [x] Create transaction records
  - [x] Send notification emails

---

### Subsystem 7: Post-Auction Checkout ✅

- [x] **4-Step Checkout Process**
  - [x] **Step 1**: Bidder submits payment proof + shipping address
  - [x] **Step 2**: Seller confirms payment + provides tracking info
  - [x] **Step 3**: Bidder confirms delivery received
  - [x] **Step 4**: Both parties rate each other

- [x] **Transaction Features**
  - [x] Seller can cancel transaction (auto -1 to winner)
  - [x] Access restricted to seller and winner only
  - [x] Progress indicator showing current step
  - [x] Transaction status tracking

- [x] **Chat System**
  - [x] Real-time chat between seller and winner
  - [x] Message history display
  - [x] Timestamped messages
  - [x] Visual distinction between sender/receiver

- [x] **Rating System**
  - [x] Both parties rate each other (+1/-1)
  - [x] Include optional comment
  - [x] Allow rating updates
  - [x] Calculate rating percentage
  - [x] Display rating history

---

## Key Features

### Auto-Bidding
- Users can set a maximum bid amount
- System automatically increments bids when outbid
- Ensures lowest winning bid possible
- First bidder wins in case of tie

### Auto-Extend
- Configurable threshold (default: 5 minutes before end)
- Extends auction by configurable duration (default: 10 minutes)
- Prevents last-second sniping
- Can be enabled per product

### Rating System
- +1 or -1 ratings
- Percentage calculation: (positive / total) × 100%
- Affects bidding eligibility (≥80% required)
- Sellers can allow non-rated bidders
- Ratings can be updated

### Email Notifications
- All major actions trigger emails
- Includes direct links to relevant pages
- Configurable SMTP settings
- Comprehensive templates for all scenarios

### Security Features
- bcrypt password hashing
- Session-based authentication
- reCAPTCHA on registration
- OTP email verification
- CSRF protection via method-override
- Input validation with express-validator

## API Routes

### Public Routes
- `GET /` - Homepage
- `GET /products` - Product listing
- `GET /products/:id` - Product details
- `GET /search` - Search products
- `GET /auth/login` - Login page
- `GET /auth/register` - Registration page

### Authenticated Routes (Bidder)
- `GET /bidder/watchlist` - View watchlist
- `POST /bidder/watchlist/:productId` - Add to watchlist
- `DELETE /bidder/watchlist/:productId` - Remove from watchlist
- `GET /bidder/bid/:productId` - Bid form
- `POST /bidder/bid/:productId` - Place bid
- `POST /bidder/question/:productId` - Ask question
- `GET /account/bids` - View active bids
- `GET /account/won` - View won auctions
- `GET /account/ratings` - View ratings

### Authenticated Routes (Seller)
- `GET /seller/products` - Manage products
- `GET /seller/products/create` - Create product form
- `POST /seller/products/create` - Create product
- `GET /seller/products/:id/append` - Append description form
- `POST /seller/products/:id/append` - Append description
- `POST /seller/products/:productId/block/:bidderId` - Block bidder
- `POST /seller/question/:questionId/answer` - Answer question
- `GET /seller/products/ended` - View ended auctions

### Authenticated Routes (Checkout)
- `GET /checkout/:productId` - Checkout page
- `POST /checkout/:productId/payment` - Submit payment
- `POST /checkout/:productId/confirm-payment` - Confirm shipment
- `POST /checkout/:productId/confirm-delivery` - Confirm delivery
- `POST /checkout/:productId/rate` - Submit rating
- `POST /checkout/:productId/chat` - Send chat message

### Admin Routes
- `GET /admin/categories` - Manage categories
- `GET /admin/users` - Manage users
- `GET /admin/products` - Manage products
- `GET /admin/seller-requests` - Manage seller requests
- `POST /admin/seller-requests/:id/approve` - Approve request
- `POST /admin/seller-requests/:id/deny` - Deny request

## Database Models

### User
- name, email, password, dob, address
- role: bidder, seller, admin
- isEmailVerified
- timestamps

### Category
- name, img_url, description
- parentId (self-reference for 2-level hierarchy)
- timestamps

### Product
- name, description, images (array)
- categoryId, sellerId
- startPrice, stepPrice, buyNowPrice, currentPrice
- autoExtend, allowNonRatedBidders
- status: active, ended, cancelled
- endTime, blockedBidders
- timestamps

### Bid
- productId, bidderId
- bidAmount, maxBidAmount (for auto-bidding)
- isAutoBid
- timestamps

### Watchlist
- userId, productId
- timestamps
- Unique index: userId + productId

### Rating
- productId, fromUserId, toUserId
- rating (+1/-1), comment
- type: bidder_to_seller, seller_to_bidder
- timestamps

### ProductQuestion
- productId, askerId
- question, answer, answeredAt
- timestamps

### Transaction
- productId, sellerId, winnerId
- status: pending_payment, payment_confirmed, shipped, delivered, completed, cancelled
- paymentProof, shippingInfo
- deliveryConfirmedAt
- ratings (sellerRated, bidderRated)
- chat (array of messages)
- timestamps

### SellerRequest
- userId, status, reviewedAt, reviewedBy
- status: pending, approved, denied
- timestamps

### OTP
- email, code, type
- expiresAt (TTL index), used
- type: email_verification, password_reset
- timestamps

## Development Guidelines

### Code Style
- Follow `.cursorrules` strictly
- camelCase for functions, kebab-case for files
- 2-space indentation for Handlebars
- Each HTML attribute on separate line
- Pure Tailwind CSS, Apple-like design
- Backend validation is primary

### Adding New Features
1. Read similar existing files first
2. Match exact code style and patterns
3. Use same error handling (`res.error()`)
4. Include pagination for lists
5. Follow route→service→model flow
6. Test thoroughly before committing

## Troubleshooting

### Email Not Sending
- Check SMTP credentials in `.env`
- For Gmail, use App Password (not regular password)
- Enable "Less secure app access" if needed

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify database name

### Session Issues
- Clear cookies and restart server
- Check SESSION_SECRET is set
- Verify session middleware order in `app.js`

## License

This project is created for educational purposes as part of PTUDW coursework.

## Contributors

- Development Team: [Your Name]
- Course: PTUDW - Phát triển ứng dụng Web

---

**Note**: This is a comprehensive auction platform with all features from the project requirements implemented and tested. All 7 subsystems are fully functional with proper validation, security, and user experience.

