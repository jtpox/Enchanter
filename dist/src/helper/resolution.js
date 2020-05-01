"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = stepDown;
/*
 * Step down resolution.
 * Example: if 1080p is not available, the next option would be 720p.
 * Author's note: need a better way to do this.
 */
function stepDown(resolution, episode) {
  if (episode.hasResolution.includes(resolution)) {
    return resolution;
  }

  if (resolution === 1080) {
    return 720;
  }

  return 1080;
}