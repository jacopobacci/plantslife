const Plant = require('./models/plant');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/');
  }
  next();
};

module.exports.isAuthorPlant = async (req, res, next) => {
  const { id } = req.params;
  const plant = await Plant.findById(id);
  if (!plant.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/login`);
  }
  next();
};
