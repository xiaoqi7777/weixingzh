webpackJsonp([1],{BjO0:function(t,e){},NHnr:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n("xd7I"),i={name:"App",data:function(){return{openId:null}},methods:{getSDK:function(){var t=location.href;console.log("fasong*------",t),this.axio.get("wx/sdk?url="+t).then(function(t){var e=t.data;console.log("signature",e),wx.config({debug:!1,appId:"wx3df629936bf31f75",timestamp:e.timestamp,nonceStr:e.noncestr,signature:e.signature,jsApiList:["startRecord","stopRecord","onVoiceRecordEnd","translateVoice","playVoice","pauseVoice","stopVoice","uploadVoice","chooseImage","previewImage","downloadVoice","chooseWXPay"]}),wx.ready(function(){wx.checkJsApi({jsApiList:["startRecord","stopRecord","playVoice","chooseWXPay"],success:function(t){console.log("成功获取res",t)}})}),wx.error(function(t){console.log("失败",t)})})},oAuth:function(){location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3df629936bf31f75&redirect_uri=http://tsml520.cn&response_type=code&scope=snsapi_userinfo&state=STATEsg#wechat_redirect"},isSubscribe:function(){var t=location.href;if(console.log(!t.includes("code=")),t.includes("code=")){var e=t.indexOf("code=")+5,n=t.indexOf("&state");this.code=t.slice(e,n),console.log("this.code",this.code),this.getSDK()}else this.oAuth()}},mounted:function(){this.isSubscribe()}},a={render:function(){var t=this.$createElement,e=this._self._c||t;return e("div",{attrs:{id:"app"}},[e("router-view",{attrs:{openId:this.openId}})],1)},staticRenderFns:[]};var s=n("C7Lr")(i,a,!1,function(t){n("vxVr")},null,null).exports,c=n("3XdE"),r=n("lC5x"),p=n.n(r),l=n("J0Oq"),d=n.n(l),u={props:["openId"],data:function(){return{localId:null,base64:null,input:0,obj:null}},methods:{scanPay:function(){var t=this;0===this.input&&alert("请输入金额"),this.axio.post("/user/wx",{data:this.input}).then(function(e){t.base64=e.data,console.log("++++++++",e)})},startyin:function(){wx.startRecord()},stopyin:function(){var t=this;wx.stopRecord({success:function(e){t.localId=e.localId,alert(t.localId)}})},playyin:function(){wx.playVoice({localId:this.localId})},onBridgeReady:function(t){console.log("请求的数据",t),WeixinJSBridge.invoke("getBrandWCPayRequest",{appId:t.appId,timeStamp:t.timeStamp,nonceStr:t.nonceStr,package:"prepay_id="+t.package,signType:"MD5",paySign:t.paySign},function(t){t.err_msg})},commonPay:function(){var t=this;return d()(p.a.mark(function e(){var n;return p.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.axio.post("/user/commonPay",{money:t.input});case 2:n=e.sent,t.obj=n.data,t.onBridgeReady(t.obj);case 5:case"end":return e.stop()}},e,t)}))()}}},v={render:function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("div",{staticClass:"div",on:{click:t.startyin}},[t._v("开启录音")]),t._v(" "),n("br"),t._v(" "),n("div",{staticClass:"div",on:{click:t.stopyin}},[t._v("停止录音")]),t._v(" "),n("br"),t._v(" "),n("div",{staticClass:"div",on:{click:t.playyin}},[t._v("播放")]),t._v(" "),n("br"),t._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:t.input,expression:"input"}],attrs:{type:"text"},domProps:{value:t.input},on:{input:function(e){e.target.composing||(t.input=e.target.value)}}}),t._v(" "),n("div",{staticClass:"div",on:{click:t.scanPay}},[t._v("扫码支付")]),t._v(" "),n("div",{staticClass:"div",on:{click:t.commonPay}},[t._v("普通支付")]),t._v(" "),n("img",{attrs:{src:t.base64,alt:"",srcset:""}})])},staticRenderFns:[]};var f=n("C7Lr")(u,v,!1,function(t){n("BjO0")},"data-v-4717a5e4",null).exports;o.a.use(c.a);var h=new c.a({routes:[{path:"/",name:"HelloWorld",component:f}]}),m=n("aozt"),g=n.n(m);o.a.config.productionTip=!1;o.a.prototype.axio=g.a.create({baseURL:"http://tsml520.cn"}),new o.a({el:"#app",router:h,components:{App:s},template:"<App/>"})},vxVr:function(t,e){}},["NHnr"]);
//# sourceMappingURL=app.e069c49280c5d074d9b0.js.map