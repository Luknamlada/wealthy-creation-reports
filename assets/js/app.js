(function () {
  let state = WCStore.load();
  let currentUser = state.users.find(user => user.id === WCStore.getSession());
  const page = document.body.dataset.page;
  let selectedPeriod = WCStore.initialPeriod();
  let collaborators = [];
  let images = [];

  const access = {
    employee: ['employee', 'executive', 'admin'],
    executive: ['executive', 'admin'],
    admin: ['admin']
  };

  if (!currentUser || !access[page]?.includes(currentUser.role)) {
    window.location.href = 'index.html';
    return;
  }

  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modalRoot');

  function save() {
    WCStore.save(state);
  }

  function employees() {
    return state.users.filter(user => user.role !== 'admin');
  }

  function userById(id) {
    return state.users.find(user => user.id === id);
  }

  function todayReports() {
    return state.reports.filter(report => report.date === WCStore.todayKey());
  }

  function hasReport(userId, period) {
    return todayReports().some(report => report.userId === userId && report.period === period);
  }

  function findReport(userId, period) {
    return todayReports().find(report => report.userId === userId && report.period === period);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initials(name) {
    return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  }

  function avatar(user, size = '') {
    const cls = `avatar ${size}`.trim();
    if (user.photo) return `<span class="${cls}"><img src="${user.photo}" alt="${escapeHtml(user.name)}"></span>`;
    return `<span class="${cls}">${initials(user.name)}</span>`;
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }

  function toast(title, message = '') {
    const root = document.getElementById('toastRoot');
    const node = document.createElement('div');
    node.className = 'toast';
    node.innerHTML = `<strong>${escapeHtml(title)}</strong>${message ? `<span>${escapeHtml(message)}</span>` : ''}`;
    root.appendChild(node);
    setTimeout(() => node.remove(), 3200);
  }

  function logout() {
    WCStore.clearSession();
    window.location.href = 'index.html';
  }

  function shell(title, subtitle, content, active) {
    app.innerHTML = `
      <div class="shell">
        <aside class="sidebar">
          <div class="brand">
            <span class="brand-mark">WC</span>
            <div><strong>Wealthy Creation</strong><small>Report System</small></div>
          </div>
          <nav class="nav">${navItems(active)}</nav>
          <div class="user-chip">${avatar(currentUser)}<div><strong>${escapeHtml(currentUser.name)}</strong><div class="muted">${WCStore.roles[currentUser.role]}</div></div></div>
        </aside>
        <main class="content">
          <div class="topbar">
            <div><h1>${title}</h1><p>${subtitle}</p></div>
            <button id="logoutButton" class="btn" type="button">ออกจากระบบ</button>
          </div>
          ${content}
        </main>
      </div>
    `;
    document.getElementById('logoutButton').addEventListener('click', logout);
    app.querySelectorAll('[data-route]').forEach(button => {
      button.addEventListener('click', () => window.location.href = button.dataset.route);
    });
  }

  function navItems(active) {
    const items = [
      ['employee', 'employee.html', 'พนักงาน'],
      ['executive', 'executive.html', 'ผู้บริหาร'],
      ['admin', 'admin.html', 'แอดมิน']
    ].filter(([key]) => access[key].includes(currentUser.role));

    return items.map(([key, route, label]) => `
      <button class="${active === key ? 'active' : ''}" data-route="${route}" type="button">${label}</button>
    `).join('');
  }

  function renderEmployee() {
    const mine = todayReports().filter(report => report.userId === currentUser.id);
    shell('พื้นที่พนักงาน', 'เขียนรายงานเช้า/เย็น แนบภาพ และอัปเดตโปรไฟล์ของคุณ', `
      <div class="grid three">
        <div class="stat"><span>รายงานเช้า</span><strong>${hasReport(currentUser.id, 'morning') ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}</strong></div>
        <div class="stat"><span>รายงานเย็น</span><strong>${hasReport(currentUser.id, 'evening') ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}</strong></div>
        <div class="stat"><span>รายงานวันนี้</span><strong>${mine.length}</strong></div>
      </div>
      <div class="grid two" style="margin-top:18px">
        ${reportForm()}
        ${profileForm()}
      </div>
      <section class="panel" style="margin-top:18px">
        <div class="section-head"><h2>รายงานของฉันวันนี้</h2></div>
        ${reportList(mine)}
      </section>
    `, 'employee');

    bindReportForm();
    bindProfileForm();
  }

  function reportForm() {
    collaborators = [];
    images = [];
    const options = employees()
      .filter(user => user.id !== currentUser.id)
      .map(user => `<option value="${user.id}">${user.code} - ${escapeHtml(user.name)}</option>`)
      .join('');

    return `
      <section class="panel">
        <div class="section-head"><h2>เขียนรายงาน</h2><span class="badge amber">${WCStore.todayKey()}</span></div>
        <form id="reportForm" class="form-stack">
          <div class="grid two">
            <label>ช่วงเวลา
              <select id="reportPeriod">
                <option value="morning" ${selectedPeriod === 'morning' ? 'selected' : ''}>${WCStore.periodLabel('morning')}</option>
                <option value="evening" ${selectedPeriod === 'evening' ? 'selected' : ''}>${WCStore.periodLabel('evening')}</option>
              </select>
            </label>
            <label>หัวข้องาน<input id="reportTitle" required placeholder="เช่น สรุปงานขายประจำวัน"></label>
          </div>
          <label>รายละเอียด<textarea id="reportDetail" required placeholder="ระบุงานที่ทำ ปัญหาที่พบ และผลลัพธ์"></textarea></label>
          <label>เพิ่มผู้ร่วมงาน
            <div class="actions">
              <select id="collaboratorSelect"><option value="">เลือกพนักงาน</option>${options}</select>
              <button id="addCollaborator" class="btn" type="button">เพิ่ม</button>
            </div>
          </label>
          <div id="collaboratorList" class="pill-list"></div>
          <label>แนบภาพ<input id="reportImages" type="file" accept="image/*" multiple></label>
          <div id="imageList" class="image-list"></div>
          <button class="btn success" type="submit">ส่งรายงาน</button>
        </form>
      </section>
    `;
  }

  function bindReportForm() {
    document.getElementById('addCollaborator').addEventListener('click', () => {
      const select = document.getElementById('collaboratorSelect');
      if (select.value && !collaborators.includes(select.value)) collaborators.push(select.value);
      select.value = '';
      renderCollaborators();
    });

    document.getElementById('reportImages').addEventListener('change', async event => {
      images = await Promise.all([...event.target.files].slice(0, 6).map(fileToDataUrl));
      document.getElementById('imageList').innerHTML = images.map(src => `<img class="preview-img" src="${src}" alt="ภาพแนบ">`).join('');
    });

    document.getElementById('reportForm').addEventListener('submit', event => {
      event.preventDefault();
      const period = document.getElementById('reportPeriod').value;
      const existingIndex = state.reports.findIndex(report => report.userId === currentUser.id && report.date === WCStore.todayKey() && report.period === period);
      const report = {
        id: existingIndex >= 0 ? state.reports[existingIndex].id : `R${Date.now()}`,
        userId: currentUser.id,
        date: WCStore.todayKey(),
        period,
        title: document.getElementById('reportTitle').value.trim(),
        detail: document.getElementById('reportDetail').value.trim(),
        collaborators: [...collaborators],
        images: [...images],
        createdAt: new Date().toISOString()
      };
      if (existingIndex >= 0) state.reports[existingIndex] = report;
      else state.reports.push(report);
      selectedPeriod = period;
      save();
      toast('ส่งรายงานเรียบร้อยแล้ว', 'ผู้บริหารสามารถเห็นรายงานนี้ได้ในหน้าสรุป');
      renderEmployee();
    });
  }

  function renderCollaborators() {
    document.getElementById('collaboratorList').innerHTML = collaborators.map(id => {
      const user = userById(id);
      return `<span class="pill">${escapeHtml(user?.name || id)} <button class="btn" type="button" data-remove="${id}">x</button></span>`;
    }).join('');
    document.querySelectorAll('[data-remove]').forEach(button => {
      button.addEventListener('click', () => {
        collaborators = collaborators.filter(id => id !== button.dataset.remove);
        renderCollaborators();
      });
    });
  }

  function profileForm() {
    return `
      <section class="panel">
        <div class="section-head"><h2>โปรไฟล์</h2>${avatar(currentUser, 'large')}</div>
        <form id="profileForm" class="form-stack">
          <label>ชื่อ<input id="profileName" value="${escapeHtml(currentUser.name)}" readonly></label>
          <label>ตำแหน่ง<input id="profilePosition" value="${escapeHtml(currentUser.position)}"></label>
          <label>เบอร์โทร<input id="profilePhone" value="${escapeHtml(currentUser.phone)}" placeholder="เช่น 081-234-5678"></label>
          <label>รูปโปรไฟล์<input id="profilePhoto" type="file" accept="image/*"></label>
          <button class="btn primary" type="submit">บันทึกโปรไฟล์</button>
        </form>
      </section>
    `;
  }

  function bindProfileForm() {
    document.getElementById('profileForm').addEventListener('submit', async event => {
      event.preventDefault();
      const file = document.getElementById('profilePhoto').files[0];
      const updated = {
        ...currentUser,
        position: document.getElementById('profilePosition').value.trim(),
        phone: document.getElementById('profilePhone').value.trim()
      };
      if (file) updated.photo = await fileToDataUrl(file);
      state.users = state.users.map(user => user.id === currentUser.id ? updated : user);
      currentUser = updated;
      save();
      toast('บันทึกโปรไฟล์แล้ว');
      renderEmployee();
    });
  }

  function renderExecutive() {
    const staff = employees();
    const morningSent = staff.filter(user => hasReport(user.id, 'morning')).length;
    const eveningSent = staff.filter(user => hasReport(user.id, 'evening')).length;
    shell('หน้าผู้บริหาร', 'ตรวจสถานะรายงานประจำวันและเปิดดูรายงานรายบุคคล', `
      <div class="grid three">
        <div class="stat"><span>พนักงานทั้งหมด</span><strong>${staff.length}</strong></div>
        <div class="stat"><span>ส่งรายงานเช้า</span><strong>${morningSent}/${staff.length}</strong></div>
        <div class="stat"><span>ส่งรายงานเย็น</span><strong>${eveningSent}/${staff.length}</strong></div>
      </div>
      <section class="panel" style="margin-top:18px">
        <div class="section-head">
          <h2>การแจ้งเตือนรายงานประจำวันที่ ${WCStore.todayKey()}</h2>
          <div class="actions">
            <button class="btn ${selectedPeriod === 'morning' ? 'primary' : ''}" data-period="morning" type="button">เช้า</button>
            <button class="btn ${selectedPeriod === 'evening' ? 'primary' : ''}" data-period="evening" type="button">เย็น</button>
          </div>
        </div>
        ${statusTable(staff)}
      </section>
      <section class="panel" style="margin-top:18px">
        <div class="section-head"><h2>รายงานล่าสุด</h2></div>
        ${reportList([...todayReports()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8))}
      </section>
    `, 'executive');

    document.querySelectorAll('[data-period]').forEach(button => {
      button.addEventListener('click', () => {
        selectedPeriod = button.dataset.period;
        renderExecutive();
      });
    });
  }

  function statusTable(staff) {
    return `
      <div class="table-wrap">
        <table>
          <thead><tr><th>พนักงาน</th><th>ตำแหน่ง</th><th>ช่วงเวลา</th><th>สถานะ</th><th>รายงาน</th></tr></thead>
          <tbody>
            ${staff.map(user => {
              const report = findReport(user.id, selectedPeriod);
              return `
                <tr>
                  <td><div class="actions">${avatar(user)}<div><strong>${escapeHtml(user.name)}</strong><div class="muted">${user.code}</div></div></div></td>
                  <td>${escapeHtml(user.position)}</td>
                  <td>${WCStore.periodLabel(selectedPeriod)}</td>
                  <td>${report ? '<span class="badge green">ส่งแล้ว</span>' : '<span class="badge red">ยังไม่ส่ง</span>'}</td>
                  <td>${report ? `<button class="btn" data-report="${report.id}" type="button">เปิดดู</button>` : '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function reportList(reports) {
    if (!reports.length) return '<div class="empty">ยังไม่มีรายงานในวันนี้</div>';
    setTimeout(bindReportButtons, 0);
    return `<div class="grid two">${reports.map(report => reportCard(report)).join('')}</div>`;
  }

  function reportCard(report) {
    const owner = userById(report.userId);
    const names = report.collaborators.map(id => userById(id)?.name).filter(Boolean);
    return `
      <article class="card">
        <div class="section-head">
          <div><h2>${escapeHtml(report.title)}</h2><div class="muted">${escapeHtml(owner?.name || '')} · ${WCStore.periodLabel(report.period)}</div></div>
          <span class="badge teal">${formatDate(report.createdAt)}</span>
        </div>
        <p>${escapeHtml(report.detail).slice(0, 220)}${report.detail.length > 220 ? '...' : ''}</p>
        ${names.length ? `<div class="pill-list">${names.map(name => `<span class="pill">${escapeHtml(name)}</span>`).join('')}</div>` : ''}
        ${report.images.length ? `<div class="image-list">${report.images.slice(0, 3).map(src => `<img class="preview-img" src="${src}" alt="ภาพรายงาน">`).join('')}</div>` : ''}
        <button class="btn" data-report="${report.id}" type="button">ดูรายละเอียด</button>
      </article>
    `;
  }

  function bindReportButtons() {
    document.querySelectorAll('[data-report]').forEach(button => {
      button.addEventListener('click', () => openReport(button.dataset.report));
    });
  }

  function openReport(id) {
    const report = state.reports.find(item => item.id === id);
    if (!report) return;
    const owner = userById(report.userId);
    const names = report.collaborators.map(item => userById(item)?.name).filter(Boolean);
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <article class="modal">
          <header><h2>${escapeHtml(report.title)}</h2><button class="btn" id="closeModal" type="button">ปิด</button></header>
          <p class="muted">${escapeHtml(owner?.name || '')} · ${WCStore.periodLabel(report.period)} · ${formatDate(report.createdAt)}</p>
          <p style="line-height:1.8;white-space:pre-wrap">${escapeHtml(report.detail)}</p>
          ${names.length ? `<h3>บุคคลที่เกี่ยวกับงาน</h3><div class="pill-list">${names.map(name => `<span class="pill">${escapeHtml(name)}</span>`).join('')}</div>` : ''}
          ${report.images.length ? `<h3>ภาพแนบ</h3><div class="image-list">${report.images.map(src => `<img class="preview-img" src="${src}" alt="ภาพรายงาน">`).join('')}</div>` : ''}
        </article>
      </div>
    `;
    document.getElementById('closeModal').addEventListener('click', closeModal);
  }

  function closeModal() {
    modalRoot.innerHTML = '';
  }

  function renderAdmin() {
    shell('จัดการระบบ', 'เพิ่ม แก้ไข ลบผู้ใช้ และดูภาพรวมข้อมูลระบบ', `
      <div class="grid three">
        <div class="stat"><span>ผู้ใช้ทั้งหมด</span><strong>${state.users.length}</strong></div>
        <div class="stat"><span>พนักงาน</span><strong>${employees().length}</strong></div>
        <div class="stat"><span>รายงานทั้งหมด</span><strong>${state.reports.length}</strong></div>
      </div>
      <section class="panel" style="margin-top:18px">
        <div class="section-head"><h2>ผู้ใช้ทั้งหมด</h2><button id="addUser" class="btn primary" type="button">เพิ่มผู้ใช้</button></div>
        <div class="grid two">${state.users.map(userCard).join('')}</div>
      </section>
    `, 'admin');

    document.getElementById('addUser').addEventListener('click', () => openUserForm());
    document.querySelectorAll('[data-edit-user]').forEach(button => button.addEventListener('click', () => openUserForm(button.dataset.editUser)));
    document.querySelectorAll('[data-delete-user]').forEach(button => button.addEventListener('click', () => deleteUser(button.dataset.deleteUser)));
  }

  function userCard(user) {
    return `
      <article class="card">
        <div class="actions">${avatar(user)}<div><strong>${escapeHtml(user.name)}</strong><div class="muted">${user.code} · ${WCStore.roles[user.role]}</div></div></div>
        <p class="muted">${escapeHtml(user.position || '-')}<br>${escapeHtml(user.phone || 'ยังไม่มีเบอร์โทร')}</p>
        <div class="actions">
          <button class="btn" data-edit-user="${user.id}" type="button">แก้ไข</button>
          ${user.id !== currentUser.id ? `<button class="btn danger" data-delete-user="${user.id}" type="button">ลบ</button>` : ''}
        </div>
      </article>
    `;
  }

  function openUserForm(id = '') {
    const user = id ? userById(id) : { code: '', password: '', name: '', position: '', phone: '', role: 'employee' };
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <form id="userForm" class="modal">
          <header><h2>${id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}</h2><button class="btn" id="closeModal" type="button">ปิด</button></header>
          <div class="grid two">
            <label class="field">รหัสพนักงาน<input id="userCode" value="${escapeHtml(user.code)}" ${id ? 'readonly' : ''} required></label>
            <label class="field">รหัสผ่าน<input id="userPassword" value="${escapeHtml(user.password)}" required></label>
            <label class="field">ชื่อ<input id="userName" value="${escapeHtml(user.name)}" required></label>
            <label class="field">สิทธิ์<select id="userRole">
              <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>พนักงาน</option>
              <option value="executive" ${user.role === 'executive' ? 'selected' : ''}>ผู้บริหาร</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>แอดมิน</option>
            </select></label>
            <label class="field">ตำแหน่ง<input id="userPosition" value="${escapeHtml(user.position)}"></label>
            <label class="field">เบอร์โทร<input id="userPhone" value="${escapeHtml(user.phone)}"></label>
          </div>
          <div class="actions" style="margin-top:16px"><button class="btn success" type="submit">บันทึก</button></div>
        </form>
      </div>
    `;
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('userForm').addEventListener('submit', event => {
      event.preventDefault();
      saveUser(id);
    });
  }

  function saveUser(id) {
    const code = document.getElementById('userCode').value.trim().toUpperCase();
    if (!id && state.users.some(user => user.code.toUpperCase() === code)) {
      toast('รหัสพนักงานนี้มีอยู่แล้ว');
      return;
    }
    const next = {
      id: id || code,
      code,
      password: document.getElementById('userPassword').value,
      name: document.getElementById('userName').value.trim(),
      role: document.getElementById('userRole').value,
      position: document.getElementById('userPosition').value.trim(),
      phone: document.getElementById('userPhone').value.trim(),
      photo: id ? userById(id).photo : ''
    };
    state.users = id ? state.users.map(user => user.id === id ? next : user) : [...state.users, next];
    if (currentUser.id === id) currentUser = next;
    save();
    closeModal();
    toast('บันทึกผู้ใช้แล้ว');
    renderAdmin();
  }

  function deleteUser(id) {
    const user = userById(id);
    if (!confirm(`ต้องการลบผู้ใช้ ${user.name} ใช่ไหม`)) return;
    state.users = state.users.filter(item => item.id !== id);
    state.reports = state.reports.filter(report => report.userId !== id);
    save();
    renderAdmin();
  }

  function fileToDataUrl(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  if (page === 'employee') renderEmployee();
  if (page === 'executive') renderExecutive();
  if (page === 'admin') renderAdmin();
})();
