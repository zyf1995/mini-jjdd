// pages/immediatelySuccess/immediatelySuccess.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    serverOrder:{},
    dateInfo: {},
    order_num: "",
    lessonMember: {},
    navigationBarHeight: (app.globalData.mobileInfo.statusBarHeight + 44) + 'px',
  },
  onLoad: function (options) {
    let that = this
    that.setData({
      serverOrder: JSON.parse(options.serverOrder),
      dateInfo: JSON.parse(options.dateInfo),
      order_num: options.order_num,
      lessonMember: JSON.parse(options.lessonMember)
    })
    console.log(that.data.dateInfo)
  },
  myCenterPage: function () {
    wx.redirectTo({
      url: '/pages/dsDetail/dsDetail?dataType=2',
    })
  },
  copy(e){
    let that = this
    let text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
  goOrderDetail(){
    let that = this
    wx.navigateTo({
      url: '/pages/userOrderInfo/userOrderInfo?order_id=' + that.data.order_num,
    })
  }
})