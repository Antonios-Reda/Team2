const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");

const env = process.env.NODE_ENV || "development";

const logDir = "log";

const datePatternConfiguration = {
  default: "YYYY-MM-DD",
  everHour: "YYYY-MM-DD-HH",
  everMinute: "YYYY-MM-DD-THH-mm",
};

const numberOfDaysToKeepLog = 30;
const fileSizeToRotate = 1; // MB

// create log folder if not exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-results.log`,
  datePattern: datePatternConfiguration.everHour,
  zippedArchive: true,
  maxSize: `${fileSizeToRotate}m`,
  maxFiles: `${numberOfDaysToKeepLog}d`,
});

const logger = createLogger({
  level: env === "development" ? "verbose" : "info",

  handleExceptions: true,

  format: format.combine(
    format.label({ label: path.basename(module.parent.filename) }),

    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),

    format.printf((info) => {
      const message = info.message || "Unknown error";

      return `${info.timestamp} [${info.label}] ${info.level}: ${JSON.stringify(message)}`;
    }),
  ),

  transports: [
    new transports.Console({
      level: "info",

      handleExceptions: true,

      format: format.combine(
        format.colorize(),

        format.timestamp(),

        format.printf((info) => {
          const message = info.message || "Unknown error";

          return `${info.timestamp} ${info.level}: ${message}`;
        }),
      ),
    }),

    dailyRotateFileTransport,
  ],
});

logger.stream = {
  write: (message) => {
    logger.info(message);
  },
};

module.exports = logger;
