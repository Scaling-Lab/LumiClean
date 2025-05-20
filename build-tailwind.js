import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory (ES modules equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure the dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Log start of build process
console.log('🔄 Building Tailwind CSS...');

try {
  // Build Tailwind CSS using @tailwindcss/cli
  execSync(
    'npx @tailwindcss/cli -i ./src/styles.css -o ./dist/styles.css --minify',
    { stdio: 'inherit' }
  );
  
  console.log('✅ Tailwind CSS built successfully!');
} catch (error) {
  console.error('❌ Error building Tailwind CSS:', error.message);
  process.exit(1);
} 