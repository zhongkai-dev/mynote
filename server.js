const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

// Import route modules
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const noteRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway
app.set('trust proxy', 1);

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://note:note@cluster0.hdlzqpn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin in development
    if (!isProduction) return callback(null, true);
    
    // In production, allow requests from your Railway domain and empty origin (same-origin requests)
    if (!origin || /railway\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    callback(null, true); // For now, allow all origins, but you can restrict this in the future
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Get domain from environment or use default
const isProduction = process.env.NODE_ENV === 'production';

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'note_app_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 60 * 60 * 24, // 1 day
    autoRemove: 'native'
  }),
  cookie: { 
    secure: isProduction,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: isProduction ? 'none' : 'lax'
  }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notes', noteRoutes);

// Serve SPA for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use(errorHandler);

// Start the server
async function startServer() {
  // Connect to MongoDB
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.error('Unable to connect to MongoDB. Please check your configuration.');
    return;
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
  });
}

startServer(); 