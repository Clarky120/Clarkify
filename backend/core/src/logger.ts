import winston from "winston";
const { combine, timestamp, errors, printf } = winston.format;

// Custom colorized format
const colorizedFormat = printf(
  ({ level, message, service, stack, timestamp, ...metadata }) => {
    // Colors for terminal
    const colors = {
      level: {
        error: "\x1b[32m", // green
        warn: "\x1b[33m", // yellow
        info: "\x1b[34m", // blue
        debug: "\x1b[36m", // cyan
      },
      property: "\x1b[94m", // bright blue
      string: "\x1b[32m", // green
      reset: "\x1b[0m", // reset
    };

    // Format like JSON but with colors
    let output = "{\n";
    output += `  ${colors.property}"level"${colors.reset}: ${colors.string}"${level}"${colors.reset},\n`;

    if (message) {
      output += `  ${colors.property}"message"${colors.reset}: ${colors.string}"${message}"${colors.reset},\n`;
    }

    if (service) {
      output += `  ${colors.property}"service"${colors.reset}: ${colors.string}"${service}"${colors.reset},\n`;
    }

    if (stack) {
      output += `  ${colors.property}"stack"${colors.reset}: ${colors.string}"${stack}"${colors.reset},\n`;
    }

    if (timestamp) {
      output += `  ${colors.property}"timestamp"${colors.reset}: ${colors.string}"${timestamp}"${colors.reset}\n`;
    }

    // Add any additional metadata
    const metaKeys = Object.keys(metadata);
    if (metaKeys.length > 0 && metaKeys[0] !== "0") {
      for (const key of metaKeys) {
        if (key === "error") continue;
        const value = JSON.stringify(metadata[key]);
        output += `  ${colors.property}"${key}"${colors.reset}: ${colors.string}${value}${colors.reset},\n`;
      }
    }

    output += "}";
    return output;
  }
);

const logger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    timestamp({
      format: "YYYY-MM-DDTHH:mm:ss.SSSZ",
    }),
    colorizedFormat
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
