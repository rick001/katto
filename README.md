# Katto URL Shortener

A modern, secure URL shortening service built with Node.js, Express, and MongoDB. Features include user authentication, custom short codes, expiration dates, and click tracking.

![Katto URL Shortener](https://i.ibb.co/k64PRvrK/image.png)

## Features

- 🔐 **User Authentication**
  - JWT-based authentication
  - API key support for programmatic access
  - Secure password hashing

- 🔗 **URL Management**
  - Create shortened URLs
  - Custom short codes (optional)
  - Expiration dates
  - Click tracking
  - URL validation

- 🛡️ **Security**
  - Rate limiting
  - CORS protection
  - XSS protection
  - Security headers
  - Input validation

- 📱 **Modern UI**
  - Responsive design
  - Clean, intuitive interface
  - Copy to clipboard
  - Success/error notifications

- 📚 **API Documentation**
  - Swagger/OpenAPI documentation
  - API endpoint documentation
  - Authentication examples

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rick001/katto.git
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
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

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
| PORT | Server port | `3000` |

## Production Deployment

1. Set up environment variables in `.env.production`
2. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

3. Build and start the application:
   ```bash
   npm run build
   pm2 start server.js --name katto-url-shortener
   ```

## Security Features

- Rate limiting for API endpoints
- Strict rate limiting for authentication routes
- Request size limiting
- Security headers (Helmet)
- CORS protection
- XSS protection
- Input validation and sanitization

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### API Documentation
The API documentation is available at `/api-docs` when running in development mode.

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

## Support

For support, email rick@techbreeze.in or open an issue in the repository. 