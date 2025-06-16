# Lumiclean Landing Page Optimization

# CSS Compilation Instructions

## 1) Navigate to project directory
```bash
  cd lp
```

## 2) Install dependencies

Before running the script, install all required dependencies:

```bash
  npm install
```

## 3) One-time CSS compilation

To compile critical and non-critical styles once:

```bash
  node build-css.js
```

## 4) Automatic compilation on file changes (WATCH mode)

To automatically watch for changes in CSS files and recompile them:

```bash
  node build-css.js --watch
```

> ⚡ The script will watch all files listed in the `criticalFiles` and `nonCriticalFiles` arrays in `build-css.js`.

---

**P.S.** If you have any questions, contact the developer or refer to this README! 