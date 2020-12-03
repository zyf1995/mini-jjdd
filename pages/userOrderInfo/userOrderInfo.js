// pages/userOrderInfo/userOrderInfo.js
import http from '../../utils/api';
const app = getApp();
Page({
  data: {
    order_id: '',
    orderDetail: {},
    week: ''
  },
  onLoad: function (options) {
    let that = this
    that.setData({
      order_id: options.order_id
    })
    that.getOrderDetail()
  },
  getOrderDetail(){
    let that = this
    http.serverOrderDetail({ // 调用接口，传入参数
      data: {
        id: that.data.order_id
      },
      success: res => {
        that.setData({
          orderDetail: res.data
        })
        let weekDay =  ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
        let dd = new Date();
        let y = dd.getFullYear();
        let year = y + '-' + that.data.orderDetail.order_date
        that.data.week = weekDay[new Date(Date.parse(year)).getDay()]
        that.setData({
          week: that.data.week
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  cancelOrder(){
    var that = this
    wx.showModal({
      title: '提示',
      content: '您确定要取消当前订单吗',
      success (res) {
        if (res.confirm) {
          http.cancel_server({ 
            data: {
              id: that.data.orderDetail.id,
              type: 10
            },
            success: res => {
              toast: {
                app.wxToast({
                  title:res.msg
                })
              }
              if(res.code == 1){
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
              }
            },
            fail: err => {
              console.log(err)
            }
          })
        } else if (res.cancel) {
          
        }
      }
    })
  }
})