const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const plantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
  },
  temperature: {
    type: String,
  },
  waterNeed: {
    type: String,
  },
  sunExposure: {
    type: String,
  },
  soilMoisture: {
    type: String,
  },
  soilType: {
    type: String,
  },
  propagation: {
    type: String,
  },
  repotting: {
    type: String,
  },
  fertilizer: {
    type: String,
  },
  notes: {
    type: String,
  },
  imageFileName: {
    type: String,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
});

const Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;
