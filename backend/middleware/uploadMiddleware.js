const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadSingle = upload.single('logo');
const uploadMultiple = upload.array('images', 5);

module.exports = { uploadSingle, uploadMultiple };
