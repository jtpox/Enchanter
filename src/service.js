import { Server } from 'rpc-websockets';

// import Render from './render';
import Streamer from './streamer';

import Web from './web';

import Winston from './helper/winston';

import rpcAuth from './helper/rpcAuth';

import rpcEvents from './helper/rpcEvents';

export default class Service {
  constructor() {
    this.rpc = null;
    this.streamer = null;
    this.web = null;

    this.startRpc();
    this.startRender();
    this.startWeb();
  }

  startRpc() {
    this.rpc = new Server({
      port: process.env.RPC_PORT,
      host: process.env.RPC_HOST,
    });

    this.rpc.setAuth(rpcAuth);

    Winston.info(`Enchanter RPC Service has started on port ${process.env.RPC_PORT}`);
  }

  startWeb() {
    this.web = new Web(this.streamer);
  }

  startRender() {
    // this.render = new Render(this.rpc);
    // this.render.startPlaylist();
    this.streamer = new Streamer(this.rpc);

    rpcEvents(this.rpc, this.streamer);
  }
}
