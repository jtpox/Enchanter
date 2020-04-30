'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('./helper/winston');

var _winston2 = _interopRequireDefault(_winston);

var _series = require('./model/series');

var _series2 = _interopRequireDefault(_series);

var _episode = require('./model/episode');

var _episode2 = _interopRequireDefault(_episode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// https://stackoverflow.com/questions/48482423/video-js-width-100-height-100-is-not-working
// https://stackoverflow.com/questions/10275667/socket-io-connected-user-count
// https://www.toptal.com/apple/introduction-to-http-live-streaming-hls
// https://stackoverflow.com/questions/31357965/realtime-hls-file-playback-with-nodejs
// https://stackoverflow.com/questions/50795350/how-to-use-ext-x-discontinuity-sequence-when-creating-an-infinite-hls-stream-tha
class Streamer {
  constructor(rpc) {
    this.rpc = rpc;
    this.previousEpisode = null;

    this.currentEpisode = null;
    this.currentTimeout = null;

    this.episodeStartTime = null;

    this.requestEpisodes = [];

    this.startTime = null;
    this.playlist = '';
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
    const currentTime = Math.floor(Date.now() / 1000);
    let playlist = '#EXTM3U\r\n#EXT-X-VERSION:3\r\n';
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

    playlist += '#EXT-X-MEDIA-SEQUENCE:' + String(sequence) + '\r\n';
    playlist += '#EXT-X-TARGETDURATION:10\r\n';

    // console.log(this.currentEpisode);
    if (needSegment === 0) {
      // Starts from 0
      if (this.previousEpisode) {
        const verifyRes = this.verifyResolution(resolution, this.previousEpisode);
        playlist += '#EXTINF:10.000,\r\n' + String(process.env.S3_URL) + '/' + String(this.previousEpisode.folder) + '/' + String(verifyRes) + '/fileSequence' + (this.previousEpisode.parts - 1) + '.ts\r\n';
        playlist += '#EXT-X-DISCONTINUITY\r\n';
      }

      // playlist += '#EXT-X-DISCONTINUITY\r\n';
      playlist += '#EXTINF:10.000,\r\n' + String(process.env.S3_URL) + '/' + String(this.currentEpisode.folder) + '/' + String(verifyCurrentRes) + '/fileSequence0.ts\r\n';
    } else if (needSegment === 1 && this.previousEpisode) {
      // Second check for when the software is first started.
      playlist += '#EXT-X-DISCONTINUITY\r\n';
      playlist += '#EXTINF:10.000,\r\n' + String(process.env.S3_URL) + '/' + String(this.currentEpisode.folder) + '/' + String(verifyCurrentRes) + '/fileSequence0.ts\r\n';
      playlist += '#EXTINF:10.000,\r\n' + String(process.env.S3_URL) + '/' + String(this.currentEpisode.folder) + '/' + String(verifyCurrentRes) + '/fileSequence1.ts\r\n';
    } else if (needSegment < this.currentEpisode.parts) {
      playlist += '#EXTINF:10.000,\r\n' + String(process.env.S3_URL) + '/' + String(this.currentEpisode.folder) + '/' + String(verifyCurrentRes) + '/fileSequence' + (needSegment - 1) + '.ts\r\n';
      playlist += '#EXTINF:10.000,\r\n' + String(process.env.S3_URL) + '/' + String(this.currentEpisode.folder) + '/' + String(verifyCurrentRes) + '/fileSequence' + String(needSegment) + '.ts\r\n';
    } else {
      playlist += '#EXTINF:10.000,\r\n' + String(process.env.S3_URL) + '/' + String(this.currentEpisode.folder) + '/' + String(verifyCurrentRes) + '/fileSequence' + (this.currentEpisode.parts - 2) + '.ts\r\n';
      playlist += '#EXTINF:10.000,\r\n' + String(process.env.S3_URL) + '/' + String(this.currentEpisode.folder) + '/' + String(verifyCurrentRes) + '/fileSequence' + (this.currentEpisode.parts - 1) + '.ts\r\n';
      // playlist += '#EXT-X-DISCONTINUITY\r\n';
    }
    return playlist;
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