document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

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

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    ['email', 'password'].forEach(hideError);
    messageDiv.classList.add('hidden');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let hasError = false;

    if (!email) {
      showError('email', 'Email là bắt buộc');
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError('email', 'Email không hợp lệ');
        hasError = true;
      }
    }

    if (!password) {
      showError('password', 'Mật khẩu là bắt buộc');
      hasError = true;
    }

    if (hasError) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Đăng nhập thành công! Đang chuyển hướng...', true);
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
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage('Không thể kết nối đến server');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Đăng nhập';
    }
  });
});

