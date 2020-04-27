const Mongoose = require('mongoose');

const masterReplySchema = new Mongoose.Schema({
    _id: { type: String },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    text: { type: String, required: true },
    published: { type: Date, required: true, index: true },
    edited: { type: Date },
});

module.exports = Mongoose.model('MasterReply', masterReplySchema);
