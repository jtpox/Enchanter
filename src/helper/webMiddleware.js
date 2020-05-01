function registerStreamer(streamer) {
  return (req, res, next) => {
    req.streamer = streamer;
    next();
  };
}

async function showPlaylist(req, res) {
  try {
    if (!req.params.resolution) {
      throw new Error('Resolution required.');
    }

    res.set('Content-Type', 'application/x-mpegURL');
    res.send(await req.streamer.renderPlaylist(req.params.resolution));
  } catch (error) {
    res.json({
      error: error.toString(),
    });
  }
}

export { registerStreamer, showPlaylist };
