const Router = require('koa-router')
const router = new Router();
const moment = require('moment');
const axios = require('axios')
//产生随机数
const randomstring = require('randomstring');
const sha1 = require('sha1')
const xmljs = require('xml-js');

const wx = require('../wxInit')
const querystring = require('querystring');
const crypto = require('crypto');
const qrcode = require('qrcode');

let appId = "wx3df629936bf31f75"
let nonce_str = randomstring.generate(32) // 随机字符串
let time_stamp = moment().unix().toString() //时间戳



router.get('/sdk', async (ctx, next) => {
    let length = ctx.url.indexOf('?url=')
    let url = ctx.url.slice(length+'?url='.length)
    console.log('url=>',url)
    // let url = 'http://tsml520.cn/'
    let sdkToken = await wx.sdkToken()
    console.log('http://tsml520.cn/===>sdk',nonce_str,time_stamp,sdkToken,url)
    let rs = signFn(nonce_str,time_stamp,sdkToken, url)
    ctx.body =  rs
})

let appSecret = '036989030fec913af6365b7695ffa918'
// 通过code 获取openId
router.get('/getOpenId',async(x,next) => {
  let code = x.query.code
  let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
  let getData = await axios.get(url)
  console.log('code',code,'openid',getData.data.openid)
  order.openid = getData.data.openid
  x.body = getData.data.openid
})

function signFn(noncestr,timestamp,ticket, url) {

    var data = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ]
    var str = data.sort().join('&')
    var signature = sha1(str)
    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    }
}


let appid = 'wx3df629936bf31f75';
let notify_url = 'http://tsml520.cn/wx/getNotifyUrl';
let key = 'gmklNxpgLPCQrOxji2HzIThpAfiyIVx7'
let mch_id = '1511047841';
let unifiedorder = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
let sign = '' //签名
let body = '商品名称'
let total_fee = '1'
let detail = '商品详情'
let trade_type = 'NATIVE'
let product_id = nonce_str
let out_trade_no = moment().local().format('YYYYMMDDhhmmss') //商户订单号
let timeStamp = moment().unix().toString() //时间戳

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

sign =  wxSign(order, key)

// 签名算法
function wxSign(order, key) {
  //对参数进行排序  
  let sortedOrder = Object.keys(order).sort().reduce((total, valu) => {
    total[valu] = order[valu]
    return total
  }, {})
  // console.log('排序',sortedOrder)

  //若是不加后面的参数 会导致结果被转换成百分比的形式
  let stringifiedOrder = querystring.stringify(sortedOrder, null, null, {
    encodeURIComponent: querystring.unescape
  })

  let stringifiedOrderWithKey = `${stringifiedOrder}&key=${key}`
  console.log('带key的字符串',stringifiedOrderWithKey)
  //计算签名
  let sign = crypto.createHash('md5').update(stringifiedOrderWithKey.trim()).digest('hex').toUpperCase();
  return sign
}

//根据code换票据
router.get('/getOpenId',async(x,next) => {
  let code = x.query.code
  let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${config.wechat.appSecret}&code=${code}&grant_type=authorization_code`
  let getData = await axios.get(url)
  order.openid = getData.data.openid
  x.body = getData.data.openid
})

//h5支付
router.post('/commonPay',async(x, next) => {
  let data = x.request.body
  total_fee = order.total_fee = data.money
  trade_type = order.trade_type = 'JSAPI'
  product_id = order.product_id = randomstring.generate(32)
  out_trade_no = order.out_trade_no = moment().local().format('YYYYMMDDhhmmss') 
  body = order.body = '暂时=>'+randomstring.generate(5)
  sign =  wxSign(order, key)

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
  console.log('将获取的xml数据转换成js对象',_prepay)

  //将获取的xml转换成js
  let prepay  = Object.entries(_prepay.xml).reduce((total,[key,value])=>{
      total[key] = value.value
      return total
    },{})

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
  sign = wxSign(params,key)

  let obj = {
    appId:appid,
    timeStamp: timeStamp, //时间戳，自1970年以来的秒数
    nonceStr: nonce_str, //随机串
    package: prepay_id,
    signType: "MD5", //微信签名方式：
    paySign: sign //微信签名
  }
  x.body = obj
})


//解析 支付成功 获取返回的值 是一个XML
function parseXML(req) {
  return new Promise(function(resolve,reject){
      let buffers = [];
      req.on('data', function(data) {
          buffers.push(data);
      });
      req.on('end', function() {
          let ret = Buffer.concat(buffers);
          resolve(ret.toString());
      });
  });
}

router.post('/getNotifyUrl',async(x,next)=>{
  let body = await parseXML(x.req)
  let data = await getRweBody(x.req,{
    length : x.req.length,
    limit : '1mb',
    encoding : x.req.charset
  })
  console.log('返回的数据没有转换----',x)

  let jsdata = xmljs.xml2js(body,{
        compact: true,
        cdataKey: 'value',
        textKey:'value'
  })
  let payment = Object.entries(jsdata.xml).reduce((total,[key,value])=>{
    total[key] = value['value']
    return total
  },{})
  console.log('支付成功返回的数据',payment)
  // const return_code = payment.return_code
  const paymentSign = payment.sign
  delete payment.sign
  let key  = config.wxpay.key
  let newSign = wxSign(payment,key)
  console.log('新的签名',newSign)
  console.log('支付传过来的的签名',paymentSign)

  const return_code = newSign===paymentSign?'SUCCESS':'FAIL' 
  const return_msg = newSign===paymentSign?'OK':'NO' 

  const reply = {
   xml:{
    return_code,
    return_msg
   }
  }
  const ret = xmljs.js2xml(reply, {
    compact: true
  });
  console.log('返回的微信的数据',ret)
  x.body = ret

})


router.post('/scanPay', async (x, next) => {
  let data = x.request.body
  total_fee = order.total_fee = data.data
  trade_type = order.trade_type = 'NATIVE'
  product_id = order.product_id = randomstring.generate(32)
  out_trade_no = order.out_trade_no = moment().local().format('YYYYMMDDhhmmss') 
  body = order.body = '暂时=>'+randomstring.generate(5)
  //获取签名
  sign =  wxSign(order, key)
  //转换成 xml 格式
  let xmlOrder = xmljs.js2xml({
    xml: { 
      ...order,
      sign
      }
    },{
      compact: true
    })
  console.log('xml',xmlOrder)

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
  let prepay  = Object.entries(_prepay.xml).reduce((total,[key,value])=>{
      total[key] = value.value
      return total
    },{})
  
  //console.log('调取支付微信返回的结果',prepay)
  
  let code_url = prepay.code_url
  const qrcodeUrl = await qrcode.toDataURL(code_url, {
      width: 300
    });

  x.body = qrcodeUrl
})

module.exports = router