const { build } = require('esbuild');
const path = require('path');

async function buildProductApi() {
  try {
    const result = await build({
      entryPoints: [path.resolve(__dirname, 'js/product-api.js')],
      bundle: true,
      format: 'esm',
      outfile: path.resolve(__dirname, 'dist/product-api.js'),
      minify: true,
      sourcemap: true,
      target: ['es2020', 'chrome80', 'firefox80', 'safari13', 'edge18'],
    });
    
    console.log('Product API build successful');
    return result;
  } catch (error) {
    console.error('Product API build failed:', error);
    process.exit(1);
  }
}

buildProductApi(); 