import { HTTP_STATUS } from '../constants/http-status.js';
import { AppError } from '../utils/app-error.js';
import { logger } from '../utils/logger.js';

export function errorHandler(error, request, response, _next) {
  const isOperational = error instanceof AppError;
  const status = isOperational ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const code = isOperational ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = error?.message || 'An unexpected error occurred.';

  logger.error({ error, requestId: request.id }, 'Unhandled request error');

  response.status(status).json({
    success: false,
    error: { code, message, stack: error?.stack },
    requestId: request.id,
  });
}

