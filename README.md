# Unmatched Lines - Poetry Platform

A modern, full-stack poetry platform built with Next.js 15, featuring multilingual support for English, Hindi, and Urdu poetry. The platform allows poets to share their work, readers to discover beautiful poetry, and provides tools for creating stunning visual representations of couplets.

## 🌟 Features

### Core Functionality
- **Multilingual Poetry Support**: English, Hindi, and Urdu poetry with proper RTL support
- **Poet Profiles**: Comprehensive poet profiles with biographies, works, and statistics
- **Article Management**: Rich text articles with couplet support and categorization
- **User Authentication**: Secure authentication with NextAuth.js and Google OAuth
- **Admin Dashboard**: Complete admin panel for content and user management
- **Search & Discovery**: Advanced search functionality across all content types

### Visual Features
- **Couplet Image Generation**: Download beautiful couplet images with custom backgrounds
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Theme**: Automatic theme switching with user preference
- **Interactive UI**: Smooth animations and modern user interface

### Performance & Security
- **Production-Ready Caching**: Multi-tier caching system for optimal performance
- **Rate Limiting**: Comprehensive rate limiting with multiple presets
- **SEO Optimization**: Full SEO support with structured data and meta tags
- **Security Headers**: Production-grade security headers and validation

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **NextAuth.js** - Authentication and session management
- **Cloudinary** - Image upload and management

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality
- **TypeScript** - Static type checking

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Cloudinary account (for image uploads)
- Google OAuth credentials

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/unmatched-lines.git
   cd unmatched-lines
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/unmatched-lines
   
   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # App Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # The app will automatically create collections and indexes
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── article/           # Article detail pages
│   ├── poet/              # Poet profile pages
│   └── ...
├── components/            # React components
│   ├── articles/          # Article-related components
│   ├── poets/             # Poet-related components
│   ├── ui/                # Reusable UI components
│   └── ...
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication configuration
│   ├── mongodb.ts         # Database connection
│   ├── cache.ts           # Caching utilities
│   ├── rate-limit.ts      # Rate limiting
│   └── ...
├── models/                # MongoDB models
├── types/                 # TypeScript type definitions
└── validators/            # Input validation schemas
```

## 🔧 Configuration

### Rate Limiting
The platform includes comprehensive rate limiting with different presets:

```typescript
// Available presets
rateLimitPresets = {
  strict: { limit: 10, windowMs: 15 * 60 * 1000 },    // 10 requests per 15 minutes
  moderate: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  lenient: { limit: 1000, windowMs: 15 * 60 * 1000 }, // 1000 requests per 15 minutes
  auth: { limit: 5, windowMs: 15 * 60 * 1000 },       // 5 requests per 15 minutes
  upload: { limit: 20, windowMs: 60 * 60 * 1000 },    // 20 uploads per hour
}
```

### Caching
Multi-tier caching system for optimal performance:

```typescript
// Cache instances
articleCache    // 10 minutes TTL, 1000 max entries
poetCache       // 30 minutes TTL, 500 max entries
userCache       // 15 minutes TTL, 200 max entries
searchCache     // 5 minutes TTL, 500 max entries
```

## 📱 API Endpoints

### Articles
- `GET /api/articles` - List articles with pagination
- `GET /api/articles/[slug]` - Get article by slug
- `POST /api/articles` - Create new article (admin/poet)
- `PUT /api/articles/[slug]` - Update article (admin/poet)
- `DELETE /api/articles/[slug]` - Delete article (admin)

### Poets
- `GET /api/poets` - List all poets
- `GET /api/poet/[slug]/works` - Get poet's works by category
- `GET /api/poets/[identifier]` - Get poet by slug or ID

### Authentication
- `POST /api/auth/signin` - Sign in with Google
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### User Management
- `GET /api/user` - Get current user profile
- `PUT /api/user` - Update user profile
- `GET /api/users` - List users (admin)

## 🎨 Customization

### Themes
The platform supports both light and dark themes. Users can toggle between themes, and the preference is saved in localStorage.

### Languages
Multilingual support is built-in with proper RTL support for Urdu text. Language switching is available throughout the application.

### Styling
The platform uses Tailwind CSS with custom design tokens. You can customize the appearance by modifying the `tailwind.config.ts` file.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
The app is built with Next.js and can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

### Environment Variables for Production
Make sure to set all required environment variables in your production environment:

```env
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 📊 Performance

### Optimization Features
- **Static Generation**: Pre-rendered pages for better SEO and performance
- **Image Optimization**: Next.js Image component with Cloudinary integration
- **Code Splitting**: Automatic code splitting for optimal bundle sizes
- **Caching**: Multi-tier caching system reduces database load
- **Rate Limiting**: Prevents abuse and ensures fair resource usage

### Core Web Vitals
The platform is optimized for excellent Core Web Vitals scores:
- **LCP**: Optimized with image optimization and static generation
- **FID**: Minimal JavaScript and efficient event handling
- **CLS**: Stable layouts with proper image dimensions

## 🔒 Security

### Security Features
- **Authentication**: Secure OAuth integration with NextAuth.js
- **Rate Limiting**: Protection against DDoS and abuse
- **Input Validation**: Comprehensive validation for all user inputs
- **Security Headers**: Production-grade security headers
- **CSRF Protection**: Built-in CSRF protection with NextAuth.js
- **XSS Prevention**: Sanitized inputs and secure rendering

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For hosting and deployment platform
- **MongoDB** - For the flexible database solution
- **Cloudinary** - For image management services
- **Shadcn/ui** - For the beautiful component library
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

If you have any questions or need help:

- **Issues**: [GitHub Issues](https://github.com/yourusername/unmatched-lines/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/unmatched-lines/discussions)
- **Email**: support@unmatchedlines.com

## 🔮 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Social features (comments, likes, follows)
- [ ] Poetry contests and challenges
- [ ] AI-powered poetry recommendations
- [ ] Multi-language admin interface
- [ ] Advanced search filters
- [ ] Poetry reading mode
- [ ] Export to PDF functionality
- [ ] API for third-party integrations

---

**Made with ❤️ for poetry lovers worldwide**