const multer = require('multer');

//multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // folder for files
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const filename = `${req.body.userName || 'user'}-${Date.now()}.${ext}`;
    console.log(file)
    req.body.imageUrl = `/uploads/${filename}`;

    cb(null, filename);
  }, // unique filename
});


module.exports = multer({ storage });