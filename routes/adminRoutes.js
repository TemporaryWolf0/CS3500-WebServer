const express = require('express');
const router = express.Router();

// Middleware to ensure user is admin
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  return res.redirect('/dashboard'); // or some error page
}