'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class M3u8 {
  constructor() {
    // this.output = '#EXTM3U\r\n#EXT-X-VERSION:3\r\n';
    this.output = ['#EXTM3U', '#EXT-X-VERSION:3', '#EXT-X-TARGETDURATION:' + String(process.env.STREAM_SEGMENT_TIME)];
  }

  add(entry) {
    this.output.push(entry);
  }

  sequence(sequence) {
    // this.output += `#EXT-X-MEDIA-SEQUENCE:${sequence}\r\n`;
    this.add('#EXT-X-MEDIA-SEQUENCE:' + String(sequence));
  }

  entry(episode, part, resolution) {
    const fileName = process.env.STREAM_FILE_NAME.replace('{n}', part);
    this.add('#EXTINF:' + String(process.env.STREAM_SEGMENT_TIME) + '.000,');
    this.add(String(process.env.S3_URL) + '/' + String(episode.folder) + '/' + String(resolution) + '/' + String(fileName));
  }

  discontinue() {
    this.add('#EXT-X-DISCONTINUITY');
  }

  render() {
    return this.output.join('\r\n');
  }
}
exports['default'] = M3u8;