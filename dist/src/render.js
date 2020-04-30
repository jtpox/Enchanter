'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('./helper/winston');

var _winston2 = _interopRequireDefault(_winston);

var _m3u = require('./helper/m3u8');

var _m3u2 = _interopRequireDefault(_m3u);

var _series = require('./model/series');

var _series2 = _interopRequireDefault(_series);

var _episode = require('./model/episode');

var _episode2 = _interopRequireDefault(_episode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Author's note:
 * It is a little messy, but I'll gradually fix this up over time.
 */
class Streamer {
  constructor(rpc) {
    this.rpc = rpc;
    this.previousEpisode = null;

    this.currentEpisode = null;
    this.currentTimeout = null;

    this.episodeStartTime = null;

    this.requestEpisodes = [];

    this.startTime = null;
  }

  async startPlaylist() {
    this.currentEpisode = await this.randomSeries();
    // this.previousEpisode = await this.currentEpisode;
    // this.previousEpisode = this.currentEpisode;
    const startTime = Math.floor(Date.now() / 1000);
    this.episodeStartTime = startTime;
    this.startTime = startTime;
    await this.renderPlaylist();
  }

  async renderPlaylist(resolution) {
    const m3u8 = new _m3u2['default']();
    const currentTime = Math.floor(Date.now() / 1000);
    /*
     * Calculate segment that user needs.
     */
    const needSegment = Math.floor((currentTime - this.episodeStartTime) / 10);

    /*
     * Calculate Playlist Sequence
     */
    const sequence = Math.floor((currentTime - this.startTime) / 10);

    /*
     * Verify resolution.
     */
    const verifyCurrentRes = this.verifyResolution(resolution, this.currentEpisode);

    m3u8.sequence(sequence);

    // console.log(this.currentEpisode);
    if (needSegment === 0) {
      // Starts from 0
      if (this.previousEpisode) {
        const verifyRes = this.verifyResolution(resolution, this.previousEpisode);
        m3u8.entry(this.previousEpisode, this.previousEpisode.parts - 1, verifyRes);

        m3u8.discontinue();
      }

      m3u8.entry(this.currentEpisode, 0, verifyCurrentRes);
    } else if (needSegment === 1 && this.previousEpisode) {
      // Second check for when the software is first started.
      m3u8.discontinue();

      m3u8.entry(this.currentEpisode, 0, verifyCurrentRes);

      m3u8.entry(this.currentEpisode, 1, verifyCurrentRes);
    } else if (needSegment < this.currentEpisode.parts) {
      m3u8.entry(this.currentEpisode, needSegment - 1, verifyCurrentRes);

      m3u8.entry(this.currentEpisode, needSegment, verifyCurrentRes);
    } else {
      m3u8.entry(this.currentEpisode, this.currentEpisode.parts - 2, verifyCurrentRes);

      m3u8.entry(this.currentEpisode, this.currentEpisode.parts - 1, verifyCurrentRes);
      // playlist += '#EXT-X-DISCONTINUITY\r\n';
    }
    return m3u8.render();
  }

  // eslint-disable-next-line class-methods-use-this
  verifyResolution(resolution, episode) {
    if (episode.hasResolution.includes(resolution)) {
      return resolution;
    }

    if (resolution === 1080) {
      return 720;
    }

    return 1080;
  }

  async setCurrentTimeout(episode) {
    // Clear in case queue was interrupted.
    clearTimeout(this.currentTimeout);

    this.currentTimeout = setTimeout(async () => {
      this.previousEpisode = this.currentEpisode;
      _winston2['default'].info('Finished episode: ' + String(this.previousEpisode.id) + ' (' + String(episode.duration) + 's)');

      // Make sure clear timeouts before randomSeries().
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;

      this.currentEpisode = await this.randomSeries();
      this.episodeStartTime = Math.floor(Date.now() / 1000);
    }, (episode.duration - 5) * 1000);
    // Cuts 5 second off in case retrieving data from database is slow.
  }

  // eslint-disable-next-line class-methods-use-this
  async randomSeries() {
    if (this.currentEpisode) {
      this.previousEpisode = this.currentEpisode;
    }

    let series = null;
    if (this.requestEpisodes.length > 0) {
      // const { 0 } = this.requestEpisodes;
      // series = this.requestEpisodes[0];
      [series] = this.requestEpisodes;
      _winston2['default'].info('Playing request: ' + String(series.id));
      // this.requestEpisodes = this.requestEpisodes.splice(0, 1)
      this.requestEpisodes.splice(0, 1);
    } else {
      series = await _episode2['default'].getRandom();
      _winston2['default'].info('Playing random: ' + String(series.id));
    }

    // console.log(series);
    this.rpc.emit('seriesUpdate', series);
    this.rpc.emit('requestsList', [this.requestEpisodes]);
    await this.setCurrentTimeout(series);

    return series;
  }

  async addRequest(request) {
    const episode = await _episode2['default'].findOne({ _id: request }).populate('series');
    if (this.currentEpisode.id === episode.id) {
      return false;
    }

    if (this.requestEpisodes.length > 0 && this.requestEpisodes.find(o => o.id === episode.id)) {
      return false;
    }

    if (!episode.enabled) {
      return false;
    }

    _winston2['default'].info('Added request: ' + String(episode.id));
    this.requestEpisodes.push(episode);
    this.rpc.emit('requestsList', [this.requestEpisodes]);
    return true;
  }

  async interruptRequest(request) {
    const episode = await _episode2['default'].findOne({ _id: request }).populate('series');
    if (this.currentEpisode.id === episode.id) {
      return false;
    }

    if (this.requestEpisodes.length > 0 && this.requestEpisodes.find(o => o.id === episode.id)) {
      return false;
    }

    if (!episode.enabled) {
      return false;
    }

    _winston2['default'].info('Added interrupt request: ' + String(episode.id));
    this.previousEpisode = this.currentEpisode;
    this.currentEpisode = episode;
    this.episodeStartTime = Math.floor(Date.now() / 1000);

    this.rpc.emit('seriesUpdate', episode);
    await this.setCurrentTimeout(episode);
    return true;
  }

  async clearRequests() {
    this.requestEpisodes = [];
    this.rpc.emit('requestsList', []);
  }
}
exports['default'] = Streamer;