if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const axios = require('axios');
const multer = require('multer');
const mongoose = require('mongoose');
const { storage } = require('./cloudinary');
const { cloudinary } = require('./cloudinary');
const upload = multer({ storage });
const date = new Date().getFullYear();
const Plant = require('./models/plant');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { isLoggedIn, isAuthorPlant } = require('./middleware');

const app = express();
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/plants-life';
const secret = process.env.SECRET || 'plants-life';
// process.env.DB_URL

app.use(
  session({
    store: MongoStore.create({ mongoUrl: dbUrl }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());
app.use(mongoSanitize());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.static('public'));
app.set('view engine', 'ejs');

// PASSPORT

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARE

app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// GET

app.get('/', async (req, res) => {
  try {
    const plants = await Plant.find({}).populate('author');
    res.render('home.ejs', { date, plants });
  } catch (err) {
    console.log(err);
  }
});

app.get('/api/image/:plantImage', async (req, res) => {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${process.env.PIXABAY_KEY}&q=${req.params.plantImage}&image_type=photo&per_page=10`
    );
    res.send(response.data);
  } catch (err) {
    console.log('Error!', err.message);
  }
});

app.get('/create-plant', (req, res) => {
  res.render('createplant.ejs', { date });
});

app.get('/edit-plant', (req, res) => {
  res.render('editplant.ejs', { date });
});

app.get('/edit-plant/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);
    res.render('editplant.ejs', { date, plant });
  } catch (err) {
    console.log(err);
  }
});

// POST

app.post('/', isLoggedIn, upload.single('img'), async (req, res) => {
  try {
    if (!req.file) {
      const newPlant = new Plant(req.body);
      newPlant.author = req.user._id;
      await newPlant.save();
    } else {
      req.body.img = req.file.path;
      req.body.imageFileName = req.file.filename;
      const newPlant = new Plant(req.body);
      newPlant.author = req.user._id;
      await newPlant.save();
    }
    req.flash('success', 'Succesfully created plant!');
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
});

app.get('/search', async (req, res) => {
  try {
    const { name } = req.query;
    const searchedPlant = await Plant.findOne({ name: { $regex: name, $options: 'i' } }).exec();
    if (searchedPlant) {
      res.render('search.ejs', { date, searchedPlant });
    } else {
      req.flash('error', "The plant you are searching for doesn't exist");
      res.redirect('/');
    }
  } catch (err) {
    console.log(err);
  }
});

// UPDATE

app.put('/:id', isLoggedIn, isAuthorPlant, upload.single('img'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      await Plant.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    } else {
      req.body.img = req.file.path;
      const plant = await Plant.findById(id);
      const cloudinaryImgName = plant.imageFileName;
      if (req.body.imageFileName !== cloudinaryImgName) {
        await cloudinary.uploader.destroy(cloudinaryImgName);
      }
      req.body.imageFileName = req.file.filename;
      await Plant.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    }
    req.flash('success', 'Succesfully updated plant');
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
});

app.delete('/:id', isLoggedIn, isAuthorPlant, async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
});

//// USER

// REGISTER

app.get('/register', (req, res) => {
  res.render('register.ejs', { date });
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('success', 'Successfully registered!');
        res.redirect('/');
      }
    });
  } catch (err) {
    console.log(err);
    req.flash('error', 'Username already exists!');
    res.redirect('/register');
  }
});

// LOGIN

//Login

app.get('/login', (req, res) => {
  res.render('login.ejs', { date });
});

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
  try {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  } catch (err) {
    req.flash('error', 'Login process error, try again!');
    console.log(err);
  }
});

// Logout

app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Goodbye!');
  res.redirect('/');
});

// delete user

app.post('/user/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const plants = await Plant.find({author: id});
    for (let plant of plants) {
      if (plant.img) {
        const cloudinaryImgName = plant.imageFileName;
        await cloudinary.uploader.destroy(cloudinaryImgName);
      }
    }
    await Plant.deleteMany({author: id});
    await User.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted user')
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server Up and running'));
