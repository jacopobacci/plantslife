if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const plants = require('./routes/plants');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/plants-life';
const secret = process.env.SECRET || 'plants-life';
app.use(
  session({
    store: MongoStore.create({ mongoUrl: dbUrl }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

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

// MIDDLEWARE

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', plants);

app.listen(process.env.PORT || 3000, () => console.log('Server Up and running'));
