webpackJsonp([1],{NHnr:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=n("7+uW"),i={name:"App",methods:{getSDK:function(){this.axio.get("/sdk").then(function(e){var t=e.data;console.log("signature",t),wx.config({debug:!1,appId:"wx3df629936bf31f75",timestamp:t.timestamp,nonceStr:t.noncestr,signature:t.signature,jsApiList:["startRecord","stopRecord","onVoiceRecordEnd","translateVoice","playVoice","pauseVoice","stopVoice","uploadVoice","chooseImage","previewImage","downloadVoice"]}),wx.ready(function(){wx.checkJsApi({jsApiList:["startRecord","stopRecord","playVoice"],success:function(e){console.log("成功获取res",e)}})}),wx.error(function(e){console.log("失败",e)})})},getdata:function(){this.axio("sdk").then(function(e){console.log("------",e)})}},mounted:function(){this.getSDK()}},c={render:function(){var e=this.$createElement,t=this._self._c||e;return t("div",{attrs:{id:"app"}},[t("router-view")],1)},staticRenderFns:[]};var a=n("VU/8")(i,c,!1,function(e){n("vwm7")},null,null).exports,s=n("/ocq"),r={data:function(){return{localId:null}},mounted:function(){this.axio.get("/user/wx").then(function(e){console.log("++++++++",e)})},methods:{startyin:function(){wx.startRecord()},stopyin:function(){var e=this;wx.stopRecord({success:function(t){e.localId=t.localId,alert(e.localId)}})},playyin:function(){wx.playVoice({localId:this.localId})},onBridgeReady:function(){WeixinJSBridge.invoke("getBrandWCPayRequest",{appId:"wx2421b1c4370ec43b",timeStamp:"1395712654",nonceStr:"e61463f8efa94090b1f366cccfbbb444",package:"prepay_id=u802345jgfjsdfgsdg888",signType:"MD5",paySign:"70EA570631E4BB79628FBCA90534C63FF7FADD89"},function(e){e.err_msg})}}},d={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("div",{staticClass:"div",on:{click:e.startyin}},[e._v("开启录音")]),e._v(" "),n("br"),e._v(" "),n("div",{staticClass:"div",on:{click:e.stopyin}},[e._v("停止录音")]),e._v(" "),n("br"),e._v(" "),n("div",{staticClass:"div",on:{click:e.playyin}},[e._v("播放")]),e._v(" "),n("br"),e._v(" "),n("div",{staticClass:"div",on:{click:e.onBridgeReady}},[e._v("支付")])])},staticRenderFns:[]};var l=n("VU/8")(r,d,!1,function(e){n("ii/r")},"data-v-f8c667e0",null).exports;o.a.use(s.a);var p=new s.a({routes:[{path:"/",name:"HelloWorld",component:l}]}),u=n("aozt"),f=n.n(u);o.a.config.productionTip=!1;o.a.prototype.axio=f.a.create({baseURL:"http://tsml520.cn"}),new o.a({el:"#app",router:p,components:{App:a},template:"<App/>"})},"ii/r":function(e,t){},vwm7:function(e,t){}},["NHnr"]);
//# sourceMappingURL=app.324f9a4db1c7cd633d29.js.map