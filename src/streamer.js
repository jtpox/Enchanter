import Winston from './helper/winston';

import M3u8 from './helper/m3u8';

import resolutionStepDown from './helper/resolution';

import Series from './model/series';

import Episode from './model/episode';

export default class Streamer {
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
    /*
     * Checks if the requestEpisodes list is empty.
     * Index 0 of requestEpisodes will then be played and removed from list.
     */
    if (this.requestEpisodes.length > 0) {
      [series] = this.requestEpisodes;
      this.requestEpisodes.splice(0, 1);
      Winston.info(`Playing request: ${series.id}`);
    } else {
      series = await Episode.getRandom();
      Winston.info(`Playing random: ${series.id}`);
    }

    // Set lastPlayed for  episode.
    series.lastPlayed = Date.now();
    await series.save();

    // Notify RPC.
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
      Winston.info(`Finished episode: ${this.previousEpisode.id} (${episode.duration}s)`);

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
    const m3u8 = new M3u8();
    const currentTime = Math.floor(
      Date.now() / 1000,
    ); // Get current time when the function is called.

    const needSegment = Math.floor(
      (currentTime - this.episodeStartTime) / process.env.STREAM_SEGMENT_TIME,
    );

    m3u8.sequence(Math.floor(
      (currentTime - this.startTime) / process.env.STREAM_SEGMENT_TIME,
    )); // Calculate the HLS playlist sequence.

    const stepCurrentRes = resolutionStepDown(resolution, this.currentEpisode);

    if (needSegment === 0) {
      if (this.previousEpisode) {
        const stepRes = resolutionStepDown(resolution, this.previousEpisode);
        m3u8.entry(
          this.previousEpisode,
          this.previousEpisode.parts - 1, // Because parts start from 0
          stepRes,
        );

        m3u8.discontinue();
      }

      m3u8.entry(
        this.currentEpisode,
        0,
        stepCurrentRes,
      );
    } else if (needSegment === 1 && this.previousEpisode) {
      m3u8.discontinue();

      m3u8.entry(
        this.currentEpisode,
        0,
        stepCurrentRes,
      );

      m3u8.entry(
        this.currentEpisode,
        1,
        stepCurrentRes,
      );
    } else if (needSegment < this.currentEpisode.parts) {
      m3u8.entry(
        this.currentEpisode,
        needSegment - 1,
        stepCurrentRes,
      );

      m3u8.entry(
        this.currentEpisode,
        needSegment,
        stepCurrentRes,
      );
    } else {
      m3u8.entry(
        this.currentEpisode,
        this.currentEpisode.parts - 2,
        stepCurrentRes,
      );

      m3u8.entry(
        this.currentEpisode,
        this.currentEpisode.parts - 1,
        stepCurrentRes,
      );
    }

    return m3u8.render();
  }

  async addRequest(request) {
    const episode = await Episode.findOne({ _id: request }).populate('series');
    if (this.currentEpisode.id === episode.id) {
      return false;
    }

    // Checks is the episode is already in the requestEpisodes
    if (
      this.requestEpisodes.length > 0
      && this.requestEpisodes.find((o) => o.id === episode.id)
    ) {
      return false;
    }

    if (!episode.enabled) {
      return false;
    }

    this.requestEpisodes.push(episode);
    this.rpc.emit('requestsList', [this.requestEpisodes]);

    Winston.info(`Added request: ${episode.id}`);
    return true;
  }

  async interruptRequest(request) {
    const episode = await Episode.findOne({ _id: request }).populate('series');
    if (this.currentEpisode.id === episode.id) {
      return false;
    }

    // Checks is the episode is already in the requestEpisodes
    if (
      this.requestEpisodes.length > 0
      && this.requestEpisodes.find((o) => o.id === episode.id)
    ) {
      return false;
    }

    if (!episode.enabled) {
      return false;
    }

    Winston.info(`Stopped currently playing: ${this.currentEpisode.id} (${(Math.floor(Date.now() / 1000)) - this.episodeStartTime}s)`);

    this.previousEpisode = this.currentEpisode;
    this.currentEpisode = episode;
    this.episodeStartTime = Math.floor(Date.now() / 1000);

    await this.setCurrentTimeout(episode);

    Winston.info(`Playing interrupt: ${episode.id}`);
    this.rpc.emit('seriesUpdate', episode);
    return true;
  }

  clearRequests() {
    this.requestEpisodes = [];
    this.rpc.emit('requestsList', []);

    Winston.info('Cleared request list.');
  }
}
