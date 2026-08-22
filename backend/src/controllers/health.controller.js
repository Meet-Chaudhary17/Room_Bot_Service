import { healthService } from '../services/health.service.js';

export const healthController = {
  getLiveness(_request, response) {
    response.status(200).json({ success: true, data: healthService.getLiveness() });
  },
};

