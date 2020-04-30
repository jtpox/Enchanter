'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

_dotenv2['default'].config();

/*
 * REMEMBER: https://www.cyberciti.biz/faq/how-to-secure-mongodb-nosql-production-database/
 */

_mongoose2['default'].connect('mongodb://' + String(process.env.DB_HOST) + ':' + String(process.env.DB_PORT) + '/' + String(process.env.DB_AUTH), {
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

exports['default'] = _mongoose2['default'];