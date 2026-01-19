import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import routes from './api/routes.js';
import { errorHandler, notFoundHandler } from './api/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.port;

// Middleware
const corsOptions = {
    origin: config.nodeEnv === 'production'
        ? process.env.ALLOWED_ORIGIN || 'https://yourdomain.com'
        : '*'
};
app.use(cors(corsOptions));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Static files for frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// API routes
app.use('/api', routes);

// Fallback to serve frontend
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../../frontend/index.html'));
    }
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Paper Repository API running on http://localhost:${PORT}`);
    console.log(`📚 Ready to manage papers from arXiv and DBLP`);
    console.log(`🔧 Environment: ${config.nodeEnv}`);
});

export default app;