'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('winston');

const { combine, timestamp, printf } = _winston.format;

// eslint-disable-next-line no-shadow
const logFormat = printf(({ level, message, timestamp }) => '[' + String(timestamp) + '] ' + String(level) + ': ' + String(message));

const logger = (0, _winston.createLogger)({
  format: combine(timestamp(), logFormat),
  transports: [new _winston.transports.File({ filename: 'log/combined.log' }), new _winston.transports.File({
    filename: 'log/error.log',
    level: 'error'
  }), new _winston.transports.Console()]
});

exports['default'] = logger;