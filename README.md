# Dự án Đấu Giá

Dự án đấu giá trực tuyến sử dụng Express.js, MongoDB, Handlebars, Tailwind CSS.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example` và điền thông tin:
```bash
cp .env.example .env
```

3. Build Tailwind CSS:
```bash
npm run build:css
```

4. Chạy server:
```bash
npm start
```

## Cấu hình

Cần cấu hình các biến môi trường trong file `.env`:
- `MONGODB_URI`: URI kết nối MongoDB
- `JWT_SECRET`: Secret key cho JWT
- `EMAIL_USER`, `EMAIL_PASS`: Thông tin email để gửi OTP
- `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`: Google reCaptcha keys

## Tính năng

- Đăng ký tài khoản với xác thực email qua OTP
- reCaptcha bảo vệ form
- JWT authentication
- Rate limiting
- Security headers (Helmet)
- Validation input đầy đủ
