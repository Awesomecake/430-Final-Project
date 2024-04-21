const mongoose = require('mongoose');
const _ = require('underscore');

const setMessage = (message) => _.escape(message);

const MessageSchema = new mongoose.Schema({
  channel: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    set: setMessage,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdData: {
    type: Date,
    default: Date.now,
  },
});

MessageSchema.statics.toAPI = (doc) => ({
  channel: doc.channel,
  message: doc.message,
});

const MessageModel = mongoose.model('Message', MessageSchema);
module.exports = MessageModel;