const Mongoose = require('mongoose');

const replySchema = new Mongoose.Schema({
    _id: { type: String },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    text: { type: String, required: true },
    published: { type: Date, required: true },
    edited: { type: Date },
});

const commentSchema = new Mongoose.Schema({
    _id: { type: String },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    text: { type: String, required: true },
    replies: { type: [replySchema], required: true },
    published: { type: Date, required: true, index: true },
    edited: { type: Date },
}, { minimize: false });

module.exports = Mongoose.model('Comment', commentSchema);
