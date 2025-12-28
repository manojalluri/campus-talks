#!/usr/bin/env node

/**
 * Campus Talks - Production Setup Helper
 * Generates secure secrets for production deployment
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Campus Talks - Production Setup Helper\n');
console.log('=========================================\n');

// Generate secure random strings
const generateSecret = (length = 64) => {
    return crypto.randomBytes(length).toString('hex');
};

const generatePassword = (length = 24) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const values = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        password += charset[values[i] % charset.length];
    }
    return password;
};

// Generate all secrets
const secrets = {
    JWT_SECRET: generateSecret(32),
    HASH_PEPPER: generateSecret(32),
    ADMIN_PASSWORD: generatePassword(24)
};

console.log('✅ Generated Secure Secrets:\n');
console.log('Copy these to your .env file:\n');
console.log('PORT=5000');
console.log(`MONGO_URI=<your-production-mongodb-uri>`);
console.log(`JWT_SECRET=${secrets.JWT_SECRET}`);
console.log(`ADMIN_PASSWORD=${secrets.ADMIN_PASSWORD}`);
console.log(`HASH_PEPPER=${secrets.HASH_PEPPER}`);
console.log('NODE_ENV=production\n');

// Option to save to file
const envExample = `# Production Environment Variables
# Generated on ${new Date().toISOString()}

PORT=5000
MONGO_URI=<your-production-mongodb-uri>
JWT_SECRET=${secrets.JWT_SECRET}
ADMIN_PASSWORD=${secrets.ADMIN_PASSWORD}
HASH_PEPPER=${secrets.HASH_PEPPER}
NODE_ENV=production

# IMPORTANT NOTES:
# 1. NEVER commit this file to git
# 2. Store these values securely (password manager)
# 3. Update MONGO_URI with your production database
# 4. Save the ADMIN_PASSWORD - you'll need it to login
`;

const envPath = path.join(__dirname, '.env.production.example');
fs.writeFileSync(envPath, envExample);

console.log(`📁 Saved to: ${envPath}\n`);
console.log('⚠️  SECURITY WARNINGS:\n');
console.log('   1. NEVER commit .env files to git');
console.log('   2. Store your ADMIN_PASSWORD in a secure password manager');
console.log('   3. Update MONGO_URI with your production database URL');
console.log('   4. Keep these secrets completely private\n');

console.log('📋 Next Steps:\n');
console.log('   1. Copy .env.production.example to .env on your server');
console.log('   2. Update MONGO_URI with production connection string');
console.log('   3. Test the connection with: npm start');
console.log('   4. Save your admin password securely before deploying\n');

console.log('✅ Setup complete! Ready for production deployment.\n');
