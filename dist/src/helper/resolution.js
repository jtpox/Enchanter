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
  return episode.hasResolution.reduce((total, res) => {
    if (res <= resolution) return res;
    return total;
  });
}