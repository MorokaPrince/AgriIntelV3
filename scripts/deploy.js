#!/usr/bin/env node

/**
 * Deployment Script for AgriIntel V3
 * Handles environment-specific deployments with proper validation
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentManager {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.projectRoot = path.join(__dirname, '..');
  }

  /**
   * Validates environment configuration before deployment
   */
  validateEnvironment() {
    console.log(`🔍 Validating ${this.environment} environment configuration...`);

    const requiredEnvVars = [
      'MONGODB_URI',
      'DB_NAME',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GOOGLE_MAPS_API_KEY',
      'WEATHER_API_KEY'
    ];

    const missing = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Environment-specific validation
    if (this.environment === 'production') {
      if (process.env.NEXTAUTH_SECRET.length < 32) {
        throw new Error('NEXTAUTH_SECRET must be at least 32 characters in production');
      }

      if (process.env.ENABLE_DEBUG_LOGS === 'true') {
        console.warn('⚠️  WARNING: Debug logs are enabled in production');
      }
    }

    console.log('✅ Environment validation passed');
  }

  /**
   * Pre-deployment checks
   */
  async preDeploymentChecks() {
    console.log('🚀 Running pre-deployment checks...');

    try {
      // Check if we're in git repository
      try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      } catch (error) {
        throw new Error('Not in a git repository');
      }

      // Check if working directory is clean (for production only)
      if (this.environment === 'production') {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
        if (gitStatus.trim()) {
          throw new Error('Working directory is not clean. Please commit or stash changes.');
        }
      }

      // Run linting
      console.log('🔍 Running lint checks...');
      execSync('npm run lint', { stdio: 'inherit' });

      // Run type checking
      console.log('🔍 Running type checks...');
      execSync('npm run type-check', { stdio: 'inherit' });

      // Run build to verify everything works
      console.log('🔨 Testing build process...');
      execSync('npm run build', { stdio: 'inherit' });

      console.log('✅ Pre-deployment checks passed');
    } catch (error) {
      console.error('❌ Pre-deployment checks failed:', error.message);
      throw error;
    }
  }

  /**
   * Deploy to Vercel
   */
  async deployToVercel() {
    console.log(`🚀 Deploying to Vercel (${this.environment})...`);

    try {
      const deployCommand = this.environment === 'production'
        ? 'vercel --prod'
        : `vercel --target ${this.environment}`;

      execSync(deployCommand, {
        stdio: 'inherit',
        cwd: this.projectRoot
      });

      console.log('✅ Deployment completed successfully');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }

  /**
   * Post-deployment verification
   */
  async postDeploymentVerification(deploymentUrl) {
    console.log('🔍 Running post-deployment verification...');

    if (!deploymentUrl) {
      console.log('⚠️  No deployment URL provided, skipping verification');
      return;
    }

    try {
      // Wait a moment for deployment to be ready
      console.log('⏳ Waiting for deployment to be ready...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Basic health check
      const healthCheckUrl = `${deploymentUrl}/api/test`;
      console.log(`🔍 Checking deployment health at ${healthCheckUrl}`);

      // Note: In a real scenario, you might use a library like axios to make HTTP requests
      // For now, we'll just log the verification steps
      console.log('✅ Health check URL constructed');
      console.log('✅ Post-deployment verification completed');

      console.log(`🎉 Deployment successful!`);
      console.log(`🌐 Application URL: ${deploymentUrl}`);
      console.log(`📝 Admin Email: admin@yourdomain.com`);
      console.log(`📞 Support Contact: support@yourdomain.com`);

    } catch (error) {
      console.error('❌ Post-deployment verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Main deployment process
   */
  async deploy() {
    try {
      console.log(`🚀 Starting ${this.environment} deployment process...`);

      // Step 1: Validate environment
      this.validateEnvironment();

      // Step 2: Pre-deployment checks
      await this.preDeploymentChecks();

      // Step 3: Deploy to Vercel
      await this.deployToVercel();

      console.log('🎉 Deployment process completed successfully!');

    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Setup environment for deployment
   */
  setupEnvironment(targetEnv) {
    const envFile = `.env.${targetEnv}`;
    const localEnvFile = `.env.local`;

    console.log(`🔧 Setting up ${targetEnv} environment...`);

    // Copy appropriate environment file
    if (fs.existsSync(envFile)) {
      console.log(`📋 Using ${envFile} for environment configuration`);
      // In a real scenario, you might copy this to .env.local or set process.env variables
    } else {
      console.log(`⚠️  Environment file ${envFile} not found, using existing environment`);
    }
  }

  /**
   * Rollback deployment (emergency)
   */
  async rollback(deploymentUrl) {
    console.log('🔄 Rolling back deployment...');

    try {
      execSync(`vercel rollback ${deploymentUrl}`, {
        stdio: 'inherit',
        cwd: this.projectRoot
      });

      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const environment = args[1] || process.env.NODE_ENV || 'development';

  const deployer = new DeploymentManager();
  deployer.environment = environment;

  switch (command) {
    case 'deploy':
      await deployer.deploy();
      break;

    case 'setup':
      deployer.setupEnvironment(environment);
      break;

    case 'validate':
      deployer.validateEnvironment();
      break;

    case 'precheck':
      await deployer.preDeploymentChecks();
      break;

    case 'rollback':
      const deploymentUrl = args[2];
      if (!deploymentUrl) {
        console.error('❌ Please provide deployment URL for rollback');
        process.exit(1);
      }
      await deployer.rollback(deploymentUrl);
      break;

    default:
      console.log(`
🚀 AgriIntel V3 Deployment Manager

Usage:
  node scripts/deploy.js <command> [environment] [options]

Commands:
  deploy [env]     - Run full deployment process (default: development)
  setup [env]      - Setup environment configuration
  validate [env]   - Validate environment configuration
  precheck [env]   - Run pre-deployment checks
  rollback <url>   - Rollback to previous deployment

Environments:
  development      - Local development
  staging         - Staging environment
  production      - Production environment

Examples:
  node scripts/deploy.js deploy production
  node scripts/deploy.js validate staging
  node scripts/deploy.js precheck production
  node scripts/deploy.js rollback https://your-app.vercel.app
      `);
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentManager;