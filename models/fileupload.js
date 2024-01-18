// fileupload.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({

  filename: {
    type: String,
    required: true,
  },
  originalname: {
    type: String,
    required: true,
  },
  uniqueCode: {
    type: String,
    required: true,
  },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
