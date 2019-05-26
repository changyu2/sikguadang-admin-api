const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: String,
  userName: String,
  postcode: String,
  address: String,
  addressDetail: String,
  recipientName: String,
  recipientPhoneNumber: String,
  productName: String,
  productImage: String,
  optionItemName: String,
  optionItemPrice: String,
  price: String,
  discountPrice: String,
  totalPrice: String,
  productQty: String,
  deliveryDate: String,
  purchaseMethod: String,
  imp_uid: String,
  merchant_uid: String,
  status: String,
  cdate: { type: Date, default: Date.now },
  edate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
