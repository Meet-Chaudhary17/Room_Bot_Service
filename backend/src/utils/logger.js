import winston from "winston";

const format = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    process.env.NODE_ENV === "production"
        ? winston.format.json()
        : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, stack }) => {
                  return `[${timestamp}] ${level}: ${message}${stack ? `\n${stack}` : ""}`;
              })
          )
);

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format,
    transports: [
        new winston.transports.Console()
    ]
});
