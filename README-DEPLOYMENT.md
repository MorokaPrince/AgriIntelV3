# AgriIntel V3 - Deployment Guide

## 🚀 Quick Start

### Development Mode
```bash
# Start on default port (3004)
npm run dev

# Start on port 30003
npm run dev:30003

# Start on port 30004
npm run dev:30004
```

### Production Mode
```bash
# Build the application
npm run build

# Start on port 30003
npm run start:30003

# Start on port 30004
npm run start:30004

# Or use deployment scripts
npm run deploy:30003
npm run deploy:30004
```

## 📋 Demo Credentials

### Login Credentials
- **Demo User**: `demo@agriintel.co.za` / `Demo123!`
- **Pro User**: `pro@agriintel.co.za` / `Pro123!`
- **Admin User**: `admin@agriintel.co.za` / `Admin123!`

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io

### Key Features Implemented
✅ **Authentication System**
- Multi-tier user management (Beta, Professional, Enterprise)
- Role-based access control
- Persistent sessions

✅ **Dashboard & Analytics**
- Real-time data integration
- Weather service integration
- Interactive charts and metrics
- Responsive design

✅ **Animal Management**
- Complete CRUD operations
- RFID tag integration
- Health status tracking
- Location mapping

✅ **Module System**
- Health & Welfare
- Feed & Nutrition
- Financial Management
- Breeding Program
- RFID Technology

✅ **UI/UX Excellence**
- Modern, responsive design
- Real image backgrounds
- Smooth animations
- Mobile-first approach

## 🔧 Configuration

### Port Configuration
The application supports dynamic port configuration through:
- Package.json scripts for development
- Environment variables for production
- Shell scripts for automated deployment

### Database Configuration
- MongoDB connection via `src/lib/mongodb.ts`
- Environment variables for connection strings
- Seed data available via `npm run seed`

## 🌐 API Endpoints

All API routes are available under `/api/`:
- `/api/animals` - Animal management
- `/api/health` - Health records
- `/api/financial` - Financial data
- `/api/feeding` - Feed management
- `/api/breeding` - Breeding records
- `/api/rfid` - RFID data
- `/api/tasks` - Task management
- `/api/weather/[location]` - Weather data

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Tablet and desktop optimizations
- Touch-friendly interfaces
- Adaptive layouts

## 🔒 Security Features

- Authentication middleware
- Role-based route protection
- Input validation and sanitization
- Secure API endpoints

## 🚀 Deployment Checklist

- [x] Application structure analyzed
- [x] All modules implemented
- [x] Authentication system working
- [x] Responsive design implemented
- [x] Real images integrated
- [x] Port configuration set up
- [ ] Database connectivity tested
- [ ] Cross-browser testing completed
- [ ] Performance optimization done

## 📞 Support

For technical support or questions:
- Check the application logs
- Review the browser console for errors
- Verify database connectivity
- Ensure all dependencies are installed

## 🎯 Next Steps

1. **Testing**: Complete cross-device and browser testing
2. **Optimization**: Performance tuning and bundle optimization
3. **Monitoring**: Set up error tracking and analytics
4. **Backup**: Configure automated backups
5. **Scaling**: Plan for horizontal scaling if needed