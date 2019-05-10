const  Koa = require('koa')
const Router = require('koa-router');
const path = require('path')
const bodyparser = require('koa-bodyparser')  
const static = require('koa-static')

const wxInit = require('./wxInit')
wxInit.entryFn()

const router = new Router();
const app = new Koa()

let routerWx = require('./router/wx')

// post 提交处理
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

// 静态文件处理
app.use(static(
  path.join( __dirname,  '/dist')
))

router.use('/wx',routerWx.routes())


app.use(router.routes(),router.allowedMethods())
app.listen(3000,()=>{
  console.log('跑起来了')
})

