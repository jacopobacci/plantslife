const express = require('express');
const router = express.Router();

const axios = require('axios');
const multer = require('multer');
const mongoose = require('mongoose');
const { storage } = require('../cloudinary');
const { cloudinary } = require('../cloudinary');
const upload = multer({ storage });
const date = new Date().getFullYear();

const Plant = require('../models/plant');
const dbUrl = process.env.DB_URL;
// 'mongodb://localhost:27017/plants-life'

mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected!');
  })
  .catch((err) => {
    console.log('Database connection error!');
    console.log(err);
  });

// GET

router.get('/', async (req, res) => {
  const plants = await Plant.find({});
  res.render('home.ejs', { date, plants });
});

router.get('/api/image/:plantImage', async (req, res) => {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${process.env.PIXABAY_KEY}&q=${req.params.plantImage}&image_type=photo&per_page=10`
    );
    res.send(response.data);
  } catch (e) {
    console.log('Error!', e.message);
  }
});

router.get('/create-plant', (req, res) => {
  res.render('createplant.ejs', { date });
});

router.get('/edit-plant', (req, res) => {
  res.render('editplant.ejs', { date });
});

router.get('/edit-plant/:id', async (req, res) => {
  const { id } = req.params;
  const plant = await Plant.findById(id);
  res.render('editplant.ejs', { date, plant });
});

// POST

router.post('/', upload.single('img'), async (req, res) => {
  if (req.file === undefined) {
    const newPlant = new Plant(req.body);
    await newPlant.save();
  } else {
    req.body.img = req.file.path;
    req.body.imageFileName = req.file.filename;
    const newPlant = new Plant(req.body);
    await newPlant.save();
  }
  req.flash('success', 'Succesfully created plant!');
  res.redirect('/');
});

router.get('/search', async (req, res) => {
  const { name } = req.query;
  const searchedPlant = await Plant.findOne({ name: { $regex: name, $options: 'i' } }).exec();
  if (searchedPlant) {
    res.render('search.ejs', { date, searchedPlant });
  } else {
    req.flash('error', "The plant you are searching for doesn't exist");
    res.redirect('/');
  }
});

// UPDATE

router.put('/:id', upload.single('img'), async (req, res) => {
  const { id } = req.params;
  if (req.file === undefined) {
    await Plant.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
  } else {
    req.body.img = req.file.path;
    req.body.imageFileName = req.file.filename;
    await Plant.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
  }
  req.flash('success', 'Succesfully updated plant');
  res.redirect('/');
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const plant = await Plant.findById(id);
    const cloudinaryImgName = plant.imageFileName;
    await cloudinary.uploader.destroy(cloudinaryImgName);
    await Plant.findByIdAndDelete(id);
  } catch {
    await Plant.findByIdAndDelete(id);
  }
  req.flash('success', 'Succesfully deleted plant');
  res.redirect('/');
});

module.exports = router;
