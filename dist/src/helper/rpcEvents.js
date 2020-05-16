'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports['default'] = function (rpc, render) {
  // Register necessary events.
  rpc.event('seriesUpdate');
  rpc.event('requestsList');

  // Clear all requests.
  rpc.register('clearRequests', () => render.clearRequests())['protected']();

  // Get current playing episode.
  rpc.register('currentEpisode', () => render.currentEpisode);

  // Get request list.
  rpc.register('requestsList', () => render.requestEpisodes);

  // Render Playlist.
  rpc.register('renderPlaylist', async params => {
    const [resolution] = params; // Either 720 or 1080.
    const playlist = await render.renderPlaylist(resolution);
    return playlist;
  });

  // Add Request.
  rpc.register('addRequest', async params => {
    const [episodeId] = params;
    const request = await render.addRequest(episodeId);
    return request;
  })['protected']();

  // Interrupt Request.
  rpc.register('interruptRequest', async params => {
    const [episodeId] = params;
    const request = await render.interruptRequest(episodeId);
    return request;
  })['protected']();

  // Add series.
  // Look at ./src/model/series.js for model.
  rpc.register('addSeries', async params => {
    try {
      const [series] = params;
      if (params.length === 0 || !series.name || !series.altName || !series.poster) {
        throw new Error('All fields are required!');
      }

      const newSeries = await new _series2['default']({
        name: series.name,
        altName: series.altName,
        poster: series.poster
      }).save();

      return newSeries;
    } catch (err) {
      return err.toString();
    }
  })['protected']();

  // Add episode to series.
  // Look at ./src/model/episode.js for model.
  rpc.register('addEpisode', async params => {
    try {
      const [episode] = params;
      if (params.length === 0 || !episode.name || !episode.count || !episode.parts || !episode.folder || !episode.duration || !episode.hasResolution || !episode.enabled || !episode.series) {
        throw new Error('All fields are required!');
      }

      const newEpisode = await new _episode2['default']({
        name: episode.name,
        count: episode.count,
        parts: episode.parts,
        folder: episode.folder,
        duration: episode.duration,
        hasResolution: episode.hasResolution,
        enabled: episode.enabled,
        series: episode.series
      }).save();

      return newEpisode;
    } catch (err) {
      return err.toString();
    }
  })['protected']();
};

var _series = require('../model/series');

var _series2 = _interopRequireDefault(_series);

var _episode = require('../model/episode');

var _episode2 = _interopRequireDefault(_episode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }