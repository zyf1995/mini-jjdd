// pages/fightingOrderList/fightingOrderList.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    dataType: '9',
    tabArray:[{
      title: '全部',
      dataType: '9'
    },{
      title: '进行中',
      dataType: '1'
    },{
      title: '已拼成',
      dataType: '2'
    },{
      title: '已失效',
      dataType: '4'
    }],
    orderList: []
  },
  onLoad: function (options) {
    let that = this
    that.setData({
      dataType: options.dataType || '9'
    })
    that.getOrderList('正在加载数据...')
  },
  getOrderList(message){
    let that = this
    wx.showNavigationBarLoading()			
    wx.showLoading({						
      title: message,
    })
    http.getOrderList({
      data: {
        status: that.data.dataType
      },
      success: res => {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        that.setData({
          orderList: res.data.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  tabS: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    let index = e.currentTarget.dataset.index
    that.setData({
      dataType: item.dataType,
    })
    that.getOrderList('正在加载数据...')
  },
  goOrderInfo(e){
    let that = this
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/fightingOrder/fightingOrder?pageFrom=orderList&goods_id=' + item.good_id + '&team_id=' + item.team_id + '&good_spec_id=' + item.good_spec_id + '&team_status=' + item.team_status,
    })
  }
})