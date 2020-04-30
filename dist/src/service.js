'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rpcWebsockets = require('rpc-websockets');

var _render = require('./render');

var _render2 = _interopRequireDefault(_render);

var _web = require('./web');

var _web2 = _interopRequireDefault(_web);

var _winston = require('./helper/winston');

var _winston2 = _interopRequireDefault(_winston);

var _rpcAuth = require('./helper/rpcAuth');

var _rpcAuth2 = _interopRequireDefault(_rpcAuth);

var _rpcEvents = require('./helper/rpcEvents');

var _rpcEvents2 = _interopRequireDefault(_rpcEvents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

class Service {
  constructor() {
    this.rpc = null;
    this.render = null;
    this.web = null;

    this.startRpc();
    this.startRender();
    this.startWeb();
  }

  startRpc() {
    this.rpc = new _rpcWebsockets.Server({
      port: process.env.RPC_PORT,
      host: process.env.RPC_HOST
    });

    this.rpc.setAuth(_rpcAuth2['default']);

    _winston2['default'].info('Enchanter RPC Service has started on port ' + String(process.env.RPC_PORT));
  }

  startWeb() {
    this.web = new _web2['default'](this.render);
  }

  startRender() {
    this.render = new _render2['default'](this.rpc);
    this.render.startPlaylist();

    (0, _rpcEvents2['default'])(this.rpc, this.render);
  }
}
exports['default'] = Service;