// Manual NoSQL injection sanitization for Express 5.x
export const sanitizeInput = (req, res, next) => {
    try {
        // Sanitize req.body
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }

        // Sanitize req.query (create new object since it's read-only in Express 5)
        if (req.query && typeof req.query === 'object') {
            const sanitizedQuery = sanitizeObject(req.query);
            // Override the query getter
            Object.defineProperty(req, 'query', {
                value: sanitizedQuery,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }

        // Sanitize req.params
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeObject(req.params);
        }

        next();
    } catch (error) {
        next(error);
    }
};


// Helper function to sanitize objects
function sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const key in obj) {
        // Remove keys starting with $ or containing .
        const sanitizedKey = key.replace(/^\$/, '_').replace(/\./g, '_');
        
        if (sanitizedKey !== key) {
            console.warn(`⚠️ Sanitized key: ${key} -> ${sanitizedKey}`);
        }

        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
    }

    return sanitized;
}
