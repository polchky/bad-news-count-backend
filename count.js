const Count = require('./models/count');

const count = new Count({
    _id: 1,
    comments: 0,
    replies: 0,
    single: 0,
    multiple: 0,
});

const f = {
    addSingle: (n) => {
        count.single += n;
    },

    addMultiple: (n) => {
        count.multiple += n;
    },

    addcomments: (n) => {
        count.comments += n;
    },

    addReplies: (n) => {
        count.replies += n;
    },

    save: async () => {
        count.timestamp = new Date();
        await count.save();
    },

    reset: async () => Count.deleteOne(),
};

module.exports = f;
