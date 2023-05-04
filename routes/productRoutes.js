const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');

//get products;
router.get('/', async(req, res)=> {
  try {
    const sort = {'_id': -1}  //=> re-order the products
    const products = await Product.find().sort(sort);
    res.status(200).json(products);
  } catch (e) {
    res.status(400).send(e.message);
  }
})


//create product
router.post('/', async(req, res)=> {
  try {
    // only need the product, no need user_id
    const {name, description, price, category, images: pictures} = req.body;
    const product = await Product.create({name, description, price, category, pictures});
    const products = await Product.find();
    res.status(201).json(products);
  } catch (e) {
    res.status(400).send(e.message);
  }
})


// update product

router.patch('/:id', async(req, res)=> {
  const {id} = req.params;  // id here is from param NOT a property of req.body object
  try {
    // get new data for this product from request body
    const {name, description, price, category, images: pictures} = req.body;
    await Product.findByIdAndUpdate(id, {name, description, price, category, pictures}); // updating product

    const products = await Product.find();
    res.status(200).json(products);  // return all products (included updated product)
  } catch (e) {
    res.status(400).send(e.message);
  }
})


// delete product

router.delete('/:id', async(req, res)=> {
    // destruct data from request
  const {id} = req.params;  // id of delting product
  const {user_id} = req.body;  // user doing this request


  try {
    // check if current logged-in user is admin
    const user = await User.findById(user_id);
    if(!user.isAdmin) return res.status(401).json("You don't have permission");

    await Product.findByIdAndDelete(id);
    const products = await Product.find(); // get all remain products
    res.status(200).json(products);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

// get one specific product (and products in the same category)
router.get('/:id', async(req, res)=> {
  const {id} = req.params;
  try {
    const product = await Product.findById(id);
    const similar = await Product.find({category: product.category}).limit(5);  // return 5 products with the same category

    res.status(200).json({product, similar})
  } catch (e) {
    res.status(400).send(e.message);
  }
});


// get products besed on category
router.get('/category/:category', async(req,res)=> {
  const {category} = req.params;
  try {
    let products;
    const sort = {'_id': -1} //sort the results in descending order based on the _id field

    if(category == "all"){
      products = await Product.find().sort(sort);
    } else {
      products = await Product.find({category}).sort(sort)
    }
    res.status(200).json(products)
  } catch (e) {
    res.status(400).send(e.message);
  }
})
 



//------------------ cart routes------------------//


// Add to cart
router.post('/add-to-cart', async(req, res)=> {
  // destruc data from front-end
  const {userId, productId, price} = req.body;

  try {
    // find the user sending the request
    const user = await User.findById(userId);
    const userCart = user.cart; // access to that user's cart

    if(user.cart[productId]){
      userCart[productId] += 1; // plus one that product
    } else {
      userCart[productId] = 1; // add 1 product to the cart
    }

    userCart.count += 1; // update amount of all products
    userCart.total = Number(userCart.total) + Number(price); // total price
    user.cart = userCart;
    
    user.markModified('cart'); // mark the changed property
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

// plus one of existing product in cart
router.post('/increase-cart', async(req, res)=> {
  const {userId, productId, price} = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total += Number(price);
    userCart.count += 1;
    userCart[productId] += 1;
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Minus one of existing product in cart
router.post('/decrease-cart', async(req, res)=> {
  const {userId, productId, price} = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total -= Number(price);
    userCart.count -= 1;
    userCart[productId] -= 1;
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

// Delete a product from user cart
router.post('/remove-from-cart', async(req, res)=> {
  const {userId, productId, price} = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total -= Number(userCart[productId]) * Number(price);
    userCart.count -= userCart[productId];
    delete userCart[productId];
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
})




module.exports = router;