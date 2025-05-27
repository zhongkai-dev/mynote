/**
 * Debug script to check session configuration
 */
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3333;

// Trust proxy (important for Railway)
app.set('trust proxy', 1);

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://note:note@cluster0.hdlzqpn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Session configuration for testing
app.use(session({
  secret: process.env.SESSION_SECRET || 'note_app_secret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 60 * 60 * 24, // 1 day
    autoRemove: 'native'
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Test routes
app.get('/', (req, res) => {
  // Initialize session if it doesn't exist
  if (!req.session.visits) {
    req.session.visits = 0;
  }
  
  // Increment visit count
  req.session.visits++;
  
  // Show session info
  res.json({
    message: 'Session test page',
    session: {
      id: req.sessionID,
      visits: req.session.visits,
      cookie: {
        maxAge: req.session.cookie.maxAge,
        httpOnly: req.session.cookie.httpOnly,
        secure: req.session.cookie.secure,
        sameSite: req.session.cookie.sameSite
      }
    },
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
      'x-forwarded-proto': req.headers['x-forwarded-proto'],
      'host': req.headers.host,
      'user-agent': req.headers['user-agent'],
      'referer': req.headers.referer,
      'origin': req.headers.origin
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || PORT,
      DOMAIN: process.env.DOMAIN || 'none'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test session`);
}); 