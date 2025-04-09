const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Proxy middleware configuration
const proxyOptions = {
    target: 'https://uvlizer.myshopify.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    },
    onProxyRes: function(proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
};

// Use proxy for /api routes
app.use('/api', createProxyMiddleware(proxyOptions));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 