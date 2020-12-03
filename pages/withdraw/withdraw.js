// pages/withdraw/withdraw.js
import http from '../../utils/api';
const app = getApp();
Page({
  data: {
    userInfo: {},
    info: {
      num: '',
      type: 'alipay'
    },
    isAlipay: '',
    withdraw_min: '',
    money: ''
  },
  onLoad: function (options) {
    let that = this
    that.getInfo()
  },
  updateValue: function (e) {
    let that = this
    that.setData({
      "info.num": e.detail.value
    })
  },
  getInfo: function () {
    let that = this
    http.userWithdraw({
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          isAlipay: res.data.alipay,
          money: res.data.money,
          withdraw_min: res.data.withdraw_min
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  goBindAlipay: function () {
    let that = this
    wx.navigateTo({
      url: '/pages/bindAlipay/bindAlipay',
    })
  },
  //更新本页面
  go_update() {
    let that = this
    console.log('我更新啦')
    that.getInfo()
  },
  submit: function () {
    var that = this;
    if (!that.data.info.num) {
      toast: {
        app.wxToast({
          title: "请输入提现金额"
        })
      };
      return false;
    }
    if (that.data.isAlipay == false) {
      toast: {
        app.wxToast({
          title: "请先绑定支付宝"
        })
      };
      return false;
    }
    http.userWithdraw1({
      data: {
        num: that.data.info.num,
        type: that.data.info.type
      },
      success: res => {
        console.log('接口请求成功', res)
        toast: {
          app.wxToast({
            title: res.msg
          })
        };
        let pages = getCurrentPages();
        let beforePage = pages[pages.length - 2];
        beforePage.setData({
          txt: '修改数据了'
        })
        beforePage.go_update();
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})