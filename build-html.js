import { minify } from 'html-minifier-terser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { load } from 'cheerio';
import { sync as globSync } from 'glob';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = path.join(__dirname, 'index.html');
const outputPath = path.join(__dirname, 'dist', 'index.html');
const outputDir = path.dirname(outputPath);

// Function to process a single HTML file
async function processHtmlFile(inputFile, outputDirRoot) {
  // Calculate output path preserving directory structure relative to project root
  const relativePath = path.relative(__dirname, inputFile);
  const outputFile = path.join(outputDirRoot, relativePath);
  const outputDir = path.dirname(outputFile);

  console.log(`Processing HTML: ${inputFile} -> ${outputFile}`);

  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    let htmlContent = await fs.readFile(inputFile, 'utf8');
    const $ = load(htmlContent);

    // Example modification: Add build timestamp (can be adapted)
    const timestamp = new Date().toISOString();
    $('body').append(`<!-- Built: ${timestamp} -->`);

    // Add any other HTML processing/optimizations here

    await fs.writeFile(outputFile, $.html(), 'utf8');
    console.log(`HTML file processed and saved to ${outputFile}`);

  } catch (error) {
    console.error(`Error processing HTML file ${inputFile}:`, error);
    throw error; // Re-throw to signal build failure
  }
}

async function buildHTML() {
  const outputDirRoot = path.resolve(__dirname, 'dist');
  // Glob pattern to find index.html recursively in all subdirectories
  // Excludes node_modules, dist, .netlify, .cursor, etc.
  const pattern = '**/index.html';
  const ignorePatterns = ['node_modules/**', 'dist/**', '.netlify/**', '.cursor/**', 'tests/**'];

  try {
    const files = globSync(pattern, { cwd: __dirname, ignore: ignorePatterns, absolute: true });

    if (files.length === 0) {
      console.warn('No HTML files found to process with pattern:', pattern);
      return;
    }

    console.log('Found HTML files to process:', files.map(f => path.relative(__dirname, f)));

    // Process all found files concurrently
    await Promise.all(files.map(file => processHtmlFile(file, outputDirRoot)));

    console.log('All HTML files processed.');

  } catch (error) {
    console.error('Error during HTML build:', error);
    throw error;
  }
}

export { buildHTML };

// ES Module equivalent for checking if the script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildHTML().catch(err => {
    console.error(err);
    process.exit(1);
  });
} 