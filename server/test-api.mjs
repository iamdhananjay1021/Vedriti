const BASE = process.env.API_URL || 'http://localhost:5001/api/v1';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vedrit.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vedrit-admin';

let failures = 0;

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
};

const check = (label, condition, detail) => {
  if (condition) {
    console.log(`PASS ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL ${label}`, detail ?? '');
  }
};

const nextOpenDate = async (pujaId) => {
  const cal = await call('GET', `/slots/calendar?serviceType=PUJA&pujaId=${pujaId}&days=14`);
  return cal.json.data.find((d) => d.available)?.date;
};

const run = async () => {
  const health = await call('GET', '/health');
  check('health', health.status === 200, health.json);

  const pujas = await call('GET', '/pujas');
  check('list pujas', pujas.status === 200 && pujas.json.data.length > 0, pujas.json);
  const puja = pujas.json.data.find((p) => p.modes.includes('ONLINE'));

  const phone = `9${String(Date.now()).slice(-9)}`;
  const otpReq = await call('POST', '/auth/request-otp', { body: { phone } });
  check('request otp', otpReq.status === 200, otpReq.json);
  const code = otpReq.json.data?.devOtp || process.env.STATIC_OTP;

  const badOtp = await call('POST', '/auth/verify-otp', { body: { phone, otp: '000000' === code ? '111111' : '000000' } });
  check('wrong otp rejected', badOtp.status === 400, badOtp.json);

  const verify = await call('POST', '/auth/verify-otp', { body: { phone, otp: code } });
  check('verify otp', verify.status === 200 && verify.json.data.isNewUser, verify.json);
  const token = verify.json.data.token;

  const date = await nextOpenDate(puja.id);
  check('calendar has open date', Boolean(date));
  const slots = await call('GET', `/slots?serviceType=PUJA&pujaId=${puja.id}&date=${date}`);
  const slot = slots.json.data.slots.find((s) => s.available);
  check('slots available', Boolean(slot), slots.json);

  const bookingBody = {
    serviceType: 'PUJA',
    pujaId: puja.id,
    packageType: 'PANDIT_ONLY',
    mode: 'ONLINE',
    date,
    startTime: slot.startTime,
    devoteeName: 'Test Devotee',
    phone,
    gotra: 'Kashyap',
    paymentMethod: 'PAY_LATER',
  };

  const blocked = await call('POST', '/me/bookings', { token, body: bookingBody });
  check('booking blocked until profile complete', blocked.status === 428, blocked.json);

  const profile = await call('PATCH', '/auth/me', {
    token,
    body: {
      name: 'Test Devotee',
      gender: 'MALE',
      dateOfBirth: '1990-05-14',
      timeOfBirth: '06:45',
      placeOfBirth: 'Varanasi',
      gotra: 'Kashyap',
      address: '12 Test Street, Lanka',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pinCode: '221005',
    },
  });
  check('profile completed', profile.status === 200 && profile.json.data.profileCompleted, profile.json);

  const booking = await call('POST', '/me/bookings', { token, body: bookingBody });
  check('create booking', booking.status === 201, booking.json);

  const doubleBooking = await call('POST', '/me/bookings', { token, body: bookingBody });
  check('double booking rejected', doubleBooking.status === 409, doubleBooking.json);

  const slotsAfter = await call('GET', `/slots?serviceType=PUJA&pujaId=${puja.id}&date=${date}`);
  const same = slotsAfter.json.data.slots.find((s) => s.startTime === slot.startTime);
  check('slot no longer available', same && !same.available, same);

  const settings = await call('GET', '/settings');
  const consultCal = await call('GET', '/slots/calendar?serviceType=CONSULTATION&days=14');
  const consultDate = consultCal.json.data.find((d) => d.available)?.date;
  const consultSlots = await call('GET', `/slots?serviceType=CONSULTATION&date=${consultDate}`);
  const consultSlot = consultSlots.json.data.slots.filter((s) => s.available).pop();
  const consult = await call('POST', '/me/bookings', {
    token,
    body: {
      serviceType: 'CONSULTATION',
      mode: settings.json.data.consultation.modes[0],
      date: consultDate,
      startTime: consultSlot.startTime,
      devoteeName: 'Test Devotee',
      phone,
      sankalpNote: 'Want guidance on business',
      paymentMethod: 'ONLINE',
    },
  });
  check('consultation booking with payment link', consult.status === 201 && consult.json.data.paymentUrl, consult.json);

  if (consult.json.data?.paymentUrl?.includes('/payments/mock/')) {
    await fetch(`${consult.json.data.paymentUrl}/pay`, { method: 'POST' });
    const paid = await call('GET', `/me/bookings/${consult.json.data.bookingId}`, { token });
    check('mock payment confirms booking', paid.json.data.paymentStatus === 'PAID' && paid.json.data.status === 'CONFIRMED', paid.json);
  }

  const email = `devotee${Date.now()}@example.com`;
  const noCode = await call('POST', '/auth/signup-email', { body: { email, password: 'secret123', name: 'Email User', otp: '123456' } });
  check('signup without valid email code rejected', noCode.status === 400, noCode.json);
  const signupCode = await call('POST', '/auth/email/request-otp', { body: { email } });
  check('email code requested', signupCode.status === 200 && signupCode.json.data.isNewUser, signupCode.json);
  const signup = await call('POST', '/auth/signup-email', {
    body: { email, password: 'secret123', name: 'Email User', otp: signupCode.json.data.devOtp },
  });
  check('email signup', signup.status === 201 && signup.json.data.user.emailVerified && !signup.json.data.user.profileCompleted, signup.json);
  const dup = await call('POST', '/auth/signup-email', { body: { email, password: 'secret123', otp: '123456' } });
  check('duplicate email rejected', dup.status === 409, dup.json);

  const otpEmail = `otp${Date.now()}@example.com`;
  const otpReq2 = await call('POST', '/auth/email/request-otp', { body: { email: otpEmail } });
  const tooSoon = await call('POST', '/auth/email/request-otp', { body: { email: otpEmail } });
  check('email code resend throttled', tooSoon.status === 429, tooSoon.json);
  const otpLogin = await call('POST', '/auth/email/verify-otp', { body: { email: otpEmail, otp: otpReq2.json.data.devOtp } });
  check('email OTP login creates account', otpLogin.status === 200 && otpLogin.json.data.isNewUser, otpLogin.json);
  const reused = await call('POST', '/auth/email/verify-otp', { body: { email: otpEmail, otp: otpReq2.json.data.devOtp } });
  check('email code cannot be reused', reused.status === 400, reused.json);

  const unknownReset = await call('POST', '/auth/password/forgot', { body: { email: `nobody${Date.now()}@example.com` } });
  check('reset for unknown email rejected', unknownReset.status === 404, unknownReset.json);
  const forgot = await call('POST', '/auth/password/forgot', { body: { email } });
  const reset = await call('POST', '/auth/password/reset', { body: { email, otp: forgot.json.data.devOtp, newPassword: 'newsecret123' } });
  check('password reset logs in', reset.status === 200 && reset.json.data.token, reset.json);
  const oldPw = await call('POST', '/auth/login-email', { body: { email, password: 'secret123' } });
  check('old password no longer works', oldPw.status === 401, oldPw.json);

  const devLogin = await call('POST', '/auth/login-email', {
    body: { email: process.env.DEV_USER_EMAIL || 'dev@vedrit.in', password: process.env.DEV_USER_PASSWORD || 'VedritDev@2026' },
  });
  check('developer user login (run npm run dev-user first)', devLogin.status === 200 && devLogin.json.data.user.profileCompleted, devLogin.json);
  const wrongPw = await call('POST', '/auth/login-email', { body: { email, password: 'wrongpass' } });
  check('wrong password rejected', wrongPw.status === 401, wrongPw.json);
  const login = await call('POST', '/auth/login-email', { body: { email, password: 'newsecret123' } });
  check('email login', login.status === 200, login.json);
  const takenPhone = await call('PATCH', '/auth/me', { token: login.json.data.token, body: { phone } });
  check('phone already linked rejected', takenPhone.status === 409, takenPhone.json);

  const products = await call('GET', '/products');
  const product = products.json.data[0];
  const order = await call('POST', '/me/orders', {
    token,
    body: {
      items: [{ productId: product.id, quantity: 2 }],
      name: 'Test Devotee',
      phone,
      address: '12 Test Street, Lanka',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pinCode: '221005',
      paymentMethod: 'ONLINE',
    },
  });
  check('create order with payment link', order.status === 201 && order.json.data.paymentUrl, order.json);

  const tooMany = await call('POST', '/me/orders', {
    token,
    body: {
      ...order.json.data,
      items: [1, 2, 3].map(() => ({ productId: product.id, quantity: 20 })),
      paymentMethod: 'COD',
      phone,
    },
  });
  check('stock limit enforced', tooMany.status === 409 || tooMany.status === 400, tooMany.json);

  const kundli = await call('POST', '/me/kundli', {
    token,
    body: {
      type: 'JANAM_KUNDLI',
      primaryPerson: { fullName: 'Test Devotee', gender: 'MALE', dateOfBirth: '1990-05-14', timeOfBirth: '06:45', placeOfBirth: 'Varanasi' },
      questions: 'Career and marriage timing',
      contactPhone: phone,
      paymentMethod: 'PAY_LATER',
    },
  });
  check('submit kundli', kundli.status === 201, kundli.json);

  const admin = await call('POST', '/admin/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  check('admin login', admin.status === 200, admin.json);
  const adminToken = admin.json.data?.token;

  const noAuth = await call('GET', '/admin/stats');
  check('admin requires auth', noAuth.status === 401, noAuth.json);

  const userAsAdmin = await call('GET', '/admin/stats', { token });
  check('user token cannot access admin', userAsAdmin.status === 403, userAsAdmin.json);

  const stats = await call('GET', '/admin/stats', { token: adminToken });
  check('admin stats', stats.status === 200 && stats.json.data.upcomingBookings >= 1, stats.json);

  const confirm = await call('PATCH', `/admin/bookings/${booking.json.data.id}`, {
    token: adminToken,
    body: { status: 'CONFIRMED', meetingLink: 'https://meet.google.com/abc-defg-hij' },
  });
  check('admin confirms booking', confirm.status === 200 && confirm.json.data.status === 'CONFIRMED', confirm.json);

  const answer = await call('PATCH', `/admin/kundli/${kundli.json.data.id}`, {
    token: adminToken,
    body: { panditResponse: 'Jupiter transit is favourable for career growth.' },
  });
  check('admin answers kundli', answer.status === 200 && answer.json.data.status === 'ANSWERED', answer.json);

  const myBooking = await call('GET', `/me/bookings/${booking.json.data.bookingId}`, { token });
  check('user sees meeting link', myBooking.json.data?.meetingLink?.startsWith('https://'), myBooking.json);

  const cancel = await call('POST', `/me/bookings/${booking.json.data.bookingId}/cancel`, { token, body: {} });
  check('user cancels unpaid booking', cancel.status === 200 && cancel.json.data.status === 'CANCELLED', cancel.json);

  const reopened = await call('GET', `/slots?serviceType=PUJA&pujaId=${puja.id}&date=${date}`);
  const freed = reopened.json.data.slots.find((s) => s.startTime === slot.startTime);
  check('slot released after cancel', freed?.available, freed);

  const del = await call('DELETE', '/auth/me', { token });
  check('delete account', del.status === 200, del.json);
  const after = await call('GET', '/auth/me', { token });
  check('deleted account token rejected', after.status === 401, after.json);

  console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
