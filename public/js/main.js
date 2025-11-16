document.addEventListener('DOMContentLoaded', () => {
  const userMenuButton = document.getElementById('userMenuButton');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  const logoutBtn = document.getElementById('logoutBtn');

  if (userMenuButton && userDropdownMenu) {
    userMenuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!userMenuButton.contains(e.target) && !userDropdownMenu.contains(e.target)) {
        userDropdownMenu.classList.add('hidden');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          window.location.href = '/';
        } else {
          console.error('Logout error:', data.message);
          alert('Có lỗi xảy ra khi đăng xuất');
        }
      } catch (error) {
        console.error('Logout error:', error);
        alert('Không thể kết nối đến server');
      }
    });
  }
});

