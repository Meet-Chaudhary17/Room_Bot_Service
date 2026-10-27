import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
export function authenticate(req, _res, next) { const header = req.get('authorization'); if (!header?.startsWith('Bearer ')) return next(new AppError(401, 'UNAUTHORIZED', 'Authentication is required.')); try { req.user = jwt.verify(header.slice(7), env.JWT_SECRET); next(); } catch { next(new AppError(401, 'UNAUTHORIZED', 'Authentication token is invalid or expired.')); } }
export const authorize = (...roles) => (req, _res, next) => roles.includes(req.user?.role) ? next() : next(new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource.'));
