import { minify } from 'terser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputDir = path.join(__dirname, 'js');
const outputDir = path.join(__dirname, 'dist', 'js');

async function minifyFile(filePath) {
  const relativePath = path.relative(inputDir, filePath);
  const outputPath = path.join(outputDir, relativePath);
  const outputDirPath = path.dirname(outputPath);

  try {
    const code = await fs.readFile(filePath, 'utf8');
    const result = await minify(code, {
      // Add Terser options if needed: https://terser.org/docs/api-reference#minify-options
      sourceMap: false // Disable source maps for simplicity, enable if needed
    });

    if (result.error) {
      throw result.error;
    }

    // Ensure output directory for this file exists
    await fs.mkdir(outputDirPath, { recursive: true });
    await fs.writeFile(outputPath, result.code);
    // console.log(`   - Minified: ${relativePath} -> dist/js/${relativePath}`);
  } catch (error) {
    console.error(`❌ Error minifying ${relativePath}:`, error);
    throw error; // Re-throw to signal failure
  }
}

async function buildJS() {
  console.log('🔄 Minifying JavaScript...');
  try {
    // Ensure base output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const files = await fs.readdir(inputDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    if (jsFiles.length === 0) {
        console.log('🟡 No JavaScript files found in js/ directory.');
        return; // Exit gracefully if no JS files
    }

    const minifyPromises = jsFiles.map(file => 
      minifyFile(path.join(inputDir, file))
    );

    await Promise.all(minifyPromises);
    console.log(`✅ JavaScript minified successfully! Output dir: ${outputDir}`);

  } catch (error) {
    console.error('❌ JavaScript minification failed.');
    process.exit(1);
  }
}

buildJS(); 