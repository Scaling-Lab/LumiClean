import * as esbuild from 'esbuild';

// Build Lucide with only the icons we need
try {
  await esbuild.build({
    entryPoints: ['src/icons.js'],
    bundle: true,
    minify: true,
    treeShaking: true,
    outfile: 'dist/lucide.min.js',
    format: 'iife',
    globalName: 'lucide',
    loader: {
      '.js': 'jsx',
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });
  console.log('✅ Lucide icons built successfully');
} catch (error) {
  console.error('❌ Error building Lucide icons:', error);
  process.exit(1);
} 