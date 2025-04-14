# Katto URL Shortener

A modern, secure URL shortening service built with Node.js, Express, and MongoDB. Features include user authentication, custom short codes, expiration dates, and click tracking.

## Features

- 🔐 **User Authentication**
  - JWT-based authentication
  - API key support for programmatic access
  - Secure password hashing
  - Modal-based login/register interface

- 🔗 **URL Management**
  - Create shortened URLs
  - Custom short codes (optional)
  - Configurable expiration dates (for authenticated users)
  - Click tracking
  - URL validation

- 🛡️ **Security**
  - Rate limiting
  - CORS protection
  - XSS protection
  - Content Security Policy (CSP)
  - Security headers
  - Input validation

- 📱 **Modern UI**
  - Responsive design
  - Clean, intuitive interface
  - Modal-based authentication
  - Copy to clipboard with fallback
  - Success/error notifications
  - Custom expiration options for logged-in users

- 📚 **API Documentation**
  - Swagger/OpenAPI documentation
  - API endpoint documentation
  - Authentication examples
  - Environment-specific Swagger configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rick-001/katto.git
   cd katto
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/urlshortener
   BASE_URL=http://localhost:3000
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRE=30d
   DEFAULT_API_KEY=your-default-api-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### URL Operations

- `POST /api/url/shorten` - Create a shortened URL
- `GET /api/url/:code` - Get URL information
- `GET /:code` - Redirect to original URL

For detailed API documentation, visit `/api-docs` when running the server.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | `mongodb://localhost:27017/urlshortener` |
| BASE_URL | Base URL for shortened links | `http://localhost:3000` |
| JWT_SECRET | Secret for JWT signing | Required |
| JWT_EXPIRE | JWT expiration time | `30d` |
| DEFAULT_API_KEY | Default API key for non-authenticated users | Required |

## Security Features

- Rate limiting for API endpoints (100 requests per 15 minutes)
- Strict rate limiting for authentication routes (5 attempts per hour)
- Request size limiting (10kb)
- Security headers (Helmet)
- Content Security Policy (CSP)
- CORS protection
- XSS protection
- Input validation and sanitization
- Secure password hashing
- JWT-based authentication
- API key authentication

## Frontend Features

- Modern, responsive design
- Modal-based authentication
- Custom URL shortening options
  - Custom aliases
  - Expiration dates (for authenticated users)
- Click tracking
- Copy to clipboard with modern API and fallback
- Success/error notifications
- Persistent authentication state
- Mobile-friendly interface

## Development

The project uses:
- EJS for server-side rendering
- Modern JavaScript (ES6+)
- CSS3 with custom properties
- Font Awesome icons
- Google Fonts (Inter)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- JWT for authentication
- Swagger for API documentation
- Font Awesome for icons
- Google Fonts for typography

## Support

For support, email rick@techbreeze.in or open an issue in the repository. 