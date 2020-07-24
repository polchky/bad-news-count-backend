const Router = require('koa-router');
const Pino = require('pino');
const Count = require('./models/count');
const Comment = require('./models/comment');
const MasterReply = require('./models/masterReply');

const logger = Pino({}, Pino.destination('server.log'));

const router = new Router();

router.prefix('/comments');

router.get('/', async (ctx) => {
    try {
        let limit = Number(ctx.query.limit) || 100;
        if (!Number.isInteger(limit) || limit < 0 || limit > 100) limit = 100;
        let offset = Number(ctx.query.offset) || 0;
        if (!Number.isInteger(offset) || offset < 0) offset = 0;
        const comment = await Comment
            .find({ _id: { $ne: process.env.MASTER_COMMENT_ID } })
            .sort({ published: -1 })
            .skip(offset)
            .limit(limit);
        ctx.body = comment;
    } catch (err) {
        ctx.status = 400;
        logger.warn(`error getting comments: ${JSON.stringify(err)}`);
    }
});

router.get('/master', async (ctx) => {
    try {
        const master = await Comment
            .findOne({ _id: process.env.MASTER_COMMENT_ID });
        ctx.body = master;
    } catch (err) {
        ctx.status = 400;
        logger.warn(`error getting master: ${JSON.stringify(err)}`);
    }
});

router.get('/master/replies/count', async (ctx) => {
    try {
        const count = await MasterReply.countDocuments();
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
        const masterReply = await MasterReply
            .find()
            .sort({ published: -1 })
            .skip(offset)
            .limit(limit);
        ctx.body = masterReply;
    } catch (err) {
        ctx.status = 400;
        logger.warn(`error getting master replies: ${JSON.stringify(err)}`);
    }
});

router.get('/count', async (ctx) => {
    try {
        const count = await Count.findOne();
        ctx.body = count;
    } catch (err) {
        ctx.status = 400;
        logger.warn(`error getting count: ${JSON.stringify(err)}`);
    }
});

module.exports = router;
