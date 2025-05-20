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

// Log start of the build process
console.log('🚀 Starting build process...');

// Function to execute a build script
async function runBuild(scriptPath, name) {
  console.log(`\n🔄 Running ${name} build...`);
  try {
    const module = await import(scriptPath);
    console.log(`✅ ${name} build completed successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} build failed:`, error);
    return false;
  }
}

// Run builds
const results = await Promise.all([
  runBuild('./build-lucide.js', 'Lucide icons'),
  runBuild('./build-tailwind.js', 'Tailwind CSS'),
  runBuild('./build-swiper.js', 'Swiper'),
  runBuild('./build-html.js', 'HTML Minification'),
  runBuild('./build-js.js', 'JavaScript Minification')
]);

const [lucideSuccess, tailwindSuccess, swiperSuccess, htmlSuccess, jsSuccess] = results;

// Summary
console.log('\n📋 Build Summary:');
console.log(`Lucide icons: ${lucideSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`Tailwind CSS: ${tailwindSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`Swiper: ${swiperSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`HTML Minify: ${htmlSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`JS Minify: ${jsSuccess ? '✅ Success' : '❌ Failed'}`);

// Exit with error if any build failed
if (!lucideSuccess || !tailwindSuccess || !swiperSuccess || !htmlSuccess || !jsSuccess) {
  console.error('\n❌ Build process failed');
  process.exit(1);
}

console.log('\n🎉 All builds completed successfully!'); 