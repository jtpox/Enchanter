'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('./helper/winston');

var _winston2 = _interopRequireDefault(_winston);

var _m3u = require('./helper/m3u8');

var _m3u2 = _interopRequireDefault(_m3u);

var _resolution = require('./helper/resolution');

var _resolution2 = _interopRequireDefault(_resolution);

var _series = require('./model/series');

var _series2 = _interopRequireDefault(_series);

var _episode = require('./model/episode');

var _episode2 = _interopRequireDefault(_episode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

class Streamer {
  constructor(rpc) {
    this.rpc = rpc;

    // Stored episode objects.
    this.previousEpisode = null;
    this.currentEpisode = null;

    // Vod timings.
    this.startTime = null; // Logs when the stream started.
    this.episodeStartTime = null; // Logs when the episode started.
    this.currentTimeout = null; // Timeout object for the currently playing episode.

    // Lists
    this.requestEpisodes = [];

    this.startStream();
  }

  async startStream() {
    this.currentEpisode = await this.randomEpisode();

    this.startTime = Math.floor(Date.now() / 1000);
    this.episodeStartTime = this.startTime; // First episode starts at the same time.
  }

  async randomEpisode() {
    if (this.currentEpisode) this.previousEpisode = this.currentEpisode;

    let series = null;
    let playRequest = false; // Used for logging in Winston.
    /*
     * Checks if the requestEpisodes list is empty.
     * Index 0 of requestEpisodes will then be played and removed from list.
     */
    if (this.requestEpisodes.length > 0) {
      [series] = this.requestEpisodes;
      this.requestEpisodes.splice(0, 1);

      playRequest = true;
    } else {
      series = await _episode2['default'].getRandom();
    }

    // Notify logs and RPC.
    _winston2['default'].info('Playing ' + (playRequest ? 'request' : 'random') + ' ' + String(series.id));
    this.rpc.emit('seriesUpdate', series);
    this.rpc.emit('requestsList', [this.requestEpisodes]);

    // Set episode timeout.
    await this.setCurrentTimeout(series);

    return series;
  }

  async setCurrentTimeout(episode) {
    // Clear in case queue was interrupted.
    clearTimeout(this.currentTimeout);

    this.currentTimeout = setTimeout(async () => {
      this.previousEpisode = this.currentEpisode;
      _winston2['default'].info('Finished episode: ' + String(this.previousEpisode.id) + ' (' + String(episode.duration) + 's)');

      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;

      this.currentEpisode = await this.randomEpisode();
      this.episodeStartTime = Math.floor(Date.now() / 1000);
    }, (episode.duration - 5) * 1000); // Cuts 5 second off in case retrieving data is slow.
  }

  /*
   * Render the HSL playlist.
   */
  async renderPlaylist(resolution) {
    const m3u8 = new _m3u2['default']();
    const currentTime = Math.floor(Date.now() / 1000); // Get current time when the function is called.

    const needSegment = Math.floor((currentTime - this.episodeStartTime) / process.env.STREAM_SEGMENT_TIME);

    m3u8.sequence(Math.floor((currentTime - this.startTime) / process.env.STREAM_SEGMENT_TIME)); // Calculate the HLS playlist sequence.

    const stepCurrentRes = (0, _resolution2['default'])(resolution, this.currentEpisode);

    if (needSegment === 0) {
      if (this.previousEpisode) {
        const stepRes = (0, _resolution2['default'])(resolution, this.previousEpisode);
        m3u8.entry(this.previousEpisode, this.previousEpisode.parts - 1, // Because parts start from 0
        stepRes);

        m3u8.discontinue();
      }

      m3u8.entry(this.currentEpisode, 0, stepCurrentRes);
    } else if (needSegment === 1 && this.previousEpisode) {
      m3u8.discontinue();

      m3u8.entry(this.currentEpisode, 0, stepCurrentRes);

      m3u8.entry(this.currentEpisode, 1, stepCurrentRes);
    } else if (needSegment < this.currentEpisode.parts) {
      m3u8.entry(this.currentEpisode, needSegment - 1, stepCurrentRes);

      m3u8.entry(this.currentEpisode, needSegment, stepCurrentRes);
    } else {
      m3u8.entry(this.currentEpisode, this.currentEpisode.parts - 2, stepCurrentRes);

      m3u8.entry(this.currentEpisode, this.currentEpisode.parts - 1, stepCurrentRes);
    }

    return m3u8.render();
  }

  async addRequest(request) {
    const episode = await _episode2['default'].findOne({ _id: request }).populate('series');
    if (this.currentEpisode.id === episode.id) {
      return false;
    }

    // Checks is the episode is already in the requestEpisodes
    if (this.requestEpisodes.length > 0 && this.requestEpisodes.find(o => o.id === episode.id)) {
      return false;
    }

    if (!episode.enabled) {
      return false;
    }

    this.requestEpisodes.push(episode);
    this.rpc.emit('requestsList', [this.requestEpisodes]);

    _winston2['default'].info('Added request: ' + String(episode.id));
    return true;
  }

  async interruptRequest(request) {
    const episode = await _episode2['default'].findOne({ _id: request }).populate('series');
    if (this.currentEpisode.id === episode.id) {
      return false;
    }

    // Checks is the episode is already in the requestEpisodes
    if (this.requestEpisodes.length > 0 && this.requestEpisodes.find(o => o.id === episode.id)) {
      return false;
    }

    if (!episode.enabled) {
      return false;
    }

    this.previousEpisode = this.currentEpisode;
    this.currentEpisode = episode;
    this.episodeStartTime = Math.floor(Date.now() / 1000);

    await this.setCurrentTimeout(episode);

    this.rpc.emit('seriesUpdate', episode);
    return true;
  }

  clearRequests() {
    this.requestEpisodes = [];
    this.rpc.emit('requestsList', []);

    _winston2['default'].info('Cleared request list.');
  }
}
exports['default'] = Streamer;