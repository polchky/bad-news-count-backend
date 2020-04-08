const Koa = require('koa');
const Cors = require('koa2-cors');
require('./database');
const router = require('./routes');

const app = new Koa();
const port = process.env.PORT;

const cors = Cors({
    origin: '',
    allowMethods: ['GET'],
});

app
    .use(cors)
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port);
