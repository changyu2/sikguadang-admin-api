const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  authorId: String,
  authorName: String,
  password: String,
  type: { type: String, default: apiConst.userType.author },
  status: { type: String, default: apiConst.status.active },
  ldate: { type: Date, default: Date.now },
  cdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Author', userSchema);
