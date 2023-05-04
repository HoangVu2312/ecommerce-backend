// models file for users
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({

  //_id  => auto created by mongoose

  name: {
    type: String,
    required: [true, 'is required']
  },

  email: {
    type: String,
    required: [true, 'is required'],
    unique: true,
    index: true,
    validate: {
      validator: function(str){
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(str);
      },
      message: props => `${props.value} is not a valid email`   // get data from user directly
    }
  },

  password: {
    type: String,
    required: [true, 'is required']
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  cart: {
    type: Object,
    default: {
      total: 0,
      count: 0
    }
  },

  notifications: {
    type: Array,
    default: []
  },

//   one user has many orders
  orders: [{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}] // refer to another mongoose model

}, {minimize: false});  // save all properties of model (even when value is null or undefined) => keep the schema structure intact



// Define a function for user-model to return a user  => use at another file
UserSchema.statics.findByCredentials = async function(email, password) {

  // check if user exist
  const user = await User.findOne({email});
  if(!user) throw new Error('invalid credentials');

  // check if password is correct
  const isSamePassword = bcrypt.compareSync(password, user.password);
  if(isSamePassword) return user;

  throw new Error('invalid credentials');  // if not throw err
}

// Send user back to fr without password and with json type (built-in method => automatically call)
UserSchema.methods.toJSON = function(){
    //create an instance of model
  const user = this;  //=> this = UserSchema
    //turn model to object => not mutate model when deleting password
  const userObject = user.toObject();
  delete userObject.password;

  return userObject;
}


// before saving => hash the password ()
UserSchema.pre('save', function (next) { // will be called before a save() operation is performed on the User model

  const user = this;  //  a reference to the current user object(UserSchema)

  //   when user update data => check if they change their password => if NOT => skip re-hashing
  if(!user.isModified('password')) return next();

  //   hasing
  bcrypt.genSalt(10, function(err, salt){
    if(err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash){
      if(err) return next(err);

      user.password = hash;
      next();
    })

  })

})

// when remove a user => remove his orders too
UserSchema.pre('remove', function(next){
  this.model('Order').remove({owner: this._id}, next);
})


const User = mongoose.model('User', UserSchema);

module.exports = User;