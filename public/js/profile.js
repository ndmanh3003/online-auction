document.addEventListener('DOMContentLoaded', async () => {
  const loadingDiv = document.getElementById('loading');
  const profileForm = document.getElementById('profileForm');
  const errorDiv = document.getElementById('error');

  try {
    const response = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok && data.user) {
      const user = data.user;
      
      document.getElementById('name').value = user.name || '';
      document.getElementById('email').value = user.email || '';
      document.getElementById('address').value = user.address || '';
      
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

