const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "combined.log",
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.Console(),
  ],
});
module.exports = logger;
