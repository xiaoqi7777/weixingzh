

var tpl = require('./tpl')

exports.textReply = (ctx,data)=>{
  // 回复处理-------------
  let ToUserName = data.FromUserName
  let FromUserName = data.ToUserName
  let Content = data.Content


  var info = {}
  var type = 'text'
  info.content = Content
  info.createTime = new Date().getTime()
  info.msgType = type
  info.toUserName = ToUserName
  info.fromUserName = FromUserName

  let rs = tpl.compiled(info)
  ctx.body = rs
  // ctx.body = `
  // <xml> 
  //   <ToUserName><![CDATA[${ToUserName}]]></ToUserName> 
  //   <FromUserName><![CDATA[${FromUserName}]]></FromUserName> 
  //   <CreateTime>${new Date().getTime()}</CreateTime> 
  //   <MsgType><![CDATA[text]]></MsgType> 
  //   <Content><![CDATA[${Content}]]></Content> 
  // </xml>
  // `
}

