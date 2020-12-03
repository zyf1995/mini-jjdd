// pages/fightOrderDetail/fightOrderDetail.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    array: [1,2,3],
    htmlSnip: `<div class="div_class">
      <h1>Title</h1>
      <p class="p">
        Life is&nbsp;<i>like</i>&nbsp;a box of
        <b>&nbsp;chocolates</b>.
      </p>
    </div>`,
    showModel: false,
    id: '',
    goodsid: '',
    goodsInfo: {},
    teamList: [],
    nowTime: '',
    goodsContent: '',
    orderListHeight: 250,
    showModel1: false,
    payInfo: {
      type: 'miniapp',
      remark: '',
      password: ''
    },
    userInfo: {},
    sucTeamList: []
  },
  onLoad: function (options) {
    let that = this
    that.setData({
      id: options.id,
      goodsid: options.goodsid
    })
    that.getGoodDetail()
    that.getTeamList()
    // that.getSuccessTeamList()
    if(!wx.getStorageSync('hdt_userInfo') || wx.getStorageSync('hdt_userInfo').token == ''){
      
    }else{
      that.getUserInfo()
    }
  },
  onPullDownRefresh() {
    let that = this
    that.getGoodDetail()
    that.getTeamList()
    wx.stopPullDownRefresh()
  },
  getUserInfo: function (options) {
    let that = this
    http.userInfo({
      data: {},
      success: res => {
        that.setData({
          userInfo: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getGoodDetail(){
    let that = this
    http.getgoodsdetail({
      data: {
        good_id: that.data.goodsid
      },
      success: res => {
        let content = loginCheck.formatRichText(res.data.goods.content)
        that.setData({
          goodsInfo: res.data,
          "goodsInfo.goods.content": content
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  payTypeS(e) {
    let that = this
    let type = e.currentTarget.dataset.type
    that.setData({
      "payInfo.type": type
    })
  },
  getSuccessTeamList(){
    let that = this
    http.getTeamList({
      data: {
        good_id: that.data.goodsid,
        status: 20
      },
      success: res => {
        that.setData({
          sucTeamList: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getTeamList(){
    let that = this
    http.getTeamList({
      data: {
        good_id: that.data.goodsid,
        status: 10
      },
      success: res => {
        that.setData({
          teamList: res.data
        })
        let query = wx.createSelectorQuery()
        query.selectAll('.orderItem').boundingClientRect(function(rect){
          if(rect.length != 0){
            that.setData({
              orderListHeight: rect[0].height * 2
            })
          }
        }).exec()
        that.data.teamList.forEach((tem)=>{
          tem.endtime = tem.endtime * 1000
          tem.desiduetime = ''
          that.countDown()
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  countDown(){
    let that = this
    let timer = setInterval(()=>{
      for(let i = 0; i < that.data.teamList.length; i++){
        let nowTime = new Date().getTime()
        if(nowTime <= that.data.teamList[i].endtime){
          let endTime = that.data.teamList[i].endtime - nowTime
          endTime -= 1000
          let t = endTime
          if(t > 0){
              let day = Math.floor(t / 86400000)
              let hour = Math.floor((t / 3600000) % 24)
              let min = Math.floor((t / 60000) % 60)
              let sec = Math.floor((t / 1000) % 60)
              hour = hour < 10 ? '0' + hour : hour
              min = min < 10 ? '0' + min : min
              sec = sec < 10 ? '0' + sec : sec
              let format = ''
              if(day <= 0){
                format = `<div>剩余 ${hour}:${min}:${sec}</div>`
              }else{
                format = `<div>剩余${day}天 ${hour}:${min}:${sec}</div>`
              }
              var desiduetime = "teamList[" + i + "].desiduetime"
              that.setData({
                [desiduetime]: format
              })
          }else{
            let flag = that.teamList.every(function (val, ind) {
              return t <= 0;
            });
            if (flag) clearInterval(timer)
            let format = ''
            format = `<div>剩余 00:00:00</div>`
            var desiduetime = "teamList[" + i + "].desiduetime"
            that.setData({
              [desiduetime]: format
            })
          }
        }
      }
    },1000)
  },
  seeOrderList(){
    let that = this
    if(that.data.teamList.length == 0){
      toast: {
        app.wxToast({
          title: '当前没有正在进行的拼团'
        })
      };
      return false
    }
    that.setData({
      showModel: true
    })
  },
  preventTouchMove(){
    let that = this
    that.setData({
      showModel: false,
      showModel1: false
    })
  },
  sendFightOrder(){
    let that = this
    if(!loginCheck.toLoginCheck()){
      return false
    }
    that.setData({
      showModel1: true,
      "payInfo.password": ""
    })
  },
  updateValue: function (e) {
    let that = this;
    that.setData({
      "payInfo.password": e.detail.value
    })
  },
  submit(){
    let that = this
    that.setData({
      showModel1: false
    })
    let json = {
      good_id: that.data.goodsid,
      good_spec_id: that.data.goodsInfo.good_spec[0].goods_spec_id,
      type: that.data.payInfo.type
    }
    if (that.data.payInfo.type == 'money') {
      if (!that.data.payInfo.password) {
          toast: {
            app.wxToast({
              title: '请输入支付密码'
            })
          };
          return false;
      }
      json.password = that.data.payInfo.password
    }else if(that.data.payInfo.type == 'miniapp'){
      wx.showLoading({
        title: "正在调起支付···",
        mask: true
      })
    }
    http.createTeam({
      data: json,
      success: res => {
        wx.hideLoading()
        if(res.code == 1){
          if(that.data.payInfo.type == 'miniapp'){
            wx.requestPayment({
              timeStamp: res.data.timeStamp,
              nonceStr: res.data.nonceStr,
              package: res.data.package,
              signType: res.data.signType,
              paySign: res.data.paySign,
              success: function (res) {
                toast: {
                  app.wxToast({
                    title: '支付成功'
                  })
                };
                that.getTeamList()
                wx.navigateTo({
                  url: '/pages/fightingOrder/fightingOrder?pageFrom=orderDetail&goods_id=' + that.data.goodsid + '&team_id=' + res.data.team_id + '&good_spec_id=' + that.data.goodsInfo.good_spec[0].goods_spec_id,
                })
              },
              fail: function (err) {
                toast: {
                  app.wxToast({
                    title: '支付失败'
                  })
                };
              }
            })
          }else if(that.data.payInfo.type == 'money'){
            if(res.code == 0){
              toast: {
                app.wxToast({
                  title: res.msg
                })
              };
              return false
            }
            toast: {
              app.wxToast({
                title: '支付成功'
              })
            };
            that.getTeamList()
            wx.navigateTo({
              url: '/pages/fightingOrder/fightingOrder?pageFrom=orderDetail&goods_id=' + that.data.goodsid + '&team_id=' + res.data.team_id + '&good_spec_id=' + that.data.goodsInfo.good_spec[0].goods_spec_id,
            })
          }
        }else{
          toast: {
            app.wxToast({
              title: res.msg
            })
          };
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  goFightOrder(e){
    let that = this
    let id = e.currentTarget.dataset.id
    if(!loginCheck.toLoginCheck()){
      return false
    }
    wx.navigateTo({
      url: '/pages/fightingOrder/fightingOrder?pageFrom=orderDetail&goods_id=' + that.data.goodsid + '&team_id=' + id + '&good_spec_id=' + that.data.goodsInfo.good_spec[0].goods_spec_id,
    })
  },
  goMyOrderList(){
    if(!loginCheck.toLoginCheck()){
      return false
    }
    wx.navigateTo({
      url: '/pages/fightingOrderList/fightingOrderList',
    })
  },
  goOrderRecord(){
    let that = this
    wx.navigateTo({
      url: '/pages/fightOrderRecord/fightOrderRecord?goods_id=' + that.data.goodsid,
    })
  }
})