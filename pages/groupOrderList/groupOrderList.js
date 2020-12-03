// pages/groupOrderList/groupOrderList.js
import http from '../../utils/api';
const app = getApp();
Page({
  data: {
    status:'total',
    tabSubArray:[{
      title:'总订单',
      id:'total'
    },{
      title:'分订单',
      id:'detail'
    }],
    tabArray: [{
        title: '全部',
        dataType: 'all'
    }, {
        title: '未生效',
        dataType: '10'
    }, {
        title: '待发货',
        dataType: '20'
    }, {
        title: '待收货',
        dataType: '30'
    }, {
        title: '已完成',
        dataType: '50'
    }],
    tabArray1: [{
        title: '全部',
        dataType1: 'all'
    }, {
        title: '进行中',
        dataType1: '10'
    }, {
        title: '已完成',
        dataType1: '20'
    }],
    dataType1:'all',
    dataType: 'all',
    navigationBarHeight: (app.globalData.mobileInfo.statusBarHeight + 44) + 'px',
    orderList:[],
  },
  onLoad: function (options) {
    let that = this
    that.setData({
      dataType: options.dataType || 'all',
      dataType1: options.dataType1 || 'all',
      status: options.status || '1'
    })
    that.getList('正在加载数据...')
  },
  myCenterPage: function () {
    wx.reLaunch({
      url: '/pages/my/my',
    })
  },
  toMallGoodsInfo: function (e) {
    let that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/groupShopDetail/groupShopDetail?goods_id=' + id,
    })
  },
  goOrderInfo(e){
    let that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/groupOrderInfo/groupOrderInfo?id=' + id + '&status=' + that.data.status,
    })
  },
  typeS(e){
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      status: item.id
    })
    that.getList('正在加载数据...')
  },
  tabS1: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      dataType1: item.dataType1
    })
    that.getList('正在加载数据...')
  },
  tabS: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      dataType: item.dataType
    })
    that.getList('正在加载数据...')
  },
  updateOrderListFinish: function() {
    let that = this
    console.log('我更新啦')
    that.getList('正在加载数据...')
  },
  getList(message){
    let that = this
    wx.showNavigationBarLoading()				
    wx.showLoading({								
      title: message,
    })
    let json = {
      type: that.data.status
    }
    if(that.data.status == 'detail'){
      json.status = that.data.dataType
    }else {
      json.status = that.data.dataType1
    }
    http.groupOrder_list({
      data: json,
      success: res => {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        that.setData({
          orderList: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})