const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
require('./connection')   // only need to import so connection can be used in any other files
const server = http.createServer(app);
const { verifyToken } = require('./auth');



// Set up socket-io
const {Server} = require('socket.io');
const io = new Server(server, {
  cors: 'https://ecommerce-gsv7.onrender.com',
  methods: ['GET', 'POST', 'PATCH', "DELETE"]
})


// Import required routes
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes');
const imageRoutes = require('./routes/imageRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Add middleware crossing between client-server
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Defining routes for the app:
app.use('/users', userRoutes)
app.use('/products', verifyToken, productRoutes);
app.use('/images', imageRoutes);
app.use('/orders', verifyToken, orderRoutes);


// Defining a route for handling Stripe payments:
app.post('/create-payment', async(req, res) => {
  const {amount} = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card']
    });
    res.status(200).json(paymentIntent)
  } catch (error){
    res.status(400).json(error.message)
  }
})


server.listen(4000, () => {
    console.log('server runing at port', 4000)
})


app.set('socketio', io);
