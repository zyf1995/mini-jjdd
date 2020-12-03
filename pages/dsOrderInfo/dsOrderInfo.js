// pages/dsOrderInfo/dsOrderInfo.js
import http from '../../utils/api';
const app = getApp();
Page({
  data: {
    id: '',
    info: {}
  },
  onLoad: function (options) {
    let that = this
    that.setData({
      id: options.id || '290'
    })
    that.getInfo()
  },
  getInfo: function () {
    let that = this
    http.ds_order_userorderdetail({
      data: {
        id: that.data.id
      },
      success: res => {
        that.setData({
          info: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  toMallGoodsInfo: function (e) {
    let that = this
    let product_id = e.currentTarget.dataset.itemgoods.store_product_id
    wx.navigateTo({
      url: '/pages/dsShopDetail/dsShopDetail?product_id=' + product_id + '&pageFrom=doorShop',
    })
  },
  submit: function () {
    let that = this
    http.ds_order_pay({
      data: {
        order_num: that.data.info.order_num,
        type: "miniapp"
      },
      success: res => {
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
            wx.navigateTo({
              url: "/pages/orderList/orderList?dataType1=10&status=1",
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
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  orderReceived: function (e) {
    let that = this
    let id = e.currentTarget.dataset.id
    http.ds_order_userreceipt({
      data: {
        id: id
      },
      success: res => {
        console.log('接口请求成功', res)
        toast: {
          app.wxToast({
            title: '收货成功'
          })
        };
        setTimeout(function () {
          wx.navigateTo({
            url: "/pages/orderList/orderList?dataType1=30&status=1",
          })
        }, 1000)
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  expressS: function () {
    let that = this
    let type = that.data.info.express_company.code;
    let postid = that.data.info.express_num;
    wx.navigateTo({
      url: '../../pages/detail/detail?type=' + type + '&postid=' + postid
    })
  }
})