'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function registerRender(render) {
  return (req, res, next) => {
    req.render = render;
    next();
  };
}

async function showPlaylist(req, res) {
  try {
    if (!req.params.resolution) {
      throw new Error('Resolution required.');
    }

    res.set('Content-Type', 'application/x-mpegURL');
    res.send((await req.render.renderPlaylist(req.params.resolution)));
  } catch (error) {
    res.json({
      error: error.toString()
    });
  }
}

exports.registerRender = registerRender;
exports.showPlaylist = showPlaylist;