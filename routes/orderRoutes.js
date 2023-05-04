const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');



// Create a new order
router.post('/', async(req, res)=> {
  const io = req.app.get('socketio');
  const {userId, cart, country, address} = req.body;
  try {
    const user = await User.findById(userId);
    const order = await Order.create({owner: user._id, products: cart, country, address}); // create a table in order field
    
    // count and property of order (NOT sub-protrties of products)
    order.count = cart.count;
    order.total = cart.total;
    await order.save();

    // clear the user cart after payment
    user.cart =  {total: 0, count: 0};
    user.orders.push(order);  // access and change the user model right here

    // create notification => send to admin
    const notification = {status: 'unread', message: `New order from ${user.name}`, time: new Date()};  // this is event 
    io.sockets.emit('new-order', notification);

    // add notification to admin's account if user is not admin
    if (!user.isAdmin) {
      const adminUser = await User.findOne({isAdmin: true});  // find admin user
      adminUser.notifications.unshift(notification);  // add notification to admin's notifications
      adminUser.markModified('notifications');  // mark notifications as modified
      await adminUser.save();  // save admin user
    }

    console.log(notification)

    user.markModified('orders');
    await user.save();

    res.status(200).json(user)

  } catch (e) {
    res.status(400).json(e.message)
  }
})


// getting all orders (for admin)
router.get('/', async(req, res)=> {
  try {
    const orders = await Order.find().populate('owner', ['email', 'name']); // add the owner field with only 2 property "email" and "name"
    res.status(200).json(orders);
  } catch (e) {
    res.status(400).json(e.message)
  }
})


//shipping order (set the status property of order)

router.patch('/:id/mark-shipped', async(req, res)=> {
  const io = req.app.get('socketio');

  // get data from request and params
  const {ownerId} = req.body;
  const {id} = req.params; //order._id
  try {
    const user = await User.findById(ownerId);  // ?? why do we need user here
    await Order.findByIdAndUpdate(id, {status: 'shipped'});
    const orders = await Order.find().populate('owner', ['email', 'name']);

    // create notification event => send to user
    const notification = {status: 'unread', message: `Order ${id} shipped with success`, time: new Date()};
    io.sockets.emit("notification", notification, ownerId);
    user.notifications.push(notification);
    await user.save();


    res.status(200).json(orders)
  } catch (e) {
    res.status(400).json(e.message);
  }
})
module.exports = router;