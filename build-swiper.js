import * as esbuild from 'esbuild';

// Build Swiper (JS only) as a self-executing bundle that exposes global `Swiper`
try {
  await esbuild.build({
    entryPoints: ['swiper/bundle'], // Entry from the installed package
    bundle: true,
    minify: true,
    outfile: 'dist/swiper.min.js',
    format: 'iife',
    globalName: 'Swiper', // Expose as window.Swiper for our non-module scripts
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    footer: {
      js: 'window.Swiper = window.Swiper?.Swiper || window.Swiper?.default || window.Swiper;'
    }
  });
  console.log('✅ Swiper library built successfully');
} catch (error) {
  console.error('❌ Error building Swiper library:', error);
  process.exit(1);
} 