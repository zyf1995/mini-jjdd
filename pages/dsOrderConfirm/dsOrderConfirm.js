// pages/dsOrderConfirm/dsOrderConfirm.js
import http from '../../utils/api';
const app = getApp();
Page({

  data: {
    cartOrder: "",
    goodsInfo:{},
    buyType: [
      { title: '外送', type: '20' },
      { title: '自提', type: '10' }
    ],
    status: '20',
    address:{},
    orderPostage: "",
    lat:'',
    lon:''
  },

  onLoad: function (options) {
    let that = this
    let goodsInfo = JSON.parse(decodeURIComponent(options.goodsInfo))
    that.setData({
      cartOrder: options.cartOrder,
      goodsInfo: goodsInfo
    })
    that.getAddressDefault()
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({
          lat: latitude,
          lon: longitude
        })
      }
    })
  },  
  goAddressAdd() {
    wx.navigateTo({
      url: '/pages/addressAdd/addressAdd'
    })
  },
  getAddressDefault: function () {
    let that = this
    http.dsAddressDefault({
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          address: res.data
        })
        that.getOrderPostage()
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getOrderPostage: function () {
    let that = this
    http.dsOrderPostage({
      data: {
        region_id: that.data.address.address_id,
        quantity: that.data.goodsInfo.good_list[0].shops.count,
        type: 10
      },
      success: res => {
        if(res.code == 0){
          toast: {
            app.wxToast({
              title: res.msg
            })
          };
        }
        that.setData({
          orderPostage: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  typeS: function (e) {
    let that = this
    let type = e.currentTarget.dataset.type
    console.log(type)
    that.setData({
      status: type
    })
  },
  //更新本页面
  go_update() {
    let that = this
    console.log('我更新啦1111')
    that.getAddressDefault()
  },
  goAddressList() {
    wx.navigateTo({
      url: '/pages/addressList/addressList?fromPage=orderConfirm'
    })
  },
  submit: function () {
    let that = this
    console.log(that.data.cartOrder)
    if (!that.data.orderPostage && that.data.status == 20){
      toast: {
        app.wxToast({
          title: "该地区暂不支持配送，请重新选择地址"
        })
      };
      return false
    }
    if (that.data.cartOrder == 'true'){
      http.dsOrderUserCommitCart({
        data: {
          cart_ids: that.data.goodsInfo.good_list[0].shops.cart_ids,
          order_type: that.data.status,
          address_id: that.data.address.address_id,
          longitude: that.data.lon,
          latitude: that.data.lat
        },
        success: res => {
          console.log('接口请求成功', res)
          that.pay(res.data)
        },
        fail: err => {
          console.log(err)
        }
      })
    }else{
      http.dsOrderUserCommitShop({
        data: {
          store_product_id: that.data.goodsInfo.good_list[0].goods[0].id,
          quantity: that.data.goodsInfo.good_list[0].shops.count,
          order_type: that.data.status,
          address_id: that.data.address.address_id,
          longitude: that.data.lon,
          latitude: that.data.lat
        },
        success: res => {
          console.log('接口请求成功', res)
          that.pay(res.data)
        },
        fail: err => {
          console.log(err)
        }
      })
    }
  },
  pay: function (order_num) {
    let that = this
    http.dsOrderPay({
      data: {
        order_num: order_num,
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
              url: "/pages/orderList/orderList?dataType1=&status=1",
            })
          },
          fail: function (err) {
            toast: {
              app.wxToast({
                title: '支付失败'
              })
            };
            wx.navigateTo({
              url: '/pages/orderList/orderList?dataType1=40&status=1',
            })
          }
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})