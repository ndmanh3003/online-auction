document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('changeEmailForm');
  const submitButton = document.getElementById('submitButton');
  const successMessage = document.getElementById('successMessage');
  const successText = document.getElementById('successText');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const otpSection = document.getElementById('otpSection');
  const newEmailInput = document.getElementById('newEmail');
  const otpInput = document.getElementById('otp');
  const resendOtpButton = document.getElementById('resendOtpButton');

  let currentStep = 'sendOtp';
  let currentNewEmail = '';

  const clearMessages = () => {
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    document.getElementById('newEmailError').classList.add('hidden');
    document.getElementById('newEmailSuccess').classList.add('hidden');
    document.getElementById('otpError').classList.add('hidden');
  };

  try {
    const response = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok && data.user) {
      document.getElementById('currentEmail').value = data.user.email || '';
    } else {
      if (response.status === 401) {
        window.location.href = '/dang-nhap';
        return;
      }
    }
  } catch (error) {
    console.error('Get user error:', error);
  }

  const sendOTP = async (email) => {
    try {
      const response = await fetch('/api/users/change-email/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newEmail: email }),
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      console.error('Send OTP error:', error);
      return { error: 'Không thể kết nối đến server' };
    }
  };

  resendOtpButton.addEventListener('click', async () => {
    if (!currentNewEmail) return;

    clearMessages();
    resendOtpButton.disabled = true;
    resendOtpButton.textContent = 'Đang gửi...';

    const result = await sendOTP(currentNewEmail);

    if (result.error) {
      errorText.textContent = result.error;
      errorMessage.classList.remove('hidden');
    } else if (result.response.ok) {
      const newEmailSuccess = document.getElementById('newEmailSuccess');
      newEmailSuccess.textContent = result.data.message || 'OTP đã được gửi lại';
      newEmailSuccess.classList.remove('hidden');
      setTimeout(() => {
        newEmailSuccess.classList.add('hidden');
      }, 5000);
    } else {
      const message = result.data.message || 'Gửi OTP thất bại';
      const newEmailError = document.getElementById('newEmailError');
      newEmailError.textContent = message;
      newEmailError.classList.remove('hidden');
    }

    resendOtpButton.disabled = false;
    resendOtpButton.textContent = 'Gửi lại OTP';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    if (currentStep === 'sendOtp') {
      const newEmail = newEmailInput.value.trim();

      if (!newEmail) {
        const newEmailError = document.getElementById('newEmailError');
        newEmailError.textContent = 'Email mới là bắt buộc';
        newEmailError.classList.remove('hidden');
        return;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(newEmail)) {
        const newEmailError = document.getElementById('newEmailError');
        newEmailError.textContent = 'Email không hợp lệ';
        newEmailError.classList.remove('hidden');
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Đang gửi OTP...';

      const result = await sendOTP(newEmail);

      if (result.error) {
        errorText.textContent = result.error;
        errorMessage.classList.remove('hidden');
        submitButton.disabled = false;
        submitButton.textContent = 'Gửi OTP';
        return;
      }

      if (result.response.ok) {
        currentStep = 'verifyOtp';
        currentNewEmail = newEmail;
        otpSection.classList.remove('hidden');
        newEmailInput.disabled = true;
        submitButton.disabled = false;
        submitButton.textContent = 'Xác thực và đổi email';
        const newEmailSuccess = document.getElementById('newEmailSuccess');
        newEmailSuccess.textContent = result.data.message || 'OTP đã được gửi đến email mới của bạn';
        newEmailSuccess.classList.remove('hidden');
        setTimeout(() => {
          newEmailSuccess.classList.add('hidden');
        }, 5000);
      } else {
        submitButton.disabled = false;
        submitButton.textContent = 'Gửi OTP';
        if (result.data.errors && Array.isArray(result.data.errors)) {
          result.data.errors.forEach((error) => {
            if (error.path === 'newEmail') {
              const newEmailError = document.getElementById('newEmailError');
              newEmailError.textContent = error.msg;
              newEmailError.classList.remove('hidden');
            }
          });
        } else {
          const message = result.data.message || 'Gửi OTP thất bại';
          const newEmailError = document.getElementById('newEmailError');
          newEmailError.textContent = message;
          newEmailError.classList.remove('hidden');
        }
      }
    } else if (currentStep === 'verifyOtp') {
      const otp = otpInput.value.trim();

      if (!otp) {
        const otpError = document.getElementById('otpError');
        otpError.textContent = 'OTP là bắt buộc';
        otpError.classList.remove('hidden');
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Đang xử lý...';

      try {
        const response = await fetch('/api/users/change-email/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            newEmail: currentNewEmail,
            otp,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          successText.textContent = data.message || 'Đổi email thành công';
          successMessage.classList.remove('hidden');

          setTimeout(() => {
            window.location.href = '/thong-tin';
          }, 2000);
        } else {
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((error) => {
              if (error.path === 'otp') {
                const otpError = document.getElementById('otpError');
                otpError.textContent = error.msg;
                otpError.classList.remove('hidden');
              } else if (error.path === 'newEmail') {
                const newEmailError = document.getElementById('newEmailError');
                newEmailError.textContent = error.msg;
                newEmailError.classList.remove('hidden');
              }
            });
          } else {
            const message = data.message || 'Đổi email thất bại';
            if (message.includes('email') || message.includes('Email') || message.includes('OTP')) {
              if (message.includes('OTP')) {
                const otpError = document.getElementById('otpError');
                otpError.textContent = message;
                otpError.classList.remove('hidden');
              } else {
                const newEmailError = document.getElementById('newEmailError');
                newEmailError.textContent = message;
                newEmailError.classList.remove('hidden');
              }
            } else {
              errorText.textContent = message;
              errorMessage.classList.remove('hidden');
            }
          }
        }
      } catch (error) {
        console.error('Verify OTP error:', error);
        errorText.textContent = 'Không thể kết nối đến server';
        errorMessage.classList.remove('hidden');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Xác thực và đổi email';
      }
    }
  });
});

