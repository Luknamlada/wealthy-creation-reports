(function () {
  const form = document.getElementById('loginForm');
  const error = document.getElementById('loginError');
  const state = WCStore.load();

  const routeByRole = {
    employee: 'employee.html',
    executive: 'executive.html',
    admin: 'admin.html'
  };

  document.getElementById('togglePassword').addEventListener('click', event => {
    const password = document.getElementById('password');
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    event.currentTarget.textContent = showing ? 'แสดง' : 'ซ่อน';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const code = document.getElementById('employeeCode').value.trim().toUpperCase();
    const password = document.getElementById('password').value;
    const user = state.users.find(item => item.code.toUpperCase() === code && item.password === password);

    if (!user) {
      error.textContent = 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง';
      return;
    }

    WCStore.setSession(user.id, document.getElementById('rememberMe').checked);
    window.location.href = routeByRole[user.role] || 'employee.html';
  });
})();
