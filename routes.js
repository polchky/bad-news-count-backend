const Router = require('koa-router');
const NodeCache = require('node-cache');
const Count = require('./models/count');
const Comment = require('./models/comment');
const MasterReply = require('./models/masterReply');

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
        let limit = ctx.query.limit || 100;
        if (!Number.isInteger(limit) || limit < 0 || limit > 100) limit = 100;
        let offset = ctx.query.offet || 0;
        if (!Number.isInteger(offset) || offset < 0) offset = 0;
        const key = `comment|${limit}|${offset}`;
        let comment = cache.get(key);
        if (comment === undefined) {
            comment = await Comment.find().skip(offset).limit(limit);
            cache.set(key, comment, getTTL());
        }
        ctx.body = comment;
    } catch (err) {
        ctx.status = 400;
    }
});

router.get('/master/replies/', async (ctx) => {
    try {
        let limit = ctx.query.limit || 100;
        if (!Number.isInteger(limit) || limit < 0 || limit > 100) limit = 100;
        let offset = ctx.query.offet || 0;
        if (!Number.isInteger(offset) || offset < 0) offset = 0;
        const key = `masterReply|${limit}|${offset}`;
        let masterReply = cache.get(key);
        if (masterReply === undefined) {
            masterReply = await MasterReply.find().skip(offset).limit(limit);
            cache.set(key, masterReply, getTTL());
        }
        ctx.body = masterReply;
    } catch (err) {
        ctx.status = 400;
    }
});

router.get('/count', async (ctx) => {
    try {
        const key = 'count';
        let count = cache.get(key);
        if (count === undefined) {
            count = await Count.findOne();
            cache.set(key, count, getTTL());
            console.log(getTTL());
        }
        ctx.body = count;
    } catch (err) {
        ctx.status = 400;
    }
});

module.exports = router;
