// connect with database on mongoo website
require('dotenv').config();
const mongoose = require('mongoose')
const connectionStr = `mongodb+srv://${process.env.MONGOO_USERNAME}:${process.env.MONGOO_PASSWORD}@cluster0.fzwlydo.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(connectionStr, {useNewUrlParser: true}).then(() => console.log("connected to mongoo db"))
.catch(err => console.log(err))

// make sure to cover all error
mongoose.connection.on('err', err => {
    console.log(err)
})