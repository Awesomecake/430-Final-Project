const models = require('../models');
const Account = models.Account;

const loginPage = (req,res) => {
    return res.render('login');
};

const signupPage = (req, res) => {
    return res.render('signup');
}

const logout = (req, res) => {
    return res.redirect('/');
};

const login = (req, res) => {

};

const signup = (req, res) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    if(!username || !pass || !pass2){
        return res.status(400).json({error: 'All fields are required!'});
    }

    if(pass != pass2){
        return res.status(400).json({error: 'Passwords do not match!'});
    }
};

module.exports = {
    loginPage,
    signupPage,
    login,
    logout,
    signup
}