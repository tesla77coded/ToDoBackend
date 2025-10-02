import winston from "winston";

const logger = winston.createLogger({
  level: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({stack:true}),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({stderrLevels: ['error']}),
    new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
    new winston.transports.File({filename: 'logs/combined.log'}),
  ]
});

export default logger;
