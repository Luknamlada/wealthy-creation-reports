(function () {
  const STORAGE_KEY = 'wealthyCreationReportSystemV2';
  const SESSION_KEY = 'wealthyCreationCurrentUser';

  const people = [
    ['WC001', 'กิตติพงศ์ วัฒนากุล', 'ประธานฝ่ายปฏิบัติการ', 'executive'],
    ['WC002', 'พิมพ์ชนก ศรีวัฒนา', 'ผู้จัดการฝ่ายขาย', 'employee'],
    ['WC003', 'ณัฐวุฒิ ใจดี', 'เจ้าหน้าที่บัญชี', 'employee'],
    ['WC004', 'อรทัย แสงทอง', 'เจ้าหน้าที่บุคคล', 'employee'],
    ['WC005', 'ธนากร พรหมมินทร์', 'นักการตลาดดิจิทัล', 'employee'],
    ['WC006', 'สุชาดา เกษมสุข', 'หัวหน้าทีมบริการลูกค้า', 'employee'],
    ['WC007', 'ปกรณ์ ตั้งเจริญ', 'เจ้าหน้าที่คลังสินค้า', 'employee'],
    ['WC008', 'วิภาดา วงศ์ไพบูลย์', 'เจ้าหน้าที่ประสานงาน', 'employee'],
    ['WC009', 'ชยพล ธรรมรักษ์', 'นักวิเคราะห์ข้อมูล', 'employee'],
    ['WC010', 'เมธาวี ศิริชัย', 'นักออกแบบกราฟิก', 'employee'],
    ['WC011', 'ภาคิน สุขสำราญ', 'เจ้าหน้าที่ IT Support', 'employee'],
    ['WC012', 'จิราพร นิลกุล', 'ผู้ช่วยผู้จัดการ', 'employee'],
    ['WC013', 'รัตนพล หอมจันทร์', 'พนักงานขาย', 'employee'],
    ['WC014', 'สุธาสินี พงษ์ศักดิ์', 'พนักงานขาย', 'employee'],
    ['WC015', 'ธีรภัทร มั่นคง', 'เจ้าหน้าที่จัดซื้อ', 'employee'],
    ['WC016', 'เกวลิน จันทร์เพ็ญ', 'เจ้าหน้าที่การเงิน', 'employee'],
    ['WC017', 'อนุชา รุ่งโรจน์', 'ช่างเทคนิค', 'employee'],
    ['WC018', 'นิภาพร ทองดี', 'เจ้าหน้าที่เอกสาร', 'employee'],
    ['WC019', 'กานต์ธีรา ศรีสุข', 'คอนเทนต์ครีเอเตอร์', 'employee'],
    ['WC020', 'วรพล พัฒนกิจ', 'หัวหน้าทีมคลังสินค้า', 'employee'],
    ['WC021', 'มณีรัตน์ แก้วมณี', 'พนักงานต้อนรับ', 'employee'],
    ['WC022', 'อัครเดช ภูมิใจ', 'พนักงานขนส่ง', 'employee'],
    ['WC023', 'พรทิพย์ บุญช่วย', 'พนักงานขายออนไลน์', 'employee'],
    ['WC024', 'ศุภชัย พรเจริญ', 'หัวหน้าทีมขาย', 'employee'],
    ['WC025', 'นันทิชา เลิศล้ำ', 'เจ้าหน้าที่ CRM', 'employee'],
    ['WC026', 'ไตรภพ สายทอง', 'เจ้าหน้าที่ตรวจสอบคุณภาพ', 'employee'],
    ['WC027', 'ศิริพร ชูใจ', 'พนักงานบัญชี', 'employee'],
    ['WC028', 'ณิชาภัทร วงษ์ดี', 'เจ้าหน้าที่ฝึกอบรม', 'employee'],
    ['WC029', 'ชาญณรงค์ พรมดี', 'ช่างภาพสินค้า', 'employee'],
    ['WC030', 'วรรณวิสา ธนทรัพย์', 'เลขานุการผู้บริหาร', 'employee'],
    ['WC031', 'ปิยวัฒน์ สกุลชัย', 'ผู้จัดการสาขา', 'employee'],
    ['WC032', 'รุ่งนภา อ่อนแก้ว', 'เจ้าหน้าที่ประกันคุณภาพ', 'employee'],
    ['WC033', 'ภัทรพล แก้วคำ', 'พนักงานแพ็กสินค้า', 'employee'],
    ['WC034', 'ดารินทร์ ชัยมงคล', 'เจ้าหน้าที่ลูกค้าสัมพันธ์', 'employee'],
    ['WC035', 'กฤษฎา อินทรประสิทธิ์', 'นักวางแผนสื่อ', 'employee'],
    ['WC036', 'อุมาพร วิเศษศิลป์', 'พนักงานขายหน้าร้าน', 'employee'],
    ['WC037', 'ศรัณย์ ตั้งมั่น', 'เจ้าหน้าที่ระบบ', 'employee'],
    ['WC038', 'เบญจมาศ กิตติกุล', 'ผู้ช่วยบัญชี', 'employee'],
    ['WC039', 'ชลธิชา ปัญญาดี', 'เจ้าหน้าที่จัดส่ง', 'employee'],
    ['WC040', 'วรากร เจริญผล', 'พนักงานคลังสินค้า', 'employee']
  ];

  const roles = {
    employee: 'พนักงาน',
    executive: 'ผู้บริหาร',
    admin: 'แอดมิน'
  };

  function createInitialState() {
    return {
      users: [
        { id: 'ADMIN', code: 'ADMIN', password: 'admin123', name: 'System Administrator', position: 'แอดมินระบบ', phone: '02-000-0000', role: 'admin', photo: '' },
        ...people.map(([code, name, position, role]) => ({ id: code, code, password: code, name, position, phone: '', role, photo: '' }))
      ],
      reports: []
    };
  }

  function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialState();
    try {
      const data = JSON.parse(saved);
      if (!Array.isArray(data.users) || !Array.isArray(data.reports)) return createInitialState();
      return data;
    } catch {
      return createInitialState();
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getSession() {
    return sessionStorage.getItem(SESSION_KEY);
  }

  function setSession(userId) {
    sessionStorage.setItem(SESSION_KEY, userId);
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function periodLabel(period) {
    return period === 'morning' ? 'เช้า (05:00-11:00)' : 'เย็น (15:00-23:59)';
  }

  function initialPeriod() {
    const hour = new Date().getHours();
    return hour >= 15 ? 'evening' : 'morning';
  }

  window.WCStore = {
    roles,
    load,
    save,
    getSession,
    setSession,
    clearSession,
    todayKey,
    periodLabel,
    initialPeriod
  };
})();
