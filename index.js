
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const upload = require("./config/multer")
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.use(express.static(path.join(__dirname, 'uploads')))
app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

// Define Routes
app.use('/api/users',upload.single("file"), require('./routes/users'));

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
})
