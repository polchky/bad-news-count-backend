const Router = require('koa-router');
const Count = require('./models/count');
const Comment = require('./models/comment');
const MasterReply = require('./models/masterReply');

const router = new Router();

router.prefix('/comments');

router.get('/', async (ctx) => {
    try {
        let limit = ctx.query.limit || 100;
        if (limit > 100) limit = 100;
        const offset = ctx.query.offet || 0;
        ctx.body = await Comment.find().skip(offset).limit(limit);
    } catch (err) {
        ctx.status = 400;
    }
});

router.get('/master/replies/', async (ctx) => {
    try {
        let limit = ctx.query.limit || 100;
        if (limit > 100) limit = 100;
        const offset = ctx.query.offet || 0;
        ctx.body = await MasterReply.find().skip(offset).limit(limit);
    } catch (err) {
        ctx.status = 400;
    }
});

router.get('/count', async (ctx) => {
    ctx.body = await Count.findOne();
});

module.exports = router;
