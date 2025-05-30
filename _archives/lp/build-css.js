const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const chokidar = require('chokidar');

// Define critical and non-critical CSS files
const criticalFiles = [
    'header/styles.css',
    'v1/styles.css',
    'v2/styles.css',
    '../css/style-buy.css'
];

const nonCriticalFiles = [
    'v3/lumiclean-section.css',
    'v4/styles.css',
    'v5/styles.css',
    'v6/styles.css',
    'v7/styles.css',
    'v8/styles.css',
    'v9/styles.css',
    'v10/styles.css',
    'v11/styles.css',
    'v12/styles.css',
    'footer/styles.css'
];

// Create css directory if it doesn't exist
if (!fs.existsSync('css')) {
    fs.mkdirSync('css');
}

// Function to read and combine CSS files
function combineCSS(files) {
    return files.map(file => {
        try {
            return fs.readFileSync(file, 'utf8');
        } catch (err) {
            console.error(`Error reading ${file}:`, err);
            return '';
        }
    }).join('\n');
}

// Minify CSS
const minifyCSS = (css) => {
    const minifier = new CleanCSS({
        level: 2,
        sourceMap: false
    });
    return minifier.minify(css).styles;
};

function buildAll() {
    // Process critical CSS
    const criticalCSS = combineCSS(criticalFiles);
    fs.writeFileSync('css/critical.min.css', minifyCSS(criticalCSS));

    // Process non-critical CSS
    const nonCriticalCSS = combineCSS(nonCriticalFiles);
    fs.writeFileSync('css/non-critical.min.css', minifyCSS(nonCriticalCSS));

    console.log('CSS files have been combined and minified successfully!');
}

// Check for --watch argument
if (process.argv.includes('--watch')) {
    // Watch all CSS files in both arrays
    const filesToWatch = [...criticalFiles, ...nonCriticalFiles];
    const watcher = chokidar.watch(filesToWatch, { ignoreInitial: true });
    console.log('Watching CSS files for changes...');
    buildAll();
    watcher.on('change', (filePath) => {
        console.log(`File changed: ${filePath}`);
        buildAll();
    });
    watcher.on('add', (filePath) => {
        console.log(`File added: ${filePath}`);
        buildAll();
    });
    watcher.on('unlink', (filePath) => {
        console.log(`File removed: ${filePath}`);
        buildAll();
    });
} else {
    buildAll();
}