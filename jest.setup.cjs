const { TextEncoder, TextDecoder } = require('util');

// Polyfill global TextEncoder/TextDecoder for jsdom in Node
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
} 