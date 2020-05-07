"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = stepDown;
/*
 * Step down resolution.
 * Example: if 1080p is not available, the next option would be 720p.
 * Author's note: need a better way to do this.
 * My logic:
 * Array of [1080, 720]
 * 1) When 1080 is given, it will check against the array.
 * 2) If available, will return stated resolution.
 * 3) If not available, will return check step 1 with lowered resolution.
 */
function stepDown(resolution, episode) {
  if (episode.hasResolution.includes(resolution)) {
    return resolution;
  }

  // Sort resolutions into ascending.
  // episode.hasResolution.sort((a, b) => a - b);
  const resolutionArray = new Uint32Array(episode.hasResolution).sort();

  for (let i = 0; i < resolutionArray.length; i += 1) {
    if (resolutionArray[i] > resolution) {
      return resolutionArray[i];
    }
  }

  // Return lowest by default.
  return resolutionArray[0];
}