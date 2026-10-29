// Keep Numora AI accounts compatible with the main Numora app's local account store.
window.useSharedNumoraAuth = true;
const aiAuth$ = selector => document.querySelector(selector);
let aiAuthMode = 'signup';

function aiReadAccounts() {
  try {
    const value = JSON.parse(localStorage.getItem('numoraAccounts') || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
function aiSaveAccounts(accounts) {
  localStorage.setItem('numoraAccounts', JSON.stringify(accounts));
}
function aiAccountFor(email, accounts = aiReadAccounts()) {
  return accounts[String(email || '').trim().toLowerCase()] || null;
}
function aiSetError(message) {
  aiAuth$('#authError').textContent = message;
}
function aiSetPasswordMode(mode) {
  const field = aiAuth$('#passwordField');
  const input = aiAuth$('#passwordInput');
  const visible = mode === 'signup' || mode === 'login' || mode === 'resetPassword';
  field.classList.toggle('hidden', !visible);
  input.required = visible;
  input.minLength = mode === 'resetPassword' ? 6 : 0;
  input.autocomplete = mode === 'signup' ? 'new-password' : mode === 'login' ? 'current-password' : 'new-password';
  input.placeholder = mode === 'resetPassword' ? 'At least 6 characters' : mode === 'login' ? 'Your password' : 'At least 6 characters';
  input.value = '';
}
function openAuth(mode) {
  aiAuthMode = mode;
  const signup = mode === 'signup';
  const recovery = mode === 'resetPassword' || mode === 'resetUsername';
  aiAuth$('#authModal').classList.remove('hidden');
  aiAuth$('#authEyebrow').textContent = recovery ? 'ACCOUNT RECOVERY' : signup ? 'GET STARTED' : 'WELCOME BACK';
  aiAuth$('#authTitle').textContent = mode === 'resetPassword' ? 'Create a new password' : mode === 'resetUsername' ? 'Create a new username' : signup ? 'Create your Numora account' : 'Log in to Numora';
  aiAuth$('#authCopy').textContent = mode === 'resetPassword' ? 'Enter your account email and choose a new password.' : mode === 'resetUsername' ? 'Enter your account email and choose a new username.' : signup ? 'Save your chats and keep learning.' : 'Pick up where you left off.';
  aiAuth$('#nameField').classList.toggle('hidden', !signup && mode !== 'resetUsername');
  aiAuth$('#nameField').firstChild.textContent = mode === 'resetUsername' ? 'New username' : 'Your name';
  aiSetPasswordMode(mode);
  aiAuth$('#recoveryLinks').classList.toggle('hidden', signup || recovery);
  aiAuth$('#authSubmit').textContent = mode === 'resetPassword' ? 'Save new password' : mode === 'resetUsername' ? 'Save new username' : signup ? 'Create account' : 'Log in';
  aiAuth$('#switchText').innerHTML = recovery ? 'Back to login <button type="button">Log in</button>' : signup ? 'Already have an account? <button type="button">Log in</button>' : 'New to Numora? <button type="button">Sign up</button>';
  aiAuth$('#authError').textContent = '';
  aiAuth$('#emailInput').value = '';
  aiAuth$('#nameInput').value = '';
}
window.openAuth = openAuth;
function aiValidLearnerName(value) {
  const name = String(value || '').trim();
  const letters = name.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '').toLowerCase();
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '\u2019-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(name) || letters.length < 2 || letters.length > 20 || !/[aeiouyà-öø-ÿ]/.test(letters) || /(.)\1\1/i.test(letters)) return false;
  return new Set(letters).size / letters.length >= .4;
}
function aiSuggestStrongPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const values = crypto?.getRandomValues ? crypto.getRandomValues(new Uint32Array(14)) : Array.from({ length: 14 }, () => Math.floor(Math.random() * chars.length));
  aiAuth$('#passwordInput').value = Array.from(values, value => chars[value % chars.length]).join('') + '!';
  aiAuth$('#passwordInput').focus();
}
aiAuth$('#nameInput').addEventListener('input', event => { if (event.target.value.length > 20) event.target.value = event.target.value.slice(0, 20); });
aiAuth$('#suggestPassword').addEventListener('click', aiSuggestStrongPassword);

function aiBase64(bytes) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}
function aiFromBase64(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}
async function aiHashPassword(password) {
  if (!crypto?.subtle) throw new Error('Secure password storage is unavailable. Open Numora using its secure website.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' }, key, 256));
  return `pbkdf2-sha256$210000$${aiBase64(salt)}$${aiBase64(hash)}`;
}
async function aiVerifyPassword(account, password, email, accounts) {
  if (account?.passwordHash) {
    const [algorithm, iterations, saltText, hashText] = account.passwordHash.split('$');
    if (algorithm !== 'pbkdf2-sha256' || !saltText || !hashText) return false;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const actual = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: aiFromBase64(saltText), iterations: Number(iterations), hash: 'SHA-256' }, key, 256));
    const expected = aiFromBase64(hashText);
    if (actual.length !== expected.length) return false;
    let difference = 0;
    actual.forEach((byte, index) => { difference |= byte ^ expected[index]; });
    return difference === 0;
  }
  if (typeof account?.password !== 'string' || account.password !== password) {
    let legacy = {};
    try { legacy = JSON.parse(localStorage.getItem('numoraAIAccounts') || '{}'); } catch {}
    const aiAccount = legacy[email];
    if (!aiAccount || aiAccount.password !== password) return false;
    account = { username: aiAccount.name || email.split('@')[0], progress: {} };
  }
  account.passwordHash = await aiHashPassword(password);
  delete account.password;
  accounts[email] = account;
  aiSaveAccounts(accounts);
  return true;
}
function aiSignIn(email, name) {
  // The Math account is the source of truth for the username shared with AI.
  const mathAccount = aiAccountFor(email);
  const cleanName = mathAccount?.username || name || email.split('@')[0] || 'Learner';
  localStorage.setItem('numoraActiveEmail', email);
  localStorage.setItem('numoraEmail', email);
  localStorage.setItem('numoraUser', cleanName);
  localStorage.setItem('numoraAIEmail', email);
  localStorage.setItem('numoraAIUser', cleanName);
  aiAuth$('#accountName').textContent = cleanName;
  aiAuth$('#accountStatus').textContent = 'Chats saved on this device';
  aiAuth$('#avatar').textContent = cleanName.trim().slice(0, 2).toUpperCase();
  aiAuth$('#loginBtn').classList.add('hidden');
  aiAuth$('#signupBtn').classList.add('hidden');
  aiAuth$('#signoutBtn').classList.remove('hidden');
  aiAuth$('#authModal').classList.add('hidden');
  aiLoadChats(email);
}
function aiLoadChats(email, fresh = false) {
  const key = `numoraAIChats:${email}`;
  window.aiChatStorageKey = key;
  if (fresh) {
    chats = [];
    localStorage.setItem(key, '[]');
  } else {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (Array.isArray(saved)) chats = saved;
      else {
        const previousEmail = (localStorage.getItem('numoraAIEmail') || '').trim().toLowerCase();
        const legacyChats = JSON.parse(localStorage.getItem('numoraAIChats') || '[]');
        chats = previousEmail === email && Array.isArray(legacyChats) ? legacyChats : [];
        localStorage.setItem(key, JSON.stringify(chats));
      }
    } catch { chats = []; }
  }
  active = [];
  aiAuth$('#title').textContent = 'New conversation';
  aiAuth$('#welcome').classList.remove('hidden');
  aiAuth$('#messages').classList.add('hidden');
  renderChats();
}
function aiClearGuestProgress() {
  const guestProgressKey = /^(numoraGrade$|numoraFreshStart$|numoraCompleted$|numoraStreak$|numoraAccuracyAttempts$|numoraAccuracyCorrect$|numoraTodayDate$|numoraTodayCompleted$|numoraMonthKey$|numoraMonthCompleted$|numoraBadgeProgress$|numoraXP$|numoraHintTokens$|numoraXpAvatarStar$|numoraXpAvatarItem$|numoraXpOwnedRewards$|numoraDoubleXpAnswers$|numoraLessonIndex_|numoraPausedLesson_)/;
  Object.keys(localStorage).filter(key => guestProgressKey.test(key)).forEach(key => localStorage.removeItem(key));
}
function aiSignOut() {
  localStorage.removeItem('numoraActiveEmail');
  localStorage.removeItem('numoraEmail');
  localStorage.removeItem('numoraUser');
  localStorage.removeItem('numoraAIEmail');
  localStorage.removeItem('numoraAIUser');
  aiAuth$('#accountName').textContent = 'Guest';
  aiAuth$('#accountStatus').textContent = 'Sign in to save chats';
  aiAuth$('#avatar').textContent = 'G';
  aiAuth$('#loginBtn').classList.remove('hidden');
  aiAuth$('#signupBtn').classList.remove('hidden');
  aiAuth$('#signoutBtn').classList.add('hidden');
  window.aiChatStorageKey = 'numoraAIChats';
  chats = [];
  active = [];
  renderChats();
  aiAuth$('#title').textContent = 'New conversation';
  aiAuth$('#welcome').classList.remove('hidden');
  aiAuth$('#messages').classList.add('hidden');
  toast('You have been signed out');
}

aiAuth$('#authForm').onsubmit = async event => {
  event.preventDefault();
  const email = aiAuth$('#emailInput').value.trim().toLowerCase();
  const password = aiAuth$('#passwordInput').value;
  const name = aiAuth$('#nameInput').value.trim();
  const accounts = aiReadAccounts();
  try {
    if (aiAuthMode === 'signup') {
      if (!aiValidLearnerName(name)) return aiSetError('Use a real name with letters only, up to 20 letters.');
      if (!/^\S+@\S+\.\S+$/.test(email)) return aiSetError('Enter a valid email address.');
      if (password.length < 6) return aiSetError('Your password must be at least 6 characters.');
      if (aiAccountFor(email, accounts)) return aiSetError('An account already uses this email. Please log in instead.');
      const passwordHash = await aiHashPassword(password);
      accounts[email] = { username: name || email.split('@')[0] || 'Learner', passwordHash, joinedAt: new Date().toISOString().slice(0, 10), progress: {} };
      aiSaveAccounts(accounts);
      aiClearGuestProgress();
      localStorage.setItem('numoraAIHasVisited', 'true');
      aiSignIn(email, accounts[email].username);
      aiLoadChats(email, true);
      toast('Account created!');
    } else if (aiAuthMode === 'login') {
      const account = aiAccountFor(email, accounts);
      if (!account || !(await aiVerifyPassword(account, password, email, accounts))) return aiSetError('We could not find an account with those details.');
      localStorage.setItem('numoraAIHasVisited', 'true');
      aiSignIn(email, account.username || account.name || email.split('@')[0]);
      toast('Welcome back, ' + (account.username || account.name || email.split('@')[0]).split(' ')[0] + '!');
    } else if (aiAuthMode === 'resetPassword') {
      const account = aiAccountFor(email, accounts);
      if (!account) return aiSetError('Enter the email used for your Numora account.');
      if (password.length < 6) return aiSetError('Your new password must be at least 6 characters.');
      account.passwordHash = await aiHashPassword(password);
      delete account.password;
      accounts[email] = account;
      aiSaveAccounts(accounts);
      aiSignIn(email, account.username || email.split('@')[0]);
      toast('Password updated. Welcome back!');
    } else {
      const account = aiAccountFor(email, accounts);
      if (!account) return aiSetError('Enter the email used for your Numora account.');
      if (!aiValidLearnerName(name)) return aiSetError('Use a real name with letters only, up to 20 letters.');
      account.username = name;
      accounts[email] = account;
      aiSaveAccounts(accounts);
      if (localStorage.getItem('numoraActiveEmail')?.toLowerCase() === email) {
        localStorage.setItem('numoraUser', name);
        localStorage.setItem('numoraAIUser', name);
        aiAuth$('#accountName').textContent = name;
        aiAuth$('#avatar').textContent = name.trim().slice(0, 2).toUpperCase();
      }
      aiAuth$('#authModal').classList.add('hidden');
      toast('Your new username was saved.');
    }
  } catch (error) {
    aiSetError(error.message || 'We could not complete that request. Please try again.');
  }
};
aiAuth$('#authSubmit').onclick = null;
aiAuth$('#signoutBtn').onclick = aiSignOut;
aiAuth$('#switchText').onclick = event => {
  if (event.target.closest('button')) openAuth(aiAuthMode === 'signup' || aiAuthMode.startsWith('reset') ? 'login' : 'signup');
};
aiAuth$('#recoveryLinks').onclick = event => {
  const mode = event.target.closest('[data-auth-recovery]')?.dataset.authRecovery;
  if (mode) openAuth(mode === 'password' ? 'resetPassword' : 'resetUsername');
};

// A main-app session is shared across both pages; otherwise first-time AI visitors start at sign-up.
const aiCurrentEmail = (localStorage.getItem('numoraActiveEmail') || '').trim().toLowerCase();
const aiCurrentAccount = aiAccountFor(aiCurrentEmail);
const aiFirstVisit = localStorage.getItem('numoraAIHasVisited') !== 'true';
if (aiFirstVisit) {
  localStorage.setItem('numoraAIHasVisited', 'true');
  openAuth('signup');
} else if (aiCurrentEmail && aiCurrentAccount) {
  aiSignIn(aiCurrentEmail, aiCurrentAccount.username || aiCurrentEmail.split('@')[0]);
} else if (localStorage.getItem('numoraAIUser')) {
  const legacyName = aiCurrentAccount?.username || localStorage.getItem('numoraUser') || localStorage.getItem('numoraAIUser');
  localStorage.setItem('numoraAIUser', legacyName);
  aiAuth$('#accountName').textContent = legacyName;
  aiAuth$('#accountStatus').textContent = 'Chats saved on this device';
  aiAuth$('#avatar').textContent = legacyName.trim().slice(0, 2).toUpperCase();
  aiAuth$('#loginBtn').classList.add('hidden');
  aiAuth$('#signupBtn').classList.add('hidden');
  aiAuth$('#signoutBtn').classList.remove('hidden');
  localStorage.setItem('numoraAIHasVisited', 'true');
} else {
  openAuth('login');
  aiAuth$('#authModal').classList.add('hidden');
}
