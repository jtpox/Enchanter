'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _database = require('../database');

var _database2 = _interopRequireDefault(_database);

var _episode = require('./episode');

var _episode2 = _interopRequireDefault(_episode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

const schema = _database2['default'].Schema({
  name: String,
  altName: [String],
  poster: { type: String, 'default': null },
  createdAt: { type: Date, 'default': Date.now },
  lastUpdated: { type: Date, 'default': Date.now }
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

/* schema.virtual('episodes').get(async () => {
  const episodes = await Episode.find({ series: this.id });
  return episodes;
}); */

schema.virtual('requestEvent').get(() => false);

schema.virtual('episodes', {
  ref: 'episode',
  localField: '_id',
  foreignField: 'series',
  justOne: false
});

const Series = _database2['default'].model('series', schema);

exports['default'] = Series;