/**
 * Centralized error handling middleware
 */

export class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export function errorHandler(err, req, res, next) {
    let { statusCode, message, details } = err;

    // Default to 500 if not set
    statusCode = statusCode || 500;

    // Determine error type
    let errorType = 'InternalError';
    if (statusCode === 400) errorType = 'ValidationError';
    else if (statusCode === 404) errorType = 'NotFoundError';
    else if (statusCode === 409) errorType = 'DuplicateError';
    else if (statusCode === 502) errorType = 'ExternalAPIError';

    // Log error for debugging
    if (statusCode >= 500) {
        console.error('Server Error:', {
            message,
            statusCode,
            details,
            stack: err.stack,
            path: req.path
        });
    }

    // Send response
    const response = {
        error: errorType,
        message: message || 'An unexpected error occurred'
    };

    if (details) {
        response.details = details;
    }

    res.status(statusCode).json(response);
}

export function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'NotFoundError',
        message: `Route ${req.method} ${req.path} not found`
    });
}
