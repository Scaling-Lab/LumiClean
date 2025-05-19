const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

// Get absolute paths
const rootDir = __dirname;

// Configuration
const config = {
    css: {
        critical: [
            path.join(rootDir, 'header/styles.css'),
            path.join(rootDir, 'v1/styles.css'),
            path.join(rootDir, 'v2/styles.css'),
            path.join(rootDir, '../css/style-buy.css')
        ],
        nonCritical: [
            path.join(rootDir, 'v3/lumiclean-section.css'),
            path.join(rootDir, 'v4/styles.css'),
            path.join(rootDir, 'v5/styles.css'),
            path.join(rootDir, 'v6/styles.css'),
            path.join(rootDir, 'v7/styles.css'),
            path.join(rootDir, 'v8/styles.css'),
            path.join(rootDir, 'v9/styles.css'),
            path.join(rootDir, 'v10/styles.css'),
            path.join(rootDir, 'v11/styles.css'),
            path.join(rootDir, 'v12/styles.css'),
            path.join(rootDir, 'footer/styles.css')
        ]
    }
};

// Ensure css directory exists
function ensureDirectories() {
    const cssDir = path.join(rootDir, 'css');
    if (!fs.existsSync(cssDir)) {
        console.log(`Creating directory: ${cssDir}`);
        fs.mkdirSync(cssDir, { recursive: true });
    }
}

// Read and combine CSS files
function combineCSS(files) {
    return files.map(file => {
        try {
            console.log(`Reading file: ${file}`);
            return fs.readFileSync(file, 'utf8');
        } catch (err) {
            console.error(`Error reading ${file}:`, err);
            return '';
        }
    }).join('\n');
}

// Minify CSS
function minifyCSS(css) {
    const minifier = new CleanCSS({
        level: 2,
        sourceMap: false
    });
    return minifier.minify(css).styles;
}

// Process CSS files
function processCSS() {
    console.log('Processing CSS files...');
    
    try {
        // Process critical CSS
        const criticalCSS = combineCSS(config.css.critical);
        const criticalPath = path.join(rootDir, 'css/critical.min.css');
        fs.writeFileSync(criticalPath, minifyCSS(criticalCSS));
        console.log(`Critical CSS saved to: ${criticalPath}`);
        
        // Process non-critical CSS
        const nonCriticalCSS = combineCSS(config.css.nonCritical);
        const nonCriticalPath = path.join(rootDir, 'css/non-critical.min.css');
        fs.writeFileSync(nonCriticalPath, minifyCSS(nonCriticalCSS));
        console.log(`Non-critical CSS saved to: ${nonCriticalPath}`);
    } catch (err) {
        console.error('Error processing CSS:', err);
        throw err;
    }
}

// Main build function
function build() {
    console.log('Starting CSS build process...');
    try {
        ensureDirectories();
        processCSS();
        console.log('CSS build completed successfully!');
    } catch (err) {
        console.error('Build failed:', err);
        process.exit(1);
    }
}

// Run build
build();