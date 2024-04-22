const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getMessages', mid.requiresLogin, controllers.Message.getMessages);
  app.delete('/deleteMessage', mid.requiresLogin, controllers.Message.deleteMessage);
  app.post('/setAccountChannel', mid.requiresLogin, controllers.Account.setAccountChannel);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/maker', mid.requiresLogin, controllers.Message.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Message.makeMessage);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
