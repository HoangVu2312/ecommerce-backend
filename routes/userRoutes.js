// router and handle request related to user (using defined function from model file)
const router = require('express').Router();
const User = require('../models/User');
const jwt = require("jsonwebtoken");



// signup => handle signup request
router.post('/signup', async(req, res)=> {
  // destruct data from request body
  const {name, email, password} = req.body;

  try {
    // directly create new User from data received and send back that new User 
    const user = await User.create({name, email, password}); // create is bult-in function
    res.json(user);
  } catch (e) {
    // check if User alrady exist
    if(e.code === 11000) return res.status(400).send('Email already exists');

    // send server error
    res.status(400).send(e.message)
  }
})

// login

router.post('/login', async(req, res) => {
  const {email, password} = req.body;
  try {
    // get that user from db based on received email + password
    const user = await User.findByCredentials(email, password); // manually define function in User model

    //create token for user
    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET);
    //res.json({user, token})
    res.json(user)
  } catch (e) {
    res.status(400).send(e.message)
  }
})

// get users (for admin)

router.get('/', async(req, res)=> {
  try {
    // show all users thats not admin + the "orders" of that particular user
    const users = await User.find({ isAdmin: false }).populate('orders'); // built-in functions
    res.json(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

//get a specific user orders

router.get('/:id/orders', async (req, res)=> {
  const {id} = req.params;
  try {
    // without the populate() => "user.orders only has the "_id" of that table
    const user = await User.findById(id).populate('orders'); // add other table data to this user
    
    res.json(user.orders);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

// // Simply change the status of notification to read
router.post('/:id/updateNotifications', async(req, res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
    user.notifications.forEach((notif) => {
      notif.status = "read"
    });
    user.markModified('notifications');
    await user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message)
  }
})

module.exports = router;