/**
 * Verification script for checking local environment setup
 */
import { existsSync } from 'fs';
import path from 'path';

console.log('--- HP Thailand Ink Tank Intelligence Environment Check ---');
const envPath = path.resolve(process.cwd(), '.env.local');
const envExamplePath = path.resolve(process.cwd(), '.env.example');

if (!existsSync(envExamplePath)) {
  console.error('❌ .env.example is missing!');
  process.exit(1);
} else {
  console.log('✅ .env.example verified.');
}

if (!existsSync(envPath)) {
  console.log('ℹ️  .env.local not found. Using default environment configuration.');
} else {
  console.log('✅ .env.local found.');
}

console.log('✅ Environment check completed successfully.');
