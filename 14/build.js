// const fs = require('fs');
// const path = require('path');
//
// // Function to read file content
// function readFileContent(filePath) {
//   try {
//     return fs.readFileSync(filePath, 'utf8');
//   } catch (error) {
//     console.error(`Error reading file ${filePath}:`, error);
//     return '';
//   }
// }
//
// // Function to replace include tags with actual content
// function replaceIncludes(html, baseDir) {
//   const includeRegex = /<include\s+src="([^"]+)"[^>]*>/g;
//
//   return html.replace(includeRegex, (match, src) => {
//     const filePath = path.join(baseDir, src);
//     return readFileContent(filePath);
//   });
// }
//
// // Main build function
// function buildHTML() {
//   const baseDir = __dirname;
//   const indexPath = path.join(baseDir, 'index.html');
//   let html = readFileContent(indexPath);
//
//   // Replace all includes
//   html = replaceIncludes(html, baseDir);
//
//   // Write the final HTML
//   const outputPath = path.join(baseDir, 'index.built.html');
//   fs.writeFileSync(outputPath, html);
//   console.log('Built HTML file saved to:', outputPath);
// }
//
// // Run the build
// buildHTML();