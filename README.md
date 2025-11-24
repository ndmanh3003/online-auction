# Bid Auction System

Hệ thống đấu giá sử dụng Node.js, Express, TypeORM, và Handlebars.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Tạo file `.env` với các biến:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRE`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`

## 📁 Cấu Trúc Code

```
src/
├── config/          # Database, Email config
├── controllers/     # Web page controllers
├── entities/       # TypeORM entities (User, OTP)
├── middleware/     # Auth, ErrorHandler, RateLimiter
├── routes/         # API routes (auth, user) và web routes
└── utils/          # JWT, OTP, reCaptcha helpers

public/
├── css/            # Custom CSS
└── js/             # Frontend JS (mỗi page 1 file)

views/
├── layouts/       # Root layout
└── partials/      # Header, Footer components
```

## 🎯 Patterns & Conventions

### Error Handling

- **Tất cả async routes** dùng `asyncHandler` để tự động catch errors
- **Throw errors** thay vì `return res.status()`
- `errorHandler` middleware tự xử lý:
    - API routes → JSON response
    - Web routes → Render error page

```js
// ✅ Đúng
asyncHandler(async (req, res) => {
  if (!user) {
    throw new Error('User not found');
  }
  res.json({user});
})

// ❌ Sai
async (req, res) => {
  if (!user) {
    return res.status(404).json({message: 'User not found'});
  }
}
```

### Routes

- **API routes** (`/api/*`) → JSON responses
- **Web routes** → Render Handlebars views
- Validation dùng `express-validator`
- Auth middleware: `requireAuth` (required), `optionalAuth` (optional)

### Entities (TypeORM)

- Dùng `EntitySchema` thay decorators (ESM compatible)
- Entities trong `src/entities/`
- Methods trong class (ví dụ: `hashPassword()`, `comparePassword()`)

### Frontend

- Mỗi page có file JS riêng trong `public/js/`
- Dùng `window.submitForm()` helper cho form submissions
- Validation: JustValidate
- Styling: Tailwind CSS + DaisyUI

## 🔧 Mở Rộng

### Thêm Route Mới

1. Tạo file trong `src/routes/`
2. Import vào `src/routes/index.js`
3. Wrap handler trong `asyncHandler`
4. Throw errors thay vì return status

### Thêm Entity Mới

1. Tạo class + EntitySchema trong `src/entities/`
2. Import schema vào `src/config/database.js`
3. Thêm vào `entities` array

### Thêm Middleware

1. Tạo file trong `src/middleware/`
2. Export function `(req, res, next) => {}`
3. Sử dụng trong routes hoặc `server.js`

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeORM (PostgreSQL)
- **Frontend**: Handlebars, Tailwind CSS, DaisyUI
- **Auth**: JWT (httpOnly cookies)
- **Validation**: express-validator, JustValidate
- **Email**: Nodemailer
- **Security**: Helmet, Rate Limiting, reCaptcha

## 📝 Code Style

- ES Modules (`import`/`export`)
- `async/await` thay vì callbacks
- Tên biến/hàm: tiếng Anh
- UI text: tiếng Anh
- Không comment trên đầu hàm
- Code ngắn gọn, production-ready

