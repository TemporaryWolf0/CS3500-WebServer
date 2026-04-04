// controllers/authController.js (ESM)
import db from '../db/dbManager.js';
import bcrypt from 'bcryptjs';
import passport from 'passport';

export const getLogin = (req, res) => {
  const msg = req.session && req.session.messages;
  if (req.session) delete req.session.messages;
  res.render('pages/login', { message: msg ? msg[0] : null });
};

export const postLogin = (req, res, next) =>
  passport.authenticate('local', {
    successRedirect: '/pages/dashboard',
    failureRedirect: '/pages/login',
    failureMessage: true
  })(req, res, next);

export const getRegister = (req, res) => {
  res.render('pages/register');
};

export const postRegister = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    // Make sure user doesn’t already exist
    let user = await db.getUserByEmail(email);
    if (user) {
      req.flash('error', 'User already exists');
      return res.redirect('/register');
    }

    // Create new user (hashing handled by dbManager)
    await db.createUser({ name, email, phone, password, role });
    res.redirect('/pages/login');
  } catch (error) {
    console.error(error);
    res.redirect('/pages/register');
  }
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/pages/login');
  });
};

// Programmatic helper: create a user (returns created user or null if exists)
export async function createUserProgrammatic({ name, email, phone = '', password, role = 'public' }) {
  if (!email || !password || !name) throw new Error('name, email and password required');
  const existingByEmail = await db.getUserByEmail(email);
  const existingByUsername = await db.getUserByUsername(name);
  if (existingByEmail || existingByUsername) return null;
  const created = await db.createUser({ name, email, phone, password, role, username: name });
  return created;
}

// Ensure an admin user exists (checks by username or email)
export async function ensureAdmin({ username, password, email }) {
  if (!username || !password) throw new Error('username and password required');
  const existingByUsername = await db.getUserByUsername(username);
  const existingByEmail = email ? await db.getUserByEmail(email) : null;
  const existing = existingByUsername || existingByEmail;
  if (existing) return { created: false, user: existing };
  const created = await db.createUser({ name: username, username, email: email || `${username}@example.com`, password, role: 'admin' });
  return { created: true, user: created };
}
