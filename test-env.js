console.log('Testing environment variables...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('Current working directory:', process.cwd());