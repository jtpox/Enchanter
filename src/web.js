import Express from 'express';

import Cors from 'cors';

import Winston from './helper/winston';

import { registerStreamer, showPlaylist } from './helper/webMiddleware';

import Series from './model/series';

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
    this.app.get('/:resolution(|720|1080)', showPlaylist);

    this.app.get('/test', async (req, res) => {
      res.json(await Series.findOne({ _id: '5e83657b0da33c281447cd30' }).populate('episodes'));
    });
  }
}
