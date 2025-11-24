document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('[data-login-form]');
  if (!loginForm) {
    return;
  }

  const validation = new JustValidate(loginForm, {
    errorFieldCssClass: 'input-error',
    successFieldCssClass: 'input-success',
  });

  validation
    .addField('[name="email"]', [{ rule: 'required' }, { rule: 'email' }])
    .addField('[name="password"]', [{ rule: 'required' }])
    .onSuccess(async (e) => {
      e.preventDefault();

      await window.submitForm(loginForm, {
        method: 'POST',
        url: '/api/auth/login',
        onSuccess: () => {
            window.location.href = '/';
        },
      });
    });
});
