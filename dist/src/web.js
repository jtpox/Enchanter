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

var _series = require('./model/series');

var _series2 = _interopRequireDefault(_series);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

class WebService {
  constructor(streamer) {
    this.streamer = streamer;

    this.app = (0, _express2['default'])();
    this.registerMiddleware();

    this.app.listen(process.env.WEB_PORT, () => _winston2['default'].info('Enchanter Web Service started on port ' + String(process.env.WEB_PORT)));
  }

  registerMiddleware() {
    this.app.use((0, _cors2['default'])());

    this.app.use((0, _webMiddleware.registerStreamer)(this.streamer));
    this.app.get('/:resolution(|720|1080)', _webMiddleware.showPlaylist);

    this.app.get('/test', async (req, res) => {
      res.json((await _series2['default'].findOne({ _id: '5e83657b0da33c281447cd30' }).populate('episodes')));
    });
  }
}
exports['default'] = WebService;