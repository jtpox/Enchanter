import Express from 'express';

import Cors from 'cors';

import Winston from './helper/winston';

import { registerStreamer, showPlaylist } from './helper/webMiddleware';

export default class WebService {
  constructor(streamer) {
    this.streamer = streamer;

    this.app = Express();
    this.registerMiddleware();

    this.app.listen(process.env.WEB_PORT, () => Winston.info(`Enchanter Web Service started on port ${process.env.WEB_PORT}`));
  }

  registerMiddleware() {
    this.app.use(Cors());

    this.app.use(registerStreamer(this.streamer));
    // process.env.STREAM_RESOLUTION.split(',').join('|')
    this.app.get(`/:resolution(|${process.env.STREAM_RESOLUTION.replace(/,/g, '|')})`, showPlaylist);
  }
}
