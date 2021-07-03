if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const app = express();
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const plants = require('./routes/plants');

app.use(
  session({
    secret: 'plants-life',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());
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
