// pages/orderList/orderList.js
import http from '../../utils/api';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabArray: [{
      title: '全部',
      dataType: 'all'
    }, {
      title: '待付款',
      dataType: 'payment'
    }, {
      title: '待发货',
      dataType: 'delivery'
    }, {
      title: '待收货',
      dataType: 'received'
    }, {
      title: '已完成',
      dataType: 'finish'
    }],
    dataType:'all',
    list: [],
    page:1,
    hasMoreData: true,
    pageSize: 8,
    navigationBarHeight: (app.globalData.mobileInfo.statusBarHeight + 44) + 'px',
    tabArraySub:[{
      title: '门店订单',
      status: '1'
    }, {
      title: '优选订单',
      status: '2'
    }],
    status: 1,
    tabArray1: [{
      title: '全部',
      dataType1: ''
    }, {
        title: '待付款',
        dataType1: '40'
    }, {
        title: '待发货',
        dataType1: '10'
    }, {
        title: '待收货',
        dataType1: '20'
    }, {
        title: '已完成',
        dataType1: '30'
    }],
    dataType1:'',
    orderList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      dataType: options.dataType || 'all',
      status: options.status || '1',
      dataType1: options.dataType1 || ''
    })
    if(that.data.status == 1){
      that.getStoreList('正在加载数据...')
    }else{
      that.getList('正在加载数据...')
    }
    
  },
  onPullDownRefresh: function () {
    this.data.page = 1
    this.getList('正在刷新数据')
  },
  // onReachBottom: function () {
  //   if (this.data.hasMoreData) {
  //     this.getList('加载更多数据')
  //   } else {
  //     wx.showToast({
  //       title: '没有更多数据',
  //     })
  //   }
  // },    
  myCenterPage: function () {
    wx.reLaunch({
      url: '/pages/my/my',
    })
  },
  getList: function (message) {
    let that = this
    wx.showNavigationBarLoading()					//在当前页面显示导航条加载动画
    wx.showLoading({								//显示 loading 提示框
      title: message,
    })
    http.mallOrderList({ // 调用接口，传入参数
      data: {
        dataType: that.data.dataType,
        page: that.data.page
      },
      success: res => {
        console.log('接口请求成功', res)
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        that.setData({
          list: res.data
        })
      //  if(res.data.length > 0){
      //    var contentlistTem = that.data.list;
      //    wx.hideNavigationBarLoading()	
      //    wx.hideLoading()
      //    if (that.data.page == 1) {
      //      contentlistTem = []
      //    }
      //    let list = res.data;
      //    if (list.length < that.data.pageSize) {
      //      console.log(list)
      //      that.setData({
      //        list: contentlistTem.concat(list),
      //        hasMoreData: false
      //      })
      //    } else {
      //      that.setData({
      //        list: contentlistTem.concat(list),
      //        hasMoreData: true,
      //        page: that.data.page + 1
      //      })
      //    }
      //  }else{
      //    wx.hideNavigationBarLoading()		
      //    wx.hideLoading()
      //    that.setData({
      //      list: res.data,
      //      hasMoreData: false
      //    })
      //  }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  typeS(e){
    let that = this
    let item = e.currentTarget.dataset.item
    let index = e.currentTarget.dataset.index
    that.setData({
      status: item.status
    })
    if(that.data.status == 1){
      that.getStoreList('正在加载数据...')
    }else{
      that.getList('正在加载数据...')
    }
  },
  tabS1: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    let index = e.currentTarget.dataset.index
    that.setData({
      dataType1: item.dataType1
    })
    that.getStoreList('正在加载数据...')
  },
  tabS: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    let index = e.currentTarget.dataset.index
    that.setData({
      dataType: item.dataType,
      page: 1
    })
    that.getList('正在加载数据...')
  },
  toMallGoodsInfo: function (e) {
    let that = this
    let id = e.currentTarget.dataset.id
    console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?goodsId=' + id,
    })
  },
  updateOrderListFinish: function() {
    let that = this
    console.log('我更新啦')
    that.getList('正在加载数据...')
  },
  updateOrderList: function () {
    let that = this
    console.log('我更新啦')
    that.getList('正在加载数据...')
  },
  goOrderInfo: function (e) {
    let that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/orderInfo/orderInfo?id=' + id,
    })
  },
  getStoreList(message){
    let that = this
    wx.showNavigationBarLoading()				
    wx.showLoading({								
      title: message,
    })
    http.ds_order_userorder({ // 调用接口，传入参数
      data: {
        order_status: that.data.dataType1
      },
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
  },
  toMallGoodsInfo1(e){
    let that = this
    let product_id = e.currentTarget.dataset.itemgoods.store_product_id
    wx.navigateTo({
      url: '/pages/dsShopDetail/dsShopDetail?product_id=' + product_id + '&pageFrom=doorShop',
    })
  },
  goDetail1(e){
    let that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/dsOrderInfo/dsOrderInfo?id=' + id,
    })
  }
})