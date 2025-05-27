const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../db');
const isAuthenticated = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ status: 'error', message: 'Username and password are required' });
    }
    
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid password' });
    }
    
    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;
    
    return res.json({ status: 'success', message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Error logging out' });
    }
    res.json({ status: 'success', message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/check', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ 
      status: 'success', 
      authenticated: true,
      username: req.session.username
    });
  } else {
    return res.json({ status: 'success', authenticated: false });
  }
});

// Debug route to check session status
router.get('/debug', (req, res) => {
  return res.json({
    session: req.session ? {
      exists: true,
      userId: req.session.userId || null,
      username: req.session.username || null,
      cookie: {
        maxAge: req.session.cookie ? req.session.cookie.maxAge : null,
        httpOnly: req.session.cookie ? req.session.cookie.httpOnly : null,
        secure: req.session.cookie ? req.session.cookie.secure : null,
        sameSite: req.session.cookie ? req.session.cookie.sameSite : null
      }
    } : { exists: false },
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
      'x-forwarded-proto': req.headers['x-forwarded-proto'],
      'host': req.headers.host,
      'user-agent': req.headers['user-agent'],
      'referer': req.headers.referer,
      'origin': req.headers.origin,
      'cookie': req.headers.cookie ? 'Exists (hidden for security)' : 'None'
    },
    environment: {
      isProduction: process.env.NODE_ENV === 'production',
      port: process.env.PORT,
      domain: process.env.DOMAIN
    }
  });
});

module.exports = router; 