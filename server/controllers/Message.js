const models = require('../models');

const { Message } = models;

const messageTrackerPage = async (req, res) => res.render('app');

// attempts to create a new message in the database
const makeMessage = async (req, res) => {
  // checks if channel and message data is in the request
  if (!req.body.channel || !req.body.message) {
    return res.status(400).json({ error: 'Channel and Message are required.' });
  }

  const messageData = {
    channel: req.body.channel,
    message: req.body.message,
    owner: req.session.account._id,
  };

  // attempts to create the new message
  try {
    const newMessage = new Message(messageData);
    await newMessage.save();

    return res.status(201).json({ channel: newMessage.channel, message: newMessage.message });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Message already exists!' });
    }
    return res.status(500).json({ error: 'An error occurred creating message!' });
  }
};

// retrieves messages from the database
const getMessages = async (req, res) => {
  try {
    const query = { owner: req.session.account._id, channel: req.session.account.channel };
    const docs = await Message.find(query).select('channel message').lean().exec();

    return res.json({
      messages: docs,
      channel: req.session.account.channel,
      hasBoughtPremium: req.session.account.hasBoughtPremium,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving messages!' });
  }
};

// attempts to delete a message from the database
const deleteMessage = async (req, res) => {
  // checks if message id is in the request
  if (!req.body.id) {
    return res.status(400).json({ error: 'An ID is required to delete a message!' });
  }

  // attempts to delete the message
  try {
    await Message.deleteOne({ _id: req.body.id });
    return res.status(200).json({ message: 'Message deleted!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting message!' });
  }
};

// attempts to edit a message in the database
const editMessage = async (req, res) => {
  // checks if message id and message data are in the request
  if (!req.body.id || !req.body.message) {
    return res.status(400).json({ error: 'An ID and message are required to edit a message!' });
  }

  try {
    await Message.updateOne(
      {
        _id: req
          .body
          .id,
      },
      { message: req.body.message },
    );

    return res.status(200).json({ message: 'Message edited!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error editing message!' });
  }
};

module.exports = {
  messageTrackerPage,
  getMessages,
  makeMessage,
  deleteMessage,
  editMessage,
};
