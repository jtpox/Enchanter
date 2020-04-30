import Express from 'express';

import Cors from 'cors';

import Winston from './helper/winston';

import { registerRender, showPlaylist } from './helper/webMiddleware';

export default class WebService {
  constructor(render) {
    this.render = render;

    this.app = Express();
    this.registerMiddleware();

    this.app.listen(process.env.WEB_PORT, () => Winston.info(`Enchanter Web Service started on port ${process.env.WEB_PORT}`));
  }

  registerMiddleware() {
    this.app.use(Cors());

    this.app.use(registerRender(this.render));
    this.app.get('/:resolution(|720|1080)', showPlaylist);
  }
}
