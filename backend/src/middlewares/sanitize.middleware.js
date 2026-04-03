// Express 5.x compatible NoSQL injection protection
export const sanitizeInput = (req, res, next) => {
    try {
        // Sanitize req.body
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }

        // Sanitize req.params
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeObject(req.params);
        }

        // Sanitize req.headers
        if (req.headers && typeof req.headers === 'object') {
            req.headers = sanitizeObject(req.headers);
        }

        // For req.query in Express 5.x, we need to use Object.defineProperty
        if (req.query && typeof req.query === 'object') {
            const sanitizedQuery = sanitizeObject(req.query);
            
            // Use getter to bypass read-only restriction
            Object.defineProperty(req, 'query', {
                value: sanitizedQuery,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Helper function to sanitize objects (exclude password fields)
function sanitizeObject(obj, excludeKeys = ['password', 'currentPassword', 'newPassword']) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, excludeKeys));
    }

    const sanitized = {};
    for (const key in obj) {
        // Skip sanitization for password fields
        if (excludeKeys.includes(key)) {
            sanitized[key] = obj[key];
            continue;
        }

        // Remove keys starting with $ or containing .
        const sanitizedKey = key.replace(/^\$/, '_').replace(/\./g, '_');
        
        if (sanitizedKey !== key) {
            console.warn(`⚠️ Sanitized key: ${key} -> ${sanitizedKey}`);
        }

        sanitized[sanitizedKey] = sanitizeObject(obj[key], excludeKeys);
    }

    return sanitized;
}
