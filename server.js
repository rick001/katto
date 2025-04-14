const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const urlRoutes = require('./routes/url');
const authRoutes = require('./routes/auth');
const Url = require('./models/Url');
const path = require('path');

dotenv.config();
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "cdnjs.cloudflare.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "cdnjs.cloudflare.com",
        "fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "cdnjs.cloudflare.com",
        "fonts.gstatic.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" }
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// More strict rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login/register attempts per hour
  message: 'Too many authentication attempts, please try again later'
});
app.use('/api/auth/', authLimiter);

// Set security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Katto URL Shortener API',
      version: '1.0.0',
      description: 'API for shortening URLs with authentication',
    },
    servers: [
      {
        url: process.env.BASE_URL,
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      }
    }
  },
  apis: ['./routes/*.js'],
};

// Filter out default-key endpoint in production
if (process.env.NODE_ENV === 'production') {
  swaggerOptions.apis = ['./routes/url.js']; // Only include URL routes
} else {
  swaggerOptions.apis = ['./routes/*.js']; // Include all routes in development
}

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Add basic auth to Swagger UI in production
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Katto URL Shortener API",
  customfavIcon: "/favicon.ico"
};

// Serve Swagger UI with security headers
app.use('/api-docs', (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' })); // Limit body size

app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// Serve the index page with BASE_URL
app.get('/', (req, res) => {
  res.render('index', { BASE_URL: process.env.BASE_URL });
});

// Handle root route redirection
app.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });
    if (url) {
      // Check if URL has expired
      if (url.expiresAt && url.expiresAt < new Date()) {
        return res.status(410).json({ error: 'URL has expired' });
      }
      // Increment click count
      url.clicks += 1;
      await url.save();
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json({ error: 'URL not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Connected');
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
