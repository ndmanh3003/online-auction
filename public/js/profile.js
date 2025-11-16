document.addEventListener('DOMContentLoaded', async () => {
  const loadingDiv = document.getElementById('loading');
  const profileForm = document.getElementById('profileForm');
  const errorDiv = document.getElementById('error');
  const updateButtonContainer = document.getElementById('updateButtonContainer');
  const updateButton = document.getElementById('updateButton');
  const successMessage = document.getElementById('successMessage');
  const successText = document.getElementById('successText');

  let originalData = {};

  const nameInput = document.getElementById('name');
  const addressInput = document.getElementById('address');
  const dateOfBirthInput = document.getElementById('dateOfBirth');

  const checkForChanges = () => {
    const hasChanges = 
      nameInput.value !== originalData.name ||
      addressInput.value !== originalData.address ||
      (dateOfBirthInput.value || '') !== (originalData.dateOfBirth || '');

    if (hasChanges) {
      updateButtonContainer.classList.remove('hidden');
    } else {
      updateButtonContainer.classList.add('hidden');
    }
  };

  nameInput.addEventListener('input', checkForChanges);
  addressInput.addEventListener('input', checkForChanges);
  dateOfBirthInput.addEventListener('change', checkForChanges);

  const clearErrors = () => {
    document.getElementById('nameError').classList.add('hidden');
    document.getElementById('addressError').classList.add('hidden');
    document.getElementById('dateOfBirthError').classList.add('hidden');
    errorDiv.classList.add('hidden');
    successMessage.classList.add('hidden');
  };

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    const dateOfBirth = dateOfBirthInput.value;

    let hasError = false;

    if (!name) {
      const nameError = document.getElementById('nameError');
      nameError.textContent = 'Tên là bắt buộc';
      nameError.classList.remove('hidden');
      hasError = true;
    }

    if (!address) {
      const addressError = document.getElementById('addressError');
      addressError.textContent = 'Địa chỉ là bắt buộc';
      addressError.classList.remove('hidden');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    updateButton.disabled = true;
    updateButton.textContent = 'Đang cập nhật...';

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          address,
          dateOfBirth: dateOfBirth || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        originalData = {
          name: data.user.name,
          address: data.user.address,
          dateOfBirth: data.user.dateOfBirth ? new Date(data.user.dateOfBirth).toISOString().split('T')[0] : '',
        };

        nameInput.value = data.user.name || '';
        addressInput.value = data.user.address || '';
        if (data.user.dateOfBirth) {
          dateOfBirthInput.value = new Date(data.user.dateOfBirth).toISOString().split('T')[0];
        } else {
          dateOfBirthInput.value = '';
        }

        if (data.user.updatedAt) {
          const updatedAt = new Date(data.user.updatedAt);
          document.getElementById('updatedAt').value = updatedAt.toLocaleString('vi-VN');
        }

        successText.textContent = data.message || 'Cập nhật thông tin thành công';
        successMessage.classList.remove('hidden');
        updateButtonContainer.classList.add('hidden');

        setTimeout(() => {
          successMessage.classList.add('hidden');
        }, 5000);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((error) => {
            if (error.path === 'name') {
              const nameError = document.getElementById('nameError');
              nameError.textContent = error.msg;
              nameError.classList.remove('hidden');
            } else if (error.path === 'address') {
              const addressError = document.getElementById('addressError');
              addressError.textContent = error.msg;
              addressError.classList.remove('hidden');
            } else if (error.path === 'dateOfBirth') {
              const dateOfBirthError = document.getElementById('dateOfBirthError');
              dateOfBirthError.textContent = error.msg;
              dateOfBirthError.classList.remove('hidden');
            }
          });
        } else {
          errorDiv.classList.remove('hidden');
          errorDiv.querySelector('p').textContent = data.message || 'Cập nhật thất bại';
        }
      }
    } catch (error) {
      console.error('Update profile error:', error);
      errorDiv.classList.remove('hidden');
      errorDiv.querySelector('p').textContent = 'Không thể kết nối đến server';
    } finally {
      updateButton.disabled = false;
      updateButton.textContent = 'Cập nhật';
    }
  });

  try {
    const response = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok && data.user) {
      const user = data.user;
      
      nameInput.value = user.name || '';
      addressInput.value = user.address || '';
      
      if (user.dateOfBirth) {
        dateOfBirthInput.value = new Date(user.dateOfBirth).toISOString().split('T')[0];
      }
      
      originalData = {
        name: user.name || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      };
      
      document.getElementById('email').value = user.email || '';
      
      const emailVerifiedText = user.emailVerified ? 'Đã xác thực' : 'Chưa xác thực';
      const emailVerifiedElement = document.getElementById('emailVerified');
      emailVerifiedElement.textContent = emailVerifiedText;
      emailVerifiedElement.className = user.emailVerified 
        ? 'text-green-600 dark:text-green-400 font-medium' 
        : 'text-orange-600 dark:text-orange-400 font-medium';
      
      if (user.createdAt) {
        const createdAt = new Date(user.createdAt);
        document.getElementById('createdAt').value = createdAt.toLocaleString('vi-VN');
      }
      
      if (user.updatedAt) {
        const updatedAt = new Date(user.updatedAt);
        document.getElementById('updatedAt').value = updatedAt.toLocaleString('vi-VN');
      }

      loadingDiv.classList.add('hidden');
      profileForm.classList.remove('hidden');
    } else {
      if (response.status === 401) {
        window.location.href = '/dang-nhap';
        return;
      }
      
      loadingDiv.classList.add('hidden');
      errorDiv.classList.remove('hidden');
      errorDiv.querySelector('p').textContent = data.message || 'Không thể tải thông tin';
    }
  } catch (error) {
    console.error('Profile error:', error);
    loadingDiv.classList.add('hidden');
    errorDiv.classList.remove('hidden');
    errorDiv.querySelector('p').textContent = 'Không thể kết nối đến server';
  }
});

