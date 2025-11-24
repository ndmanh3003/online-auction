document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.querySelector('[data-register-form]');
  if (!registerForm) {
    return;
  }

  const sendOtpBtn = document.querySelector('[data-send-otp-btn]');
  const otpSection = document.querySelector('[data-otp-section]');

  const validation = new JustValidate(registerForm, {
    errorFieldCssClass: 'input-error',
    successFieldCssClass: 'input-success',
  });

  validation
    .addField('[name="name"]', [{ rule: 'required' }])
    .addField('[name="address"]', [{ rule: 'required' }])
    .addField('[name="email"]', [{ rule: 'required' }, { rule: 'email' }])
    .addField('[name="otp"]', [
      { rule: 'required' },
      { rule: 'minLength', value: 6 },
      { rule: 'maxLength', value: 6 },
    ])
    .addField('[name="password"]', [{ rule: 'required' }, { rule: 'minLength', value: 6 }])
    .addField('[name="confirmPassword"]', [
      { rule: 'required' },
      {
        validator: (value, fields) => fields['[name="password"]']?.elem?.value === value,
      },
    ])
    .onSuccess(async (e) => {
      e.preventDefault();

      const recaptchaToken = grecaptcha.getResponse();
      if (!recaptchaToken) {
        alert('Please complete reCaptcha verification');
        return;
      }

      await window.submitForm(registerForm, {
        method: 'POST',
        url: '/api/auth/register',
        transformData: (data) => {
          data.recaptchaToken = recaptchaToken;
          return data;
        },
        onSuccess: () => {
          window.location.href = '/';
        },
      });
    });

  sendOtpBtn.addEventListener('click', async () => {
    const email = registerForm.querySelector('[name="email"]').value.trim();

    if (!email) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    const tempForm = document.createElement('form');
    tempForm.style.display = 'none';
    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = 'email';
    emailInput.value = email;
    tempForm.appendChild(emailInput);
    document.body.appendChild(tempForm);

    await window.submitForm(tempForm, {
      method: 'POST',
      url: '/api/auth/send-otp',
      getSubmitButton: () => sendOtpBtn,
      onSuccess: () => {
        otpSection.classList.remove('hidden');
      },
    });

    document.body.removeChild(tempForm);
  });
});
