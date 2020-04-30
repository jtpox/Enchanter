import Db from '../database';

import Episode from './episode';

const schema = Db.Schema({
  name: String,
  altName: [String],
  poster: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
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
  justOne: false,
});

const Series = Db.model('series', schema);

export default Series;
