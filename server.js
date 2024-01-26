const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
dotenv.config()
const uploadRouter = require('./routes/users');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const  usersRouter = require('./routes/users');
const upload = require('./multer/multer');
mongoose.connect(process.env.Database_Url)
  .then(() => console.log('DB Connected!'))
  .catch(err => console.log(err));
// const userRouter = require('./routes/users');
app.use('/users', usersRouter);
app.listen(4000, () => console.log('Server ready'));

