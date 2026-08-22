export const healthService = {
  getLiveness() {
    return {
      service: 'room-bot-service-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  },
};

