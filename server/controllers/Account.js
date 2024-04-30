const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

// logs out the user
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// attempts to log in the user
const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  // checks if username and password are in the request
  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  // attempts to authenticate the user
  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password.' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/messageTrackerPage' });
  });
};

// attempts to create a new account
const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // checks if all fields are in the request
  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  // checks if passwords match
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  // attempts to create the new account
  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash, hasBoughtPremium: false });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/messageTrackerPage' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use.' });
    }
    return res.status(400).json({ error: 'An error occurred.' });
  }
};

// attempts to change the user's password
const changePassword = async (req, res) => {
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // checks if all fields are in the request
  if (!pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  // checks if passwords match
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  // attempts to change the password
  try {
    const account = await Account.find({ _id: req.session.account._id });
    account[0].password = await Account.generateHash(pass);
    await account[0].save();
    return res.json({ message: 'Password changed!' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred.' });
  }
};

// sets the user's channel
const setAccountChannel = async (req, res) => {
  // checks if channel id is in the request
  if (!req.body.channel) {
    return res.status(400).json({ error: 'Channel required' });
  }

  // attempts to set the user's channel
  try {
    const query = { _id: req.session.account._id };
    const account = await Account.find(query);

    account[0].channel = req.body.channel;
    await account[0].save();
    req.session.account = Account.toAPI(account[0]);

    return res.status(202).json({ channel: req.body.channel });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred.' });
  }
};

// activates premium for the user
const activatePremium = async (req, res) => {
  try {
    const account = await Account.find({ _id: req.session.account._id });
    account[0].hasBoughtPremium = true;
    await account[0].save();
    req.session.account = Account.toAPI(account[0]);
    return res.json({ message: 'Premium activated!' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred.' });
  }
};

const getChannels = async (req, res) => {
  try {
    const account = await Account.find({ _id: req.session.account._id });
    return res.json({ channels: account[0].channelNames });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred.' });
  }
};

const setChannelNames = async (req, res) => {
  try {
    const account = await Account.find({ _id: req.session.account._id });
    account[0].channelNames = req.body.channelNames;
    await account[0].save();
    req.session.account = Account.toAPI(account[0]);
    return res.json({ message: 'Channel names updated!' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred.' });
  }
}

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  setAccountChannel,
  changePassword,
  activatePremium,
  getChannels,
  setChannelNames
};
