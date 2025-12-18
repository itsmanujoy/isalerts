const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline styles for development
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.post('/api/alerts', (req, res) => {
  try {
    const { message, link, recipientType } = req.body;
    
    // Validation
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Log the alert data (in production, save to database)
    console.log('New Alert Created:', {
      message: message.trim(),
      link: link || null,
      recipientType: recipientType || 'everyone',
      timestamp: new Date().toISOString(),
      id: Date.now() // Simple ID generation
    });

    // Simulate processing time
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Alert published successfully',
        data: {
          id: Date.now(),
          message: message.trim(),
          link: link || null,
          recipientType: recipientType || 'everyone',
          publishedAt: new Date().toISOString()
        }
      });
    }, 1000);

  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Catch all handler: send back React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 App available at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});
