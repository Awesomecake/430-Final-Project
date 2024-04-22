const models = require('../models');

const { Message } = models;

const makerPage = async (req, res) => res.render('app');

const makeMessage = async (req, res) => {
  if (!req.body.channel || !req.body.message) {
    return res.status(400).json({ error: 'Channel and Message are required.' });
  }

  const messageData = {
    channel: req.body.channel,
    message: req.body.message,
    owner: req.session.account._id,
  };

  try {
    const newMessage = new Message(messageData);
    await newMessage.save();

    return res.status(201).json({ channel: newMessage.channel, message: newMessage.message});
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Message already exists!' });
    }
    return res.status(500).json({ error: 'An error occurred creating message!' });
  }
};

const getMessages = async (req, res) => {
  try {
    const query = { owner: req.session.account._id, channel: req.session.account.channel};
    const docs = await Message.find(query).select('channel message').lean().exec();

    return res.json({ messages: docs, channel: req.session.account.channel });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving messages!' });
  }
};

const deleteMessage = async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ error: 'An ID is required to delete a message!' });
  }

  try {
    await Message.deleteOne({ _id: req.body.id });
    return res.status(200).json({ message: 'Message deleted!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting message!' });
  }
};

module.exports = {
  makerPage,
  getMessages,
  makeMessage,
  deleteMessage,
};
