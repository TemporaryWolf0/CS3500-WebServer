// controllers/authController.js (ESM)
import User from '../models/User.js';

export const getLogin = (req, res) => {
  res.render('auth/login', { message: req.flash('error') });
};

export const postLogin = async (req, res, next) => {
  const mod = await import('passport').catch(() => null);
  const passport = mod && mod.default ? mod.default : mod;
  if (!passport || typeof passport.authenticate !== 'function') {
    return res.status(500).send('Authentication not available');
  }
  return passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
};

export const getRegister = (req, res) => {
  res.render('auth/register');
};

export const postRegister = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    // Make sure user doesn’t already exist
    let user = await User.findOne({ email });
    if (user) {
      req.flash('error', 'User already exists');
      return res.redirect('/register');
    }

    // Create new user
    user = new User({ name, email, phone, password, role });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/login');
  });
};

// Programmatic helper: create a user (returns created user or null if exists)
export async function createUserProgrammatic({ name, email, phone = '', password, role = 'public' }) {
  if (!email || !password || !name) throw new Error('name, email and password required');
  const existing = await User.findOne({ $or: [{ email }, { username: name }] });
  if (existing) return null;
  const user = new User({ name, email, phone, password, role, username: name });
  await user.save();
  return user;
}

// Ensure an admin user exists (checks by username or email)
export async function ensureAdmin({ username, password, email }) {
  if (!username || !password) throw new Error('username and password required');
  const query = email ? { $or: [{ username }, { email }] } : { username };
  const existing = await User.findOne(query);
  if (existing) return { created: false, user: existing };
  const user = new User({ name: username, username, email: email || `${username}@example.com`, password, role: 'admin' });
  await user.save();
  return { created: true, user };
}
