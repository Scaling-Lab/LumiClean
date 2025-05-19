# Lumiclean Landing Page Optimization

## Installation and Build

### Step 1: Navigate to project directory
```bash
cd 14
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Run build
```bash
npm run build
```

### Step 4: Watch mode (optional)
For automatic CSS minification when files change:
```bash
npm run watch
```

## Optimizations

The project includes the following optimizations:
- CSS minification
- Critical and non-critical CSS separation
- Automatic CSS compilation on file changes

## Project Structure

```
14/
├── css/              # Minified CSS files
├── header/           # Header styles
├── v1-v12/           # Section styles
├── footer/           # Footer styles
├── build.js          # Build script
└── package.json      # Project dependencies
```

## Development

When working on CSS files:
1. Edit the original CSS files in their respective directories
2. The watch mode will automatically minify and combine them
3. Minified files will be available in the `css` directory:
   - `critical.min.css` - Critical styles
   - `non-critical.min.css` - Non-critical styles 