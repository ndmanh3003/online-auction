document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.querySelector('[data-profile-form]');
  if (!profileForm) {
    return;
  }

  const validation = new JustValidate(profileForm, {
    errorFieldCssClass: 'input-error',
    successFieldCssClass: 'input-success',
  });

  validation
    .addField('[name="name"]', [{ rule: 'required' }])
    .addField('[name="address"]', [{ rule: 'required' }])
    .onSuccess(async (e) => {
      e.preventDefault();

      await window.submitForm(profileForm, {
        method: 'PUT',
        url: '/api/users/me',
        onSuccess: () => {
          window.location.reload();
        },
      });
    });
});
