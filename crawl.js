/* eslint-disable no-await-in-loop */
require('./database');
const youtube = require('./youtubeClient')();
const Comment = require('./models/comment');
const count = require('./count');
const MasterReply = require('./models/masterReply');

const maxResults = 50;
const masterCommentId = process.env.MASTER_COMMENT_ID;

function occurrences(string, single) {
    /* eslint-disable no-param-reassign */
    string += '';
    string = string.toLowerCase();
    const subString = 'zizi';
    if (subString.length <= 0) return (string.length + 1);

    let n = 0;
    let pos = 0;
    const step = subString.length;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            if (single) return 1;
            n += 1;
            pos += step;
        } else break;
    }
    return n;
}

const helper = {

    insertReplies: async (commentId, replies) => {
        try {
            const subdocuments = replies.map((reply) => {
                const { snippet } = reply;
                const set = {
                    _id: reply.id,
                    author: snippet.authorDisplayName,
                    imageUrl: snippet.authorProfileImageUrl,
                    text: snippet.textDisplay,
                    published: snippet.publishedAt,
                    edited: snippet.updatedAt,
                };
                count.addMultiple(occurrences(set.text, false));
                count.addSingle(occurrences(set.text, true));
                return set;
            });
            if (commentId === masterCommentId) {
                await MasterReply.insertMany(subdocuments);
            } else {
                await Comment.updateOne(
                    { _id: commentId },
                    { $push: { replies: { $each: subdocuments } } },
                );
            }
        } catch (err) {
            console.log(err);
        }
    },

    insertComment: async (comment) => {
        try {
            const { snippet } = comment;
            const set = {
                author: snippet.authorDisplayName,
                imageUrl: snippet.authorProfileImageUrl,
                text: snippet.textDisplay,
                published: snippet.publishedAt,
                edited: snippet.updatedAt,
                replies: [],
            };
            count.addMultiple(occurrences(set.text, false));
            count.addSingle(occurrences(set.text, true));
            await Comment.updateOne(
                { _id: comment.id },
                { $set: set },
                { upsert: true },
            );
        } catch (err) {
            console.log(err);
            console.log(comment);
        }
    },

    getReplies: async (commentId) => {
        const promises = [];
        let pageToken = '';
        try {
            while (pageToken !== undefined) {
                const res = await youtube.comments.list({
                    prettyPrint: false,
                    part: 'snippet',
                    fields: 'nextPageToken,items(id,snippet(authorDisplayName,authorProfileImageUrl,publishedAt,updatedAt,textDisplay))',
                    maxResults,
                    pageToken,
                    parentId: commentId,
                });
                pageToken = res.data.nextPageToken;
                const { items } = res.data;
                count.addcomments(items.length);
                promises.push(helper.insertReplies(commentId, items));
            }
            await Promise.all(promises);
        } catch (err) {
            console.log(err);
        }
    },

    getComments: async () => {
        const promises = [];
        let pageToken = '';
        try {
            while (pageToken !== undefined) {
                const res = await youtube.commentThreads.list({
                    prettyPrint: false,
                    part: 'snippet',
                    fields: 'nextPageToken,items/snippet(totalReplyCount,topLevelComment(id,snippet(authorDisplayName,authorProfileImageUrl,publishedAt,updatedAt,textDisplay)))',
                    maxResults,
                    pageToken,
                    videoId: process.env.VIDEO_ID,
                });
                pageToken = res.data.nextPageToken;
                const { items } = res.data;
                count.addcomments(items.length);

                for (let i = 0; i < items.length; i += 1) {
                    const { snippet } = items[i];
                    const comment = snippet.topLevelComment;
                    promises.push(helper.insertComment(comment).then(() => {
                        if (snippet.totalReplyCount > 0) {
                            return helper.getReplies(comment.id);
                        }
                        return null;
                    }));
                }
                break;
            }
            await Promise.all(promises);
        } catch (err) {
            console.log(err);
        }
    },
};

const crawl = async () => {
    try {
        await Comment.deleteMany();
        await MasterReply.deleteMany();
        await helper.getComments();
        await count.save();
    } catch (err) {
        console.log(err);
    }
};
crawl().then(() => { process.exit(); });
