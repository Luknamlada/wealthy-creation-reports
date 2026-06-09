(function () {
  const form = document.getElementById('loginForm');
  const error = document.getElementById('loginError');
  const state = WCStore.load();

  const routeByRole = {
    employee: 'employee.html',
    executive: 'executive.html',
    admin: 'admin.html'
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const code = document.getElementById('employeeCode').value.trim().toUpperCase();
    const password = document.getElementById('password').value;
    const user = state.users.find(item => item.code.toUpperCase() === code && item.password === password);

    if (!user) {
      error.textContent = 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง';
      return;
    }

    WCStore.setSession(user.id);
    window.location.href = routeByRole[user.role] || 'employee.html';
  });
})();
