const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const inquirySchema = mongoose.Schema({
  title: String,
  text: String,
  userName: String,
  password: String,
  userId: String,
  answer: {
    authorName: String,
    text: String,
    answerDate: Date
  },
  authorId: { type: ObjectId, ref: 'Author' },
  status: { type: String, default: apiConst.status.active },
  sdate: { type: Date, default: Date.now },
  cdate: { type: Date, default: Date.now },
  edate: { type: Date, default: Date.now }
});

autoIncrement.initialize(mongoose.connection);
inquirySchema.plugin(autoIncrement.plugin, {
  model: 'Inquiry',
  field: 'number',
  startAt: 1,
  incrementBy: 1
});

module.exports = mongoose.model('Inquiry', inquirySchema);
