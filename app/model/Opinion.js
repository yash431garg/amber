const mongoose = require('mongoose');

const opinionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  accountAddress: { type: Number, required: true },
});

const Opinion = mongoose.model('Opinion', opinionSchema);

module.exports = Opinion;
