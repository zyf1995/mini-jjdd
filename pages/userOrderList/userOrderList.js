// pages/userOrderList/userOrderList.js
import http from '../../utils/api';
const app = getApp();
Page({
  data: {
    tabArray: [{
      title: '全部',
      dataType: 'all'
    }, {
      title: '待服务',
      dataType: '10'
    }, {
      title: '已完成',
      dataType: '20'
    }, {
      title: '取消',
      dataType: '30'
    },],
    dataType:'all',
    orderList: []
  },
  onLoad: function (options) {
    let that = this
    that.getOrderList()
  },
  tabS: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    let index = e.currentTarget.dataset.index
    that.setData({
      dataType: item.dataType,
    })
    that.getOrderList()
  },
  getOrderList(){
    let that = this
    http.serverOrder({ // 调用接口，传入参数
      data: {
        status: that.data.dataType
      },
      success: res => {
        that.setData({
          orderList: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  goOrderDetail(e){
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/userOrderInfo/userOrderInfo?order_id=' + item.id,
    })
  },
  go_update(){
    this.getOrderList()
  }
})