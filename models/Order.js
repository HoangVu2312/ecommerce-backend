// order model (an order can have multiple products)

const mongoose = require('mongoose');
const OrderSchema = mongoose.Schema({
  products: {
    type: Object
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId, // a reference to another Mongoose model (contain the unique identifier of the user who placed the order)
    ref: 'User', // User model
    required: true
  },
  status: {
    type: String,
    default: 'processing' // waiting to be deliveried
  },
  total : {
    type: Number,
    default: 0
  },
  count: {
    type: Number,
    default: 0
  },
  date: {
    type: String,
    default: new Date().toISOString().split('T')[0]
  },
  address: {
    type: String,
  },
  country: {
    type: String,
  }
}, {minimize: false});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;