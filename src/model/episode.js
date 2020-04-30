import Db from '../database';

const schema = Db.Schema({
  name: String,
  count: Number,
  parts: Number,
  folder: String, // Folder that is inside of the series folder.
  duration: Number,
  hasResolution: { type: Array, default: ['720'] },
  enabled: { type: Boolean, default: false },
  series: { type: Db.Schema.ObjectId, ref: 'series' },
  user: { type: Db.Schema.ObjectId, ref: 'user' },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

schema.virtual('requestLoad').get(() => false);

schema.statics.getRandom = async function getRandom(exclude = null) {
  const count = (exclude)
    ? await this.countDocuments({
      $and: [
        { id: { $ne: exclude.id } },
        { enabled: true },
      ],
    })
    : await this.countDocuments({ enabled: true });
  const rand = Math.floor(Math.random() * count);

  const episode = (exclude)
    ? await this.findOne({
      $and: [
        { id: { $ne: exclude.id } },
        { enabled: true },
      ],
    }).skip(rand).populate('series')
    : await this.findOne({ enabled: true }).skip(rand).populate('series');
  // console.log(`Get Random: ${episode}`);

  return episode;
};

const Episode = Db.model('episode', schema);

export default Episode;
