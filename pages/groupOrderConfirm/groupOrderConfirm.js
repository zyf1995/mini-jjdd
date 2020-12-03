// pages/groupOrderConfirm/groupOrderConfirm.js
import http from '../../utils/api';
const app = getApp();
Page({
  data: {
    buyInfo: {},
    info: {},
    payInfo: {
      type: 'alipay',
      remark: ''
    },
    shopRemarks: [],
    remarks: [],
    goodslist: []
  },
  onLoad: function (options) {
    let that = this
    that.setData({
      buyInfo: JSON.parse(options.buyInfo)
    })
    that.getInfo()
  },
  go_update() {
    let that = this
    that.getInfo()
  },
  goAddressList() {
    wx.navigateTo({
      url: '/pages/addressList/addressList?fromPage=orderConfirm'
    })
  },
  goAddressAdd() {
    wx.navigateTo({
      url: '/pages/addressAdd/addressAdd'
    })
  },
  getInfo: function () {
    let that = this
    http.groupGoods_buyNow({ // 调用接口，传入参数
      data: {
        goods_id: that.data.buyInfo.goods_id,
        goods_num: that.data.buyInfo.goods_num
      },
      success: res => {
        this.setData({
          info: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
})