'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _winston = require('./helper/winston');

var _winston2 = _interopRequireDefault(_winston);

var _webMiddleware = require('./helper/webMiddleware');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

class WebService {
  constructor(render) {
    this.render = render;

    this.app = (0, _express2['default'])();
    this.registerMiddleware();

    this.app.listen(process.env.WEB_PORT, () => _winston2['default'].info('Enchanter Web Service started on port ' + String(process.env.WEB_PORT)));
  }

  registerMiddleware() {
    this.app.use((0, _cors2['default'])());

    this.app.use((0, _webMiddleware.registerRender)(this.render));
    this.app.get('/:resolution(|720|1080)', _webMiddleware.showPlaylist);
  }
}
exports['default'] = WebService;