import { AppError } from '../utils/app-error.js';
export const validate = (schema) => (req, _res, next) => { const result = schema.safeParse(req.body || {}); if (!result.success) return next(new AppError(400, 'VALIDATION_ERROR', result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '))); req.body = result.data; next(); };
