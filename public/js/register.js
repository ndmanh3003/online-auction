document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  const sendOtpBtn = document.getElementById('sendOtpBtn');
  const otpSection = document.getElementById('otpSection');
  const messageDiv = document.getElementById('message');

  const showError = (fieldId, message) => {
    const errorSpan = document.getElementById(fieldId + 'Error');
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.classList.remove('hidden');
    }
  };

  const hideError = (fieldId) => {
    const errorSpan = document.getElementById(fieldId + 'Error');
    if (errorSpan) {
      errorSpan.classList.add('hidden');
    }
  };

  const showMessage = (message, isSuccess = false) => {
    messageDiv.textContent = message;
    messageDiv.className = isSuccess 
      ? 'mt-4 text-center text-green-600 font-medium' 
      : 'mt-4 text-center text-red-600 font-medium';
    messageDiv.classList.remove('hidden');
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 5000);
  };

  sendOtpBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    hideError('email');
    messageDiv.classList.add('hidden');
    const otpStatus = document.getElementById('otpStatus');
    if (otpStatus) {
      otpStatus.classList.add('hidden');
    }
    
    const email = document.getElementById('email').value.trim();
    
    if (!email) {
      showError('email', 'Vui lòng nhập email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('email', 'Email không hợp lệ');
      return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Đang gửi...';

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        otpSection.classList.remove('hidden');
        document.getElementById('otpStatus').textContent = 'OTP đã được gửi đến email của bạn';
        document.getElementById('otpStatus').classList.remove('hidden');
        showMessage('OTP đã được gửi đến email của bạn', true);
      } else {
        showError('email', data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showError('email', 'Không thể kết nối đến server');
    } finally {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = 'Gửi OTP';
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    ['name', 'address', 'email', 'password', 'confirmPassword', 'otp', 'recaptcha'].forEach(hideError);

    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const otp = document.getElementById('otp').value.trim();
    const recaptchaToken = grecaptcha.getResponse();

    let hasError = false;

    if (!name) {
      showError('name', 'Tên là bắt buộc');
      hasError = true;
    }

    if (!address) {
      showError('address', 'Địa chỉ là bắt buộc');
      hasError = true;
    }

    if (!email) {
      showError('email', 'Email là bắt buộc');
      hasError = true;
    }

    if (!otp) {
      showError('otp', 'OTP là bắt buộc');
      hasError = true;
    }

    if (password.length < 6) {
      showError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
      hasError = true;
    }

    if (password !== confirmPassword) {
      showError('confirmPassword', 'Mật khẩu xác nhận không khớp');
      hasError = true;
    }

    if (!recaptchaToken) {
      showError('recaptcha', 'Vui lòng xác thực reCaptcha');
      hasError = true;
    }

    if (hasError) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          address,
          email,
          password,
          otp,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Đăng ký thành công! Đang chuyển hướng...', true);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(error => {
            if (error.param) {
              showError(error.param, error.msg);
            }
          });
        } else {
          showMessage(data.message || 'Có lỗi xảy ra');
        }
        grecaptcha.reset();
      }
    } catch (error) {
      showMessage('Không thể kết nối đến server');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Đăng ký';
    }
  });
});

