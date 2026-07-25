import { ApiError } from "../utils/ApiError.js";
import { ZodError } from "zod";

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        let statusCode = error.statusCode || 500;
        let message = error.message || "Internal Server Error";

        if (error instanceof ZodError) {
            statusCode = 400;
            message = "Validation Error";
            const formattedErrors = error.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message
            }));
            error = new ApiError(statusCode, message, formattedErrors, err.stack);
        } else if (error.code && error.code.startsWith("P2")) {
            if (error.code === "P2002") {
                statusCode = 409;
                message = `Duplicate field value: ${error.meta?.target || "resource"}`;
            } else if (error.code === "P2025") {
                statusCode = 404;
                message = "Record not found";
            } else {
                statusCode = 400;
                message = "Database operation failed";
            }
            error = new ApiError(statusCode, message, [], err.stack);
        } else {
            error = new ApiError(statusCode, message, [], err.stack);
        }
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    if (error.statusCode === 500 || process.env.NODE_ENV === "development") {
        console.error(err);
    }

    res.status(error.statusCode).json(response);
};

export default errorHandler;
