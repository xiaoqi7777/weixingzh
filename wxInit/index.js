
const axios = require('axios')
const fs = require('fs')
const path = require('path')
let util = require('./util')
let pathAdress = path.join(__dirname,'../txt.js')


let data ={
  "button":[
  {    
       "type":"click",
       "name":"今日歌曲",
       "key":"V1001_TODAY_MUSIC"
   },
   {
      "type":"view",
      "name":"我的网站",
      "url":"http://tsml520.cn"
   },
   {
        "name":"菜单",
        "sub_button":[
         {
              "type":"pic_photo_or_album",
              "name":"11",
                "key":"V1001_GOOD"
          },
          {
              "type":"scancode_waitmsg",
              "name":"扫码",
                "key":"V1002_GOOD"
          },
         {
            "type":"location_select",
            "name":"发送位子",
            "key":"V1003_GOOD"
         },
         {
          "type":"pic_sysphoto",
          "name":"拍照",
          "key":"V1004_GOOD"
          },
         {
          "type":"pic_weixin",
          "name":"弹出相框",
          "key":"V1005_GOOD"
          },
      ]
    }]
}

// 获取票据
async function  getToken(){
  let appID ='wx3df629936bf31f75'
  let appSecret ='036989030fec913af6365b7695ffa918';
  let api = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appSecret}`
  let data = await axios.get(api)
  data = data.data
  let time2h = new Date().getTime()/1000
  let expires = data.expires_in

  time2h = (time2h+expires-200) 
  let accessToken = data.access_token
  let accessData = [time2h,accessToken].join('=')

  await util.writeFile(pathAdress,accessData)

  return accessToken
}

// 检查token是否有效
async function validToken(){
  let accessData =await util.readFile(pathAdress)
  accessData = accessData.split('=')
  let time2h = accessData[0]
  let accessToken = accessData[1]
  
  let currentTime2h = new Date().getTime()/1000

  if(time2h>currentTime2h){
      return accessToken
  }else{
      return await getToken()
  }
}


// 定义菜单
async function createMenu(){
  let accessToken =await validToken()
  console.log('get accessToken',accessToken)

  let api = ` https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`
  let rs = await axios.post(api,data)
  rs = rs.data
  console.log('createMenu',rs)
}
//获取sdk
async function sdkToken(){
  let ACCESS_TOKEN = await validToken()
  let api = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${ACCESS_TOKEN}&type=jsapi`
  let rs = await axios.get(api)
  return rs.data.ticket
}

async function entryFn(){
  await getToken()
  await createMenu()
}

module.exports = {
  entryFn,
  validToken,
  sdkToken
}