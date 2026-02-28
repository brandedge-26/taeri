import { ZodError } from "zod";

export const globalErrorHandler = (err, req, res, next) => {
    if (err instanceof ZodError) {
        const issues = err.issues || [];
        const details = issues.map((issue) => {
            const path = issue.path && issue.path.length ? issue.path.join(".") : "field";
            return `${path}: ${issue.message}`;
        });

        return res.status(400).json({
            success: false,
            message: details.length ? details.join("; ") : "Validation error",
            errors: details,
        });
    }

    const statusCode = err.statusCode || 500;
    const errMessage = err.message || "Server error";

    return res.status(statusCode).json({
        success: false,
        message: errMessage,
    });

};
