# AgriIntel V3 Local Testing Guide

## 🚀 **How to Run the Application Locally**

### **Prerequisites**
- Node.js 18+ installed
- MongoDB connection (local or Atlas)
- All environment variables configured

### **Step 1: Install Dependencies**
```bash
cd agri-intel-v3
npm install
```

### **Step 2: Set Up Environment Variables**
Create a `.env.local` file in the root directory:
```bash
# Database Configuration
MONGODB_URI=mongodb+srv://luckyrakgama_db_user:I6n9hgOCzpQ5VFAq@agriintelv3.a085mrg.mongodb.net/AgriIntelV3?retryWrites=true&w=majority&appName=AgriIntelV3
DB_NAME=AgriIntelV3

# Authentication
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=agri-intel-v3-super-secret-jwt-key-2024-production-ready

# API Keys
GOOGLE_MAPS_API_KEY=AIzaSyBI59tTTz6BuKekWEB83ena7lb1-34VT1s
WEATHER_API_KEY=AIzaSyBTR9MEEbnThqj04rDanb7pBeZCjvJaDsw

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

# Development Settings
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_DEBUG=true
```

### **Step 3: Run the Development Server**
```bash
npm run dev
```

### **Step 4: Access the Application**
- **Local URL**: `http://localhost:3002`
- **Dashboard**: `http://localhost:3002/dashboard`
- **Login**: `http://localhost:3002/auth/login`

## 🔍 **What to Look For**

### **Agricultural Theme Verification**
✅ **Check these visual elements:**

1. **Background Colors**:
   - Main background should be `Forest Deep` (#0f2410)
   - No white backgrounds visible anywhere
   - Agricultural color palette applied

2. **Glassmorphism Effects**:
   - Semi-transparent overlays on cards
   - Blur effects on backgrounds
   - Smooth transitions

3. **Gradient Animations**:
   - 15-second shifting color cycles
   - Animated backgrounds
   - Smooth gradient transitions

4. **Component Transformations**:
   - DashboardLayout with agricultural theme
   - Modal with terracotta accents
   - DataTable with agricultural styling
   - ChartCustomizer with theme consistency
   - GradientCard with gold accents
   - AnimalForm with agricultural inputs
   - LoadingSpinner with agricultural colors

### **Functionality Testing**
✅ **Test these features:**

1. **Navigation**:
   - Sidebar navigation works
   - All menu items accessible
   - Responsive design on mobile

2. **Authentication**:
   - Login page loads
   - Authentication flow works
   - Protected routes accessible

3. **Database Operations**:
   - MongoDB connection established
   - CRUD operations work
   - Data persistence functional

4. **API Integration**:
   - Google Maps API loads
   - Weather API functional
   - External services accessible

## 🐛 **Common Issues and Solutions**

### **Issue 1: Build Errors**
```bash
# If you see TypeScript errors during build
npm run type-check
# Fix any TypeScript issues reported
```

### **Issue 2: ESLint Errors**
```bash
# Run linting to check for code issues
npm run lint
# Fix any linting errors
npm run lint:fix
```

### **Issue 3: Environment Variables Missing**
```bash
# Check if .env.local exists and has all required variables
# Verify MongoDB connection string is correct
# Ensure API keys are valid
```

### **Issue 4: Database Connection Issues**
```bash
# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error);"
```

### **Issue 5: Port Already in Use**
```bash
# Change port in package.json or use different port
npm run dev:3003  # Use port 3003 instead
```

## 📊 **Performance Monitoring**

### **Check Loading Times**
- Page load should be under 3 seconds
- Images should load quickly
- Charts should render smoothly

### **Memory Usage**
- Monitor browser memory usage
- Check for memory leaks
- Verify efficient resource loading

### **Console Errors**
- Open browser developer tools
- Check Console tab for errors
- Look for any warnings or issues

## 🔧 **Debugging Tools**

### **Browser Developer Tools**
1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Monitor API calls and loading times
3. **Elements Tab**: Inspect CSS and HTML structure
4. **Performance Tab**: Analyze rendering performance

### **Next.js Development Tools**
- **Hot Reload**: Changes should reflect immediately
- **Error Overlay**: Next.js shows detailed error messages
- **Build Information**: Check build logs for issues

## 📱 **Mobile Testing**

### **Responsive Design**
- Test on different screen sizes
- Verify mobile navigation works
- Check touch interactions
- Ensure forms are mobile-friendly

### **Mobile Performance**
- Test on actual mobile devices
- Check loading times on mobile networks
- Verify touch responsiveness

## 🎨 **Visual Quality Checklist**

### **Color Consistency**
- [ ] Forest Deep background (#0f2410)
- [ ] Earth Terracotta accents (#cd853f)
- [ ] Wheat Cream text (#f5deb3)
- [ ] Gold Harvest highlights (#daa520)
- [ ] Sage Light overlays (#9caf88)

### **Animation Quality**
- [ ] Smooth gradient transitions
- [ ] Proper hover effects
- [ ] Loading animations work
- [ ] Page transitions smooth

### **Typography**
- [ ] Readable fonts
- [ ] Proper font weights
- [ ] Good line spacing
- [ ] Consistent text colors

## 🚨 **If You Find Issues**

### **Report Issues**
1. **Describe the problem**: What exactly is wrong?
2. **Steps to reproduce**: How can I recreate the issue?
3. **Expected behavior**: What should happen instead?
4. **Actual behavior**: What actually happens?
5. **Screenshots**: Visual evidence of the problem
6. **Console errors**: Any error messages in browser console

### **Common Fixes**
1. **Clear cache**: `npm cache clean --force`
2. **Reinstall dependencies**: Delete `node_modules` and `package-lock.json`, then `npm install`
3. **Restart development server**: Stop and restart `npm run dev`
4. **Check environment**: Verify all environment variables are set

## 📞 **Getting Help**

If you encounter issues:
1. **Check this guide** for common solutions
2. **Review console errors** for specific error messages
3. **Verify environment setup** matches requirements
4. **Test with minimal configuration** to isolate issues

**Remember**: I cannot see the running application, so please provide detailed information about any issues you encounter!