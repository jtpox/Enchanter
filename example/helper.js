/*
 * A guide to create helpers for the RPC Service.
 * this.rpc is the WebSocket instantiation from rpc-websockets.
 * https://www.npmjs.com/package/rpc-websockets
 */

export default class StreamHelper {
  constructor(rpc) {
    this.rpc = rpc;

    this.auth = this.rpc.login({ password: process.env.RPC_PASSWORD });
  }

  clear() {
    return new Promise((resolve, reject) => {
      this.auth.then(() => {
        this.rpc.call('clearRequests')
          .then(() => resolve(true))
          .catch((err) => reject(err));
      });
    });
  }

  request(id) {
    return new Promise((resolve, reject) => {
      this.auth.then(() => {
        this.rpc.call('addRequest', [id])
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      });
    });
  }

  interrupt(id) {
    return new Promise((resolve, reject) => {
      this.auth.then(() => {
        this.rpc.call('interruptRequest', [id])
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      });
    });
  }

  currentEpisode() {
    return new Promise((resolve, reject) => {
      this.rpc.call('currentEpisode')
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  requestsList() {
    return new Promise((resolve, reject) => {
      this.rpc.call('requestsList')
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  /*
   * name: String,
   * altName: Array<String>
   * poster: String
   */
  addSeries(
    name,
    altName,
    poster,
  ) {
    return new Promise((resolve, reject) => {
      this.auth.then(() => {
        this.rpc.call('addSeries', [{
          name,
          altName,
          poster,
        }])
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      });
    });
  }

  /*
   * name: String,
   * count: Number,
   * parts: Number,
   * folder: String,
   * duration: Number,
   * hasResolution: Array<Number>
   * enabled: Boolean
   * series: String
   *
   * Note: "series" will be the "id" variable you receive after calling addSeries
   */
  addEpisode(
    name,
    count,
    parts,
    folder,
    duration,
    hasResolution,
    enabled,
    series,
  ) {
    return new Promise((resolve, reject) => {
      this.auth.then(() => {
        this.rpc.call('addEpisode', [{
          name,
          count,
          parts,
          folder,
          duration,
          hasResolution,
          enabled,
          series,
        }])
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      });
    });
  }
}
