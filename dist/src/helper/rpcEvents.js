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
};