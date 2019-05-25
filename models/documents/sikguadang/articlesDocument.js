const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const articleSchema = mongoose.Schema({
  title: String,
  thumbnailUrl: [],
  bannerUrl: [],
  imageUrl: [],
  hashTag: String,
  source: String,
  sourceLink: String,
  category: Number,
  status: { type: String, default: apiConst.status.active },
  cdate: { type: Date, default: Date.now },
  sdate: { type: Date, default: Date.now },
  edate: { type: Date, default: Date.now },
  authorId: { type: ObjectId, ref: 'Author' }
});

module.exports = mongoose.model('Article', articleSchema);
