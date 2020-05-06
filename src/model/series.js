import Db from '../database';

import Episode from './episode';

const schema = Db.Schema({
  name: String,
  altName: [String],
  poster: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
}, {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

/*
 * No idea how to do this in ES6 classes.
 * Series.populate('episodes');
 */
schema.virtual('episodes', {
  ref: 'episode',
  localField: '_id',
  foreignField: 'series',
  justOne: false,
});

class Series {
  get requestEvent() { return false }
}

schema.loadClass(Series);
export default Db.model('series', schema);
