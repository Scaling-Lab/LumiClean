export default {
  // Use jsdom environment for DOM APIs
  testEnvironment: 'jsdom',
  // Polyfill TextEncoder/TextDecoder for jsdom in Node
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  // No transforms needed for pure ESM
  transform: {},
}; 