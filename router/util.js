const querystring = require('querystring');
const crypto = require('crypto');
//加密
const sha1 = require('sha1')
const config = require('../config')
const getRweBody = require('raw-body')

let token = config.wechat.token

function signatureAuthentication(getData) {
  let {
    signature,
    timestamp,
    echostr,
    nonce
  } = getData

  let str = [token, timestamp, nonce].sort().join('')
  let sha = sha1(str)
  return {
    sha,
    signature,
    echostr
  }
}

function sdkSignHandle(noncestr,timestamp,ticket, url) {
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

function transformXmlFn(data) {
  let xml = data.xml
  let obj = {}
  for (let x in xml) {
    obj[x] = xml[x].value
  }
  return obj
}
async function parseXML(ctx) {
  // // 获取微信发过来的消息
  let xml = await getRweBody(ctx.req, {
    length: ctx.request.length,
    limit: '1mb',
    encoding: ctx.request.charset || 'utf-8'
  })
  return xml
  // return new Promise(function (resolve, reject) {
  //   let buffers = [];
  //   ctx.req.on('data', function (data) {
  //     buffers.push(data);
  //   });
  //   ctx.req.on('end', function () {
  //     // let ret = Buffer.concat(buffers);
  //     let ret = buffers
  //     resolve(ret.toString());
  //   });
  // });
}
// 签名算法
function wxSign(order, key) {
  //对参数进行排序  
  let sortedOrder = Object.keys(order).sort().reduce((total, valu) => {
    total[valu] = order[valu]
    return total
  }, {})
  // console.log('排序',sortedOrder)

  //若是不加后面的参数 会导致结果被转换成百分比的形式
  // querystring将字符串(url 后面的hash)转成对象
  let stringifiedOrder = querystring.stringify(sortedOrder, null, null, {
    encodeURIComponent: querystring.unescape
  })

  let stringifiedOrderWithKey = `${stringifiedOrder}&key=${key}`
  //计算签名
  let sign = crypto.createHash('md5').update(stringifiedOrderWithKey.trim()).digest('hex').toUpperCase();
  return sign
}
module.exports = {
  signatureAuthentication,
  sdkSignHandle,
  transformXmlFn,
  parseXML,
  wxSign
}