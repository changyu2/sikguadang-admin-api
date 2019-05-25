const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileMetaSchema = new Schema({
  code: String,
  fileKey: String,
  collectionName: String,
  documentId: { type: Schema.Types.ObjectId },
  width: Number,
  height: Number,
  size: Number,
  cdate: { type: Date, default: Date.now },
  edate: { type: Date, default: Date.now },
  downloadCount: { type: Date, default: 0 }
});

module.exports = mongoose.model('FileMeta', fileMetaSchema);
