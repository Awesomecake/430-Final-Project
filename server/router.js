const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getMessages', mid.requiresLogin, controllers.Message.getMessages);
  app.delete('/deleteMessage', mid.requiresLogin, controllers.Message.deleteMessage);
  app.post('/editMessage', mid.requiresLogin, controllers.Message.editMessage);

  app.post('/setAccountChannel', mid.requiresLogin, controllers.Account.setAccountChannel);
  app.post('/changePassword', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassword);
  app.post('/activatePremium', mid.requiresSecure, mid.requiresLogin, controllers.Account.activatePremium);
  app.get('/getChannels', mid.requiresLogin, controllers.Account.getChannels);
  app.post('/setChannelNames', mid.requiresLogin, controllers.Account.setChannelNames);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/messageTrackerPage', mid.requiresLogin, controllers.Message.messageTrackerPage);
  app.post('/makeMessage', mid.requiresLogin, controllers.Message.makeMessage);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  app.get('/*', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
