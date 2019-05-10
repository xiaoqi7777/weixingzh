const Router = require('koa-router')
const moment = require('moment');
const axios = require('axios')
//产生随机数
const randomstring = require('randomstring');
// xml和js互相转化
const xmljs = require('xml-js');
//回复
const wechat = require('../wechat/text')
const wx = require('../wxInit')

const qrcode = require('qrcode');
const util = require('./util')
const config = require('../config')
const router = new Router();
const root_logger = require('../logger')
const logger = root_logger.child({ tag: 'router' });

let nonce_str = randomstring.generate(32) // 随机字符串
let timeStamp = moment().unix().toString() //时间戳
let out_trade_no = moment().local().format('YYYYMMDDhhmmss') //商户订单号

let appSecret = config.wechat.appSecret;
let appid = config.wechat.appID;
let notify_url = config.wxpay.notify_url;
let key = config.wxpay.key;
let mch_id = config.wxpay.mch_id;
let unifiedorder = config.wxpay.unifiedorder;
let sign = '' //签名
let body = '商品名称'
let total_fee = '1'
let detail = '商品详情'
let trade_type = 'NATIVE'
let product_id = nonce_str


let order = {
  appid,
  mch_id,
  out_trade_no,
  body,
  total_fee,
  product_id,
  notify_url,
  nonce_str,
  trade_type,
}


// 微信发过来首次认证是get  以后接受消息都是post 同样的接口
router.get('/firstAuthentication',async (ctx,next)=>{
  // 
  let getData = ctx.query
  getData = util.signatureAuthentication(getData)
  if (getData.sha === getData.signature) {
    logger.info('first authentication pass =>get')
    // 是微信发过来的 将echostr返回过去就可以了
    ctx.body = getData.echostr
  } else {
    // 非微信
    ctx.body = 'wrong'
  }
  await next()
})

// 根据 code 换登录的openid
router.get('/getOpenId',async(x,next) => {
  let code = x.query.code
  let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
  let getData = await axios.get(url)
  logger.info(`get openId ${getData.data.openid}`)
  order.openid = getData.data.openid
  x.body = getData.data.openid
})

router.get('/sdk', async (ctx, next) => {
  let length = ctx.url.indexOf('?url=')
  let url = ctx.url.slice(length+'?url='.length)
  let jsapiTicket = await wx.sdkToken()
  logger.info(`sdk sign parameter,nonce_str=>${nonce_str},timeStamp=>${timeStamp},sdkToken=>${jsapiTicket},url=>${url}`)
  let rs = util.sdkSignHandle(nonce_str,timeStamp,jsapiTicket, url)
  ctx.body =  rs
})

router.post('/firstAuthentication',async (ctx,next)=>{
  let getData = ctx.query
  getData = util.signatureAuthentication(getData)
  if (getData.sha === getData.signature) {
    let xmlData = await util.parseXML(ctx)
    // textKey 和 cdataKey 配置 是为了获取的结果里面的key是转换成value 
    let options = {
      compact: true,
      textKey: 'value',
      cdataKey: 'value',
    };
    //xml转js
    let jsData = xmljs.xml2js(xmlData, options)
    //转正常用的对象
    jsData = util.transformXmlFn(jsData)
    logger.info(`接受的信息 ${jsData}`)
    //回复处理
    wechat.textReply(ctx,jsData)
  }else{
    ctx.body = 'wrong'
  }
})

//h5支付
router.post('/commonPay',async(ctx, next) => {
  let paySubmitInfo = ctx.request.body
  total_fee = order.total_fee = paySubmitInfo.money
  trade_type = order.trade_type = 'JSAPI'
  product_id = order.product_id = randomstring.generate(32)
  out_trade_no = order.out_trade_no = moment().local().format('YYYYMMDDhhmmss') 
  body = order.body = '暂时=>'+randomstring.generate(5)

  logger.info(`commonPay parameter`,order)

  sign =  util.wxSign(order, key)

  let xmlOrder = xmljs.js2xml({
    xml: { 
      ...order,
      sign
      }
    },{
      compact: true
    })
  // 下单
  let unifiedorderResponse  = await axios.post(unifiedorder, xmlOrder);

  let _prepay = xmljs.xml2js(unifiedorderResponse.data, {
        compact: true,
        cdataKey: 'value',
        textKey:'value'
      }) 

  //将获取的xml转换成js
  let prepay  = util.transformXmlFn(_prepay)
  logger.info(`支付返回的信息 ${prepay}`)

  let prepay_id = prepay.prepay_id

  let params;
  params = {
    appId:appid,
    timeStamp:timeStamp,
    nonceStr:nonce_str,
    package:`prepay_id=${prepay_id}`,
    signType : 'MD5'
  }
  //签名
  sign = util.wxSign(params,key)

  let obj = {
    appId:appid,
    timeStamp: timeStamp, //时间戳，自1970年以来的秒数
    nonceStr: nonce_str, //随机串
    package: prepay_id,
    signType: "MD5", //微信签名方式：
    paySign: sign //微信签名
  }

  ctx.body = obj
})

// 扫描支付
router.post('/scanPay', async (ctx, next) => {
  let paySubmitInfo = ctx.request.body
  total_fee = order.total_fee = paySubmitInfo.money
  trade_type = order.trade_type = 'NATIVE'
  product_id = order.product_id = randomstring.generate(32)
  out_trade_no = order.out_trade_no = moment().local().format('YYYYMMDDhhmmss') 
  body = order.body = '暂时=>'+randomstring.generate(5)

  logger.info(`commonPay parameter ${order}`)
  console.log('1支付商品的信息',order)
  //获取签名
  sign =  util.wxSign(order, key)
  //转换成 xml 格式
  let xmlOrder = xmljs.js2xml({
    xml: { 
      ...order,
      sign
      }
    },{
      compact: true
    })
  //请求统一下单接口 (2个参数 发送地址 xml格式的订单)
  let unifiedorderResponse  = await axios.post(unifiedorder, xmlOrder);
  
  //响应的 数据是一个xml格式的
  let _prepay = xmljs.xml2js(unifiedorderResponse.data, {
                  compact: true,
                  cdataKey: 'value',
                  textKey:'value'
                }) 
  //console.log('将获取的xml数据转换成js对象',_prepay)
  
  //将获取的xml转换成对象
  let prepay  = util.transformXmlFn(_prepay)
  logger.info('2调取支付微信返回的结果',prepay)
  console.log('2调取支付微信返回的结果',prepay)
  let code_url = prepay.code_url
  const qrcodeUrl = await qrcode.toDataURL(code_url, {
      width: 300
    });
  ctx.body = qrcodeUrl
})

router.post('/getNotifyUrl',async(ctx,next)=>{
  let xmlData = await util.parseXML(ctx)
  let options = {
    compact: true,
    textKey: 'value',
    cdataKey: 'value',
  };
  let jsData = xmljs.xml2js(xmlData,options)
  let payment = util.transformXmlFn(jsData)
  console.log('支付成功返回的数据',payment)
  const paymentSign = payment.sign
  delete payment.sign
  let key  = 'gmklNxpgLPCQrOxji2HzIThpAfiyIVx7'
  let newSign = util.wxSign(payment,key)

  const return_code = newSign===paymentSign?'SUCCESS':'FAIL' 
  const return_msg = newSign===paymentSign?'OK':'NO' 

  const reply = {
   xml:{
    return_code,
    return_msg
   }
  }
  const rs = xmljs.js2xml(reply, {
    compact: true
  });
  console.log('支付成功返回的微信的数据',rs)
  ctx.body = rs

})

module.exports = router
