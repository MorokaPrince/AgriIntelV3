# AgriIntel V3 Deployment Guide

## 🚀 Quick Deployment to Vercel

### Prerequisites
- [Vercel Account](https://vercel.com/signup) (Free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)
- MongoDB Atlas connection string
- Google Maps API key
- NextAuth environment variables

### Step 1: Prepare Environment Variables

Create a `.env.production` file with your production environment variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agriintel-prod?retryWrites=true&w=majority
MONGODB_DB=agriintel-prod

# Authentication
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Optional: Tier limits
MAX_ANIMALS=1000
MAX_USERS=50
```

### Step 2: Deploy to Vercel

#### Option A: Git Integration (Recommended)
1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit with agricultural theme"
   git branch -M main
   git remote add origin https://github.com/your-username/agriintel-v3.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: **Next.js**
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

3. **Add Environment Variables**:
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all variables from your `.env.production` file
   - Set Environment to "Production"

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (2-5 minutes)

#### Option B: Vercel CLI
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   cd agri-intel-v3
   vercel login
   vercel
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI production
   vercel env add NEXTAUTH_URL production
   # ... add all other variables
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Step 3: Verify Deployment

1. **Check Deployment Status**:
   - Visit your Vercel dashboard
   - Monitor deployment logs
   - Note your production URL (e.g., `https://agriintel-v3.vercel.app`)

2. **Test Application**:
   - Visit your deployed URL
   - Test login functionality
   - Verify MongoDB connection
   - Check Google Maps integration
   - Confirm agricultural theme is applied

## 🌐 Alternative: Deploy to Netlify

### Prerequisites
- [Netlify Account](https://netlify.com/signup)
- Git repository
- Build environment setup

### Step 1: Configure Netlify Build

1. **Create `netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
     functions = "api"

   [build.environment]
     NODE_VERSION = "20"
     NPM_FLAGS = "--production=false"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200

   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
       Referrer-Policy = "strict-origin-when-cross-origin"
   ```

2. **Create Functions Directory**:
   ```bash
   mkdir -p netlify/functions
   # Copy your API routes to this directory if needed
   ```

### Step 2: Deploy to Netlify

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Environment variables: Add all production variables

3. **Deploy**:
   - Click "Deploy site"
   - Wait for deployment completion

## 🔧 Post-Deployment Configuration

### 1. Database Setup
- **MongoDB Atlas**: Ensure your production cluster allows connections from Vercel/Netlify IPs
- **Whitelist IPs**: Add `0.0.0.0/0` temporarily for testing, then restrict to specific IPs

### 2. Authentication Configuration
- **NextAuth URLs**: Update callback URLs to your production domain
- **Google OAuth**: Add production URLs to Google Developer Console

### 3. Google Maps Configuration
- **API Key Restrictions**: Update Google Maps API key restrictions to include your production domain
- **Billing**: Ensure billing is enabled for Google Maps API

### 4. SSL and Security
- **SSL**: Both Vercel and Netlify provide free SSL certificates
- **Custom Domain**: Configure custom domain if needed
- **Security Headers**: Verify security headers are applied

## 📊 Monitoring and Analytics

### Vercel Analytics
- **Performance Monitoring**: Built-in performance insights
- **Error Tracking**: Automatic error reporting
- **Usage Analytics**: Bandwidth and function usage

### Netlify Analytics
- **Site Analytics**: Built-in analytics dashboard
- **Form Submissions**: Monitor form submissions
- **Deploy Logs**: Detailed deployment logs

## 🔄 Continuous Deployment

### Automatic Deployments
- **Git Integration**: Both platforms automatically deploy on git push
- **Preview Deployments**: Test changes before production deployment
- **Branch Deployments**: Deploy specific branches for testing

### Environment Management
- **Preview Environment**: Test with staging data
- **Production Environment**: Live production deployment
- **Environment Variables**: Different variables for each environment

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check environment variables

2. **Database Connection**:
   - Verify MongoDB connection string
   - Check IP whitelist settings
   - Ensure database is accessible

3. **Authentication Issues**:
   - Verify NextAuth configuration
   - Check callback URLs
   - Ensure secrets are properly set

4. **Google Maps Errors**:
   - Verify API key validity
   - Check billing status
   - Ensure proper domain restrictions

### Debugging Tools

1. **Vercel Logs**:
   ```bash
   vercel logs your-app-name.vercel.app
   ```

2. **Netlify Logs**:
   - Access logs through Netlify dashboard
   - Use Netlify CLI for local debugging

3. **Browser Developer Tools**:
   - Check console for JavaScript errors
   - Monitor network requests
   - Verify API responses

## 📈 Performance Optimization

### Vercel Optimizations
- **Edge Network**: Automatic global CDN
- **Image Optimization**: Built-in image optimization
- **Function Optimization**: Serverless function optimization

### Netlify Optimizations
- **Asset Optimization**: Automatic asset optimization
- **CDN**: Global content delivery network
- **Form Optimization**: Optimized form handling

## 🎉 Success!

Your AgriIntel V3 application is now deployed and accessible via a live URL. You can:

1. **Share the URL** with stakeholders for feedback
2. **Test all functionality** in the production environment
3. **Make amendments** directly in the codebase
4. **Monitor performance** and user experience
5. **Iterate and improve** based on real user feedback

The agricultural theme implementation will be fully visible and functional in the production environment, providing a premium user experience that perfectly represents your agricultural intelligence platform's mission and values.