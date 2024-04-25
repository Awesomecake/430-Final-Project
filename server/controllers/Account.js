const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password.' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use.' });
    }
    return res.status(400).json({ error: 'An error occurred.' });
  }
};

const changePassword = async (req, res) => {
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const account = await Account.find({ _id: req.session.account._id });
    account[0].password = await Account.generateHash(pass);
    await account[0].save();
    return res.json({ message: 'Password changed!' });
  }
  catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred.' });
  }
};

const setAccountChannel = async (req, res) => {
  if (!req.body.channel) {
    return res.status(400).json({ error: 'Channel required' });
  }

  try {
    const query = { _id: req.session.account._id};
    const account = await Account.find(query)

    account[0].channel = req.body.channel;
    await account[0].save();
    req.session.account = Account.toAPI(account[0]);

    return res.status(202).json({ channel: req.body.channel });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred.' });
  }
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  setAccountChannel,
  changePassword,
};
