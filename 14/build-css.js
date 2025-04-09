// const fs = require('fs');
// const path = require('path');
//
// // Function to read CSS file
// function readCSSFile(filePath) {
//   try {
//     return fs.readFileSync(filePath, 'utf8');
//   } catch (error) {
//     console.error(`Error reading file ${filePath}:`, error);
//     return '';
//   }
// }
//
// // Function to combine CSS files
// async function combineCSS() {
//   const baseDir = __dirname;
//   const sections = ['header', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'footer'];
//   let combinedCSS = '';
//
//   for (const section of sections) {
//     const cssPath = path.join(baseDir, section, section === 'v3' ? 'styles.css' : 'styles.css');
//     console.log(`Processing ${cssPath}...`);
//     const css = readCSSFile(cssPath);
//     combinedCSS += `/* ${section.toUpperCase()} Styles */\n${css}\n\n`;
//   }
//
//   // Write combined CSS
//   const outputPath = path.join(baseDir, 'css', 'style-buy.css');
//   fs.writeFileSync(outputPath, combinedCSS);
//   console.log('Combined CSS file saved to:', outputPath);
// }
//
// // Run the build
// combineCSS();