'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _database = require('../database');

var _database2 = _interopRequireDefault(_database);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

const schema = _database2['default'].Schema({
  name: String,
  count: Number,
  parts: Number,
  folder: String, // Folder that is inside of the series folder.
  duration: Number,
  hasResolution: { type: Array, 'default': ['720'] },
  enabled: { type: Boolean, 'default': false },
  series: { type: _database2['default'].Schema.ObjectId, ref: 'series' },
  user: { type: _database2['default'].Schema.ObjectId, ref: 'user' },
  // Subtracting cut off time so that newly added entries can be played immediately.
  lastPlayed: { type: Date, 'default': Date.now() - process.env.VOD_CUTOFF_TIME * 60 * 60 * 1000 },
  createdAt: { type: Date, 'default': Date.now },
  lastUpdated: { type: Date, 'default': Date.now }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

class Episode {
  get requestLoad() {
    return false;
  }

  static async getRandom(exclude = null) {
    const lastPlayed = new Date();
    lastPlayed.setHours(lastPlayed.getHours() - process.env.VOD_CUTOFF_TIME);

    const count = exclude ? await this.countDocuments({
      $and: [{ id: { $ne: exclude.id } }, { enabled: true }, { lastPlayed: { $lt: lastPlayed } }]
    }) : await this.countDocuments({
      enabled: true,
      lastPlayed: { $lt: lastPlayed }
    });
    const rand = Math.floor(Math.random() * count);

    const episode = exclude ? await this.findOne({
      $and: [{ id: { $ne: exclude.id } }, { enabled: true }, { lastPlayed: { $lt: lastPlayed } }]
    }).skip(rand).populate('series') : await this.findOne({
      enabled: true,
      lastPlayed: { $lt: lastPlayed }
    }).skip(rand).populate('series');
    // console.log(`Get Random: ${episode}`);

    return episode;
  }
}

schema.loadClass(Episode);
exports['default'] = _database2['default'].model('episode', schema);