const Router = require('koa-router');
const NodeCache = require('node-cache');
const Pino = require('pino');
const Count = require('./models/count');
const Comment = require('./models/comment');
const MasterReply = require('./models/masterReply');

const logger = Pino({}, Pino.destination('server.log'));

const router = new Router();
const cache = new NodeCache();

const getTTL = () => {
    const time = new Date();
    if (time.getHours() > 5) {
        time.setDate(time.getDate() + 1);
    }
    time.setHours(5);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    const now = new Date();
    return Math.round((time.getTime() - now.getTime()) / 1000);
};

router.prefix('/comments');

router.get('/', async (ctx) => {
    try {
        let limit = Number(ctx.query.limit) || 100;
        if (!Number.isInteger(limit) || limit < 0 || limit > 100) limit = 100;
        let offset = Number(ctx.query.offset) || 0;
        if (!Number.isInteger(offset) || offset < 0) offset = 0;
        const key = `comment|${limit}|${offset}`;
        let comment = cache.get(key);
        if (comment === undefined) {
            comment = await Comment
                .find({ _id: { $ne: process.env.MASTER_COMMENT_ID } })
                .sort({ published: -1 })
                .skip(offset)
                .limit(limit);
            cache.set(key, comment, getTTL());
        }
        ctx.body = comment;
    } catch (err) {
        ctx.status = 400;
        logger.warn(`error getting comments: ${JSON.stringify(err)}`);
    }
});

router.get('/master', async (ctx) => {
    try {
        const key = 'master';
        let master = cache.get(key);
        if (master === undefined) {
            master = await Comment
                .findOne({ _id: process.env.MASTER_COMMENT_ID });
            cache.set(key, master, getTTL());
        }
        ctx.body = master;
    } catch (err) {
        ctx.status = 400;
        logger.warn(`error getting master: ${JSON.stringify(err)}`);
    }
});

router.get('/master/replies/count', async (ctx) => {
    try {
        const key = 'masterSize';
        let count = cache.get(key);
        if (count === undefined) {
            count = await MasterReply.countDocuments();
            cache.set(key, count, getTTL());
        }
        ctx.body = { replies: count };
    } catch (err) {
        ctx.status = 400;
        logger.warn(`error getting master replies: ${JSON.stringify(err)}`);
    }
});

router.get('/master/replies/', async (ctx) => {
    try {
        let limit = Number(ctx.query.limit) || 100;
        if (!Number.isInteger(limit) || limit < 0 || limit > 100) limit = 100;
        let offset = Number(ctx.query.offset) || 0;
        if (!Number.isInteger(offset) || offset < 0) offset = 0;
        const key = `masterReply|${limit}|${offset}`;
        let masterReply = cache.get(key);
        if (masterReply === undefined) {
            masterReply = await MasterReply
                .find()
                .sort({ published: -1 })
                .skip(offset)
                .limit(limit);
            cache.set(key, masterReply, getTTL());
        }
        ctx.body = masterReply;
    } catch (err) {
        ctx.status = 400;
        logger.warn(`error getting master replies: ${JSON.stringify(err)}`);
    }
});

router.get('/count', async (ctx) => {
    try {
        const key = 'count';
        let count = cache.get(key);
        if (count === undefined) {
            count = await Count.findOne();
            cache.set(key, count, getTTL());
        }
        ctx.body = count;
    } catch (err) {
        ctx.status = 400;
        logger.warn(`error getting count: ${JSON.stringify(err)}`);
    }
});

module.exports = router;
