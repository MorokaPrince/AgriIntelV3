# AgriIntel V3 - Vercel Deployment Guide

## 🚀 Quick Start Deployment

This guide will help you deploy AgriIntel V3 to Vercel with your new agricultural theme.

### Prerequisites

- [GitHub Account](https://github.com)
- [Vercel Account](https://vercel.com)
- Your AgriIntel V3 repository pushed to GitHub

## Step 1: Push to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/your-username/agriintel-v3.git

# Push to GitHub
git push -u origin master
```

## Step 2: Deploy to Vercel

### Option A: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fagriintel-v3&project-name=agriintel-v3&repository-name=agriintel-v3)

### Option B: Manual Deployment

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Click "Import Git Repository"
   - Select your GitHub repository: `your-username/agriintel-v3`

3. **Configure Project**
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `/agri-intel-v3`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   Add these environment variables in the Vercel dashboard:

   ```
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agriintel-prod?retryWrites=true&w=majority
   DB_NAME=agriintel-prod

   # Authentication
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-production-secret-key-here

   # API Keys
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
   WEATHER_API_KEY=your-weather-api-key-here

   # RFID Configuration
   RFID_BAUD_RATE=9600
   RFID_TIMEOUT=5000

   # Security
   BCRYPT_ROUNDS=12
   JWT_EXPIRES_IN=7d

   # Beta Features
   ENABLE_BETA_FEATURES=true
   ENABLE_AI_ANALYTICS=false
   ENABLE_MOBILE_MONEY=true

   # Performance
   CACHE_TTL=3600
   RATE_LIMIT_REQUESTS=100
   RATE_LIMIT_WINDOW=900000

   # File Upload
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,xls,xlsx

   # Multi-tenancy
   DEFAULT_COUNTRY=ZA
   SUPPORTED_COUNTRIES=ZA,NG,KE,GH,TZ,UG,RW,MZ,BW,NA,ZW,LS,SZ,MW,ZM,CD,CG,AO,BJ,BF,BI,CV,CF,TD,KM,DJ,ER,ET,GA,GM,GN,GW,LR,LY,MG,ML,MR,MU,NE,SC,SL,SN,SO,SS,SD,TG,TN,EH,DZ,EG,LY,MA,SD,TN

   # Production-specific settings
   NODE_ENV=production
   LOG_LEVEL=info
   ENABLE_DEBUG=false
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Note your production URL

## Step 3: Post-Deployment Setup

### Database Configuration

1. **MongoDB Atlas Setup**
   - Create a production cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Update your `MONGODB_URI` with the production connection string
   - Add Vercel IPs to the IP whitelist:
     - `172.64.0.0/13`
     - `104.16.0.0/12`
     - `103.21.244.0/22`
     - `2606:4700::/32`
     - `2607:f8b0::/32`
     - `2803:f800::/32`
     - `2405:b500::/32`
     - `2405:8100::/32`
     - `2a06:98c0::/29`
     - `2c0f:f248::/32`

2. **Data Migration**
   - Run your seeding script if needed
   - Verify data integrity
   - Test CRUD operations

### Authentication Setup

1. **NextAuth Configuration**
   - Update `NEXTAUTH_URL` to your production domain
   - Verify OAuth providers (if used)
   - Test login/logout functionality

2. **Security Verification**
   - Ensure HTTPS is enabled
   - Check security headers
   - Test authentication flow

### Google Maps Setup

1. **API Key Configuration**
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Add your production domain to allowed referrers
   - Enable necessary APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API (if needed)

2. **Billing Setup**
   - Set up billing for your Google Cloud project
   - Monitor API usage

## Step 4: Testing Your Deployment

### Functional Testing

Test these key features:

1. **Application Load**
   - Visit your production URL
   - Verify no console errors
   - Check that the agricultural theme is applied

2. **Authentication**
   - Test login functionality
   - Verify dashboard access
   - Test logout

3. **Core Features**
   - Dashboard displays correctly
   - Navigation works
   - Forms submit successfully
   - Database operations work

4. **Agricultural Theme**
   - No white backgrounds visible
   - Agricultural color scheme applied
   - Glassmorphism effects working
   - Responsive design on all devices

### Performance Testing

1. **Page Load Times**
   - Use Chrome DevTools
   - Check Lighthouse scores
   - Verify <3s load times

2. **Database Performance**
   - Test API response times
   - Verify database queries are performant
   - Check for any timeouts

## Step 5: Monitoring and Maintenance

### Vercel Analytics

1. **Performance Monitoring**
   - Enable in Vercel dashboard
   - Monitor Core Web Vitals
   - Set up alerts for performance issues

2. **Error Tracking**
   - Check deployment logs
   - Monitor runtime errors
   - Set up error notifications

### Custom Monitoring

1. **Database Monitoring**
   - Monitor MongoDB Atlas metrics
   - Set up alerts for connection issues
   - Track query performance

2. **API Monitoring**
   - Monitor API response times
   - Track error rates
   - Set up uptime monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```
   Error: Cannot find module 'next'
   Solution: Ensure Node.js version is compatible (18+)
   ```

2. **Database Connection**
   ```
   Error: MongoTimeoutError
   Solution: Check MONGODB_URI and IP whitelist
   ```

3. **Authentication Issues**
   ```
   Error: Invalid NEXTAUTH_URL
   Solution: Verify callback URLs match production domain
   ```

4. **Google Maps Errors**
   ```
   Error: InvalidKeyMapError
   Solution: Check API key and domain restrictions
   ```

### Debug Commands

```bash
# Vercel logs
vercel logs your-app-name.vercel.app

# Local testing
npm run dev
npm run build
npm run test

# Check environment
npm run env
```

## 🎉 Success!

Your AgriIntel V3 application should now be live on Vercel with:

- ✅ Complete agricultural theme implementation
- ✅ All white backgrounds eliminated
- ✅ Glassmorphism effects throughout
- ✅ Responsive design
- ✅ Production-ready configuration
- ✅ Performance optimization

### Your Production URL
Your application will be available at:
```
https://agriintel-v3-yourusername.vercel.app
```

### Next Steps
1. **Share your live application** with stakeholders
2. **Monitor performance** and user feedback
3. **Set up continuous deployment** for future updates
4. **Consider adding analytics** for user insights

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs**: Review deployment logs in dashboard
2. **Test Locally**: Ensure application works in development
3. **Verify Environment**: Check all environment variables
4. **Database Connection**: Test MongoDB connectivity
5. **API Keys**: Verify all API keys are valid

**Ready to impress your users with a beautiful agricultural-themed application! 🚀**