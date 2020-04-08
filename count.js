const Count = require('./models/count');

const count = {
    comments: 0,
    single: 0,
    multiple: 0,
};

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

    save: async () => {
        count.timestamp = new Date();
        await Count.updateOne({ _id: 1 }, count);
    },
};

module.exports = f;
