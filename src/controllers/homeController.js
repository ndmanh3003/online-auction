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

export const getLogin = (req, res) => {
  res.render('login', {
    title: 'Đăng nhập - Đấu giá',
  });
};

export const getProfile = (req, res) => {
  res.render('profile', {
    title: 'Thông tin cá nhân - Đấu giá',
  });
};

export const getChangePassword = (req, res) => {
  res.render('changePassword', {
    title: 'Đổi mật khẩu - Đấu giá',
  });
};

export const getChangeEmail = (req, res) => {
  res.render('changeEmail', {
    title: 'Đổi email - Đấu giá',
  });
};
