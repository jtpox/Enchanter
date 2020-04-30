export default class M3u8 {
  constructor() {
    // this.output = '#EXTM3U\r\n#EXT-X-VERSION:3\r\n';
    this.output = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      `#EXT-X-TARGETDURATION:${process.env.STREAM_SEGMENT_TIME}`,
    ];
  }

  add(entry) {
    this.output.push(entry);
  }

  sequence(sequence) {
    // this.output += `#EXT-X-MEDIA-SEQUENCE:${sequence}\r\n`;
    this.add(`#EXT-X-MEDIA-SEQUENCE:${sequence}`);
  }

  entry(episode, part, resolution) {
    const fileName = process.env.STREAM_FILE_NAME.replace('{n}', part);
    this.add(`#EXTINF:${process.env.STREAM_SEGMENT_TIME}.000,`);
    this.add(
      `${process.env.S3_URL}/${episode.folder}/${resolution}/${fileName}`,
    );
  }

  discontinue() {
    this.add('#EXT-X-DISCONTINUITY');
  }

  render() {
    return this.output.join('\r\n');
  }
}
