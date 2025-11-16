export const getHome = (req, res) => {
  res.render('home', {
    title: 'Trang chủ - Đấu giá',
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
  });
};

export const getRegister = (req, res) => {
  res.render('register', {
    title: 'Đăng ký - Đấu giá',
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
  });
};
