const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const chokidar = require('chokidar');

// --- CONFIGURATION ---
const inputFilePath = path.join(__dirname, 'css', 'styles.css');
const outputDir = path.join(__dirname, 'css');
const criticalOutputFile = path.join(outputDir, 'critical.min.css');
const nonCriticalOutputFile = path.join(outputDir, 'non-critical.min.css');

// Section markers that identify CRITICAL CSS
const criticalMarkers = [
    'HEADER',
    'V1. HERO',
    'V2. PATHOGENS'
];

// --- FUNCTIONS ---

/**
 * Minifies CSS content.
 * @param {string} css - The CSS content to minify.
 * @returns {string} - The minified CSS.
 */
const minifyCSS = (css) => {
    const minifier = new CleanCSS({
        level: {
            1: {
                specialComments: 0 // Remove all comments
            },
            2: {
                all: true // Enable all structural optimizations
            }
        },
        sourceMap: false
    });
    const output = minifier.minify(css);
    if (output.errors && output.errors.length > 0) {
        console.error('Minification errors:', output.errors);
    }
    if (output.warnings && output.warnings.length > 0) {
        console.warn('Minification warnings:', output.warnings);
    }
    return output.styles;
};

/**
 * Splits the main CSS file into critical and non-critical parts based on markers.
 * @param {string} content - The full CSS content from styles.css.
 * @returns {{criticalCSS: string, nonCriticalCSS: string}}
 */
function splitCss(content) {
    const sections = content.split(/\/\*\s*---\s*---\s*([\w.\s]+)\s*---\s*\*\//);
    let criticalCSS = '';
    let nonCriticalCSS = '';

    // The first part of the split is anything before the first marker. Assume it's base/header styles.
    // Let's treat it as critical by default.
    if (sections.length > 0) {
        criticalCSS += sections[0];
    }
    
    for (let i = 1; i < sections.length; i += 2) {
        const marker = sections[i].trim().toUpperCase();
        const cssBlock = sections[i + 1] || '';

        // Check if any of the critical markers are present in the section marker
        const isCritical = criticalMarkers.some(critMarker => marker.includes(critMarker));

        if (isCritical) {
            criticalCSS += cssBlock;
        } else {
            nonCriticalCSS += cssBlock;
        }
    }
    
    return { criticalCSS, nonCriticalCSS };
}


/**
 * The main build process.
 */
function build() {
    console.log('Starting CSS build...');
    try {
        if (!fs.existsSync(inputFilePath)) {
            console.error(`Input file not found: ${inputFilePath}`);
            return;
        }
        
        const singleFileContent = fs.readFileSync(inputFilePath, 'utf8');

        const { criticalCSS, nonCriticalCSS } = splitCss(singleFileContent);

        if (!criticalCSS && !nonCriticalCSS) {
            console.warn('Both critical and non-critical CSS are empty. Check your markers.');
            return;
        }

        // Minify and write critical CSS
        if (criticalCSS) {
            const minifiedCritical = minifyCSS(criticalCSS);
            fs.writeFileSync(criticalOutputFile, minifiedCritical);
            console.log(`✅ Critical CSS built successfully: ${criticalOutputFile}`);
        } else {
            console.warn('No critical CSS was found.');
            // Create empty file if it doesn't exist
            fs.writeFileSync(criticalOutputFile, '');
        }

        // Minify and write non-critical CSS
        if (nonCriticalCSS) {
            const minifiedNonCritical = minifyCSS(nonCriticalCSS);
            fs.writeFileSync(nonCriticalOutputFile, minifiedNonCritical);
            console.log(`✅ Non-critical CSS built successfully: ${nonCriticalOutputFile}`);
        } else {
            console.warn('No non-critical CSS was found.');
             // Create empty file if it doesn't exist
            fs.writeFileSync(nonCriticalOutputFile, '');
        }

        console.log('CSS build finished.');

    } catch (err) {
        console.error('An error occurred during the build process:', err);
    }
}

// --- EXECUTION ---

// Check for --watch flag
const watchMode = process.argv.includes('--watch');

// Run the build once immediately
build();

if (watchMode) {
    console.log(`\n👀 Watching for changes in ${inputFilePath}...`);
    const watcher = chokidar.watch(inputFilePath, {
        persistent: true,
        ignoreInitial: true
    });

    watcher.on('change', (path) => {
        console.log(`\nFile changed: ${path}`);
        build();
    });

    watcher.on('error', (error) => {
        console.error(`Watcher error: ${error}`);
    });
}