document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('changePasswordForm');
  const submitButton = document.getElementById('submitButton');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');

  const clearMessages = () => {
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    document.getElementById('currentPasswordError').classList.add('hidden');
    document.getElementById('newPasswordError').classList.add('hidden');
    document.getElementById('confirmPasswordError').classList.add('hidden');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let hasError = false;

    if (!currentPassword) {
      const currentPasswordError = document.getElementById('currentPasswordError');
      currentPasswordError.textContent = 'Mật khẩu hiện tại là bắt buộc';
      currentPasswordError.classList.remove('hidden');
      hasError = true;
    }

    if (!newPassword) {
      const newPasswordError = document.getElementById('newPasswordError');
      newPasswordError.textContent = 'Mật khẩu mới là bắt buộc';
      newPasswordError.classList.remove('hidden');
      hasError = true;
    } else if (newPassword.length < 6) {
      const newPasswordError = document.getElementById('newPasswordError');
      newPasswordError.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      newPasswordError.classList.remove('hidden');
      hasError = true;
    }

    if (!confirmPassword) {
      const confirmPasswordError = document.getElementById('confirmPasswordError');
      confirmPasswordError.textContent = 'Xác nhận mật khẩu là bắt buộc';
      confirmPasswordError.classList.remove('hidden');
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      const confirmPasswordError = document.getElementById('confirmPasswordError');
      confirmPasswordError.textContent = 'Mật khẩu xác nhận không khớp';
      confirmPasswordError.classList.remove('hidden');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Đang xử lý...';

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        successMessage.textContent = data.message || 'Đổi mật khẩu thành công';
        successMessage.classList.remove('hidden');
        form.reset();

        setTimeout(() => {
          window.location.href = '/thong-tin';
        }, 2000);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((error) => {
            if (error.path === 'currentPassword') {
              const currentPasswordError = document.getElementById('currentPasswordError');
              currentPasswordError.textContent = error.msg;
              currentPasswordError.classList.remove('hidden');
            } else if (error.path === 'newPassword') {
              const newPasswordError = document.getElementById('newPasswordError');
              newPasswordError.textContent = error.msg;
              newPasswordError.classList.remove('hidden');
            }
          });
        } else {
          const message = data.message || 'Đổi mật khẩu thất bại';
          if (message.includes('mật khẩu') || message.includes('Mật khẩu') || message.includes('password') || message.includes('Password')) {
            if (message.includes('hiện tại') || message.includes('Hiện tại') || message.includes('current')) {
              const currentPasswordError = document.getElementById('currentPasswordError');
              currentPasswordError.textContent = message;
              currentPasswordError.classList.remove('hidden');
            } else {
              const newPasswordError = document.getElementById('newPasswordError');
              newPasswordError.textContent = message;
              newPasswordError.classList.remove('hidden');
            }
          } else {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
          }
        }
      }
    } catch (error) {
      console.error('Change password error:', error);
      errorText.textContent = 'Không thể kết nối đến server';
      errorMessage.classList.remove('hidden');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Đổi mật khẩu';
    }
  });
});

