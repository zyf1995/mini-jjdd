// pages/mall/mall.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    info:{},
    user_level: 0,
    goodsList:[],
    page: 1,
    hasMoreData: true,
    toBottom: false,
    goodGoodsTab: [
      { id: 1, title: '精品推荐' },
      { id: 2, title: '爆款热卖' },
      { id: 3, title: '生态食品' },
      { id: 4, title: '居家必备' },
    ],
    goodGoodsId: 1,
    goodGoodsList: [],
    centerItem: 0
  },
  onLoad: function (options) {
    let that = this
    that.getInfo()
    that.myShopmyShop()
    that.getGoodGoods()
    if(!wx.getStorageSync('hdt_userInfo') || wx.getStorageSync('hdt_userInfo').token == ''){
      
    }else{
      that.getUserInfo()
    }
  },
  onPullDownRefresh() {
    let that = this
    that.getInfo()
    that.getGoodGoods()
    that.myShopmyShop()
    wx.stopPullDownRefresh()
  },
  getUserInfo: function () {
    let that = this
    http.userInfo({ // 调用接口，传入参数
      data: {},
      success: res => {
        that.setData({
          user_level: parseInt(res.data.level.level)
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getInfo: function () {
    let that = this
    http.mallHome({ // 调用接口，传入参数
      data: {},
      success: res => {
        let arr1 = res.data.bannerlist.secondary
        let arr2 = res.data.bannerlist.activity
        that.setData({
          info: res.data,
          bannerList: arr1.concat(arr2)
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  toGoodsInfo: function (e) {
    let goodsId = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?goodsId=' + goodsId
    })
  },
  onReachBottom: function () {
    var that = this
    if (that.data.hasMoreData) {
      var page = that.data.page + 1
      that.setData({
        page: page
      })
      that.myShopmyShop('scrolltobottom')
    } else {
      toast: {
        app.wxToast({
          title: '没有更多数据'
        })
      };
    }
  }, 
  getGoodGoods() {
    let that = this
    http.mallShopInfo({ // 调用接口，传入参数
      data: {
        page: 1,
        shop_id: '15',
      },
      success: res => {
        that.setData({
          goodGoodsList: res.data.goodsList
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  myShopmyShop: function (type) {
    let that = this
    http.mallShopInfo({ // 调用接口，传入参数
      data: {
        page: that.data.page,
        shop_id: '15',
        type_id: that.data.goodGoodsId
      },
      success: res => {
        if (type == 'scrolltobottom') {
          var arr1 = that.data.goodsList
          var arr2 = res.data.goodsList
          arr1 = arr1.concat(arr2)
          that.setData({
            goodsList: arr1
          })
          if (res.data.goodsList.length == 0) {
            that.setData({
              hasMoreData: false,
              toBottom: true
            })
          }
        } else {
          that.setData({
            goodsList: res.data.goodsList
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  tabS(e) {
    let id = e.currentTarget.dataset.id
    this.setData({
      goodGoodsId: id,
      page: 1,
      hasMoreData: true
    })
    this.myShopmyShop()
  },
  toGoodsList: function (e) {
    let item = e.currentTarget.dataset.item
    if(item){
      wx.navigateTo({
        url: '/packageA/pages/goodsList/goodsList?cate_id=' + item.category_id,
      })
    }else {
      wx.navigateTo({
        url: '/packageA/pages/goodsList/goodsList',
      })
    }
  },
  toGoodsPage: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    if(item.type == 'category'){
      wx.navigateTo({
        url: '/packageA/pages/goodsList/goodsList?cate_id=' + item.category_id,
      })
    }else if(item.type == 'goods'){
      if(item.goods_id != 0){
        wx.navigateTo({
          url: '/pages/goodsInfo/goodsInfo?goodsId=' + item.goods_id,
        })
      }
    }
  },
  goSearch: function () {
    wx.navigateTo({
      url: '/packageA/pages/goodsSearch/goodsSearch?currentType=1',
    })
  },
  goCart(){
    if (!loginCheck.toLoginCheck()) {
      return false
    } else {
      wx.navigateTo({
        url: '/pages/shopCart/shopCart',
      })
    }
  },
  toInfo(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/guideInfo/guideInfo?id=' + id,
    })
  },
  changeFun(e) {
    this.setData({
      centerItem: e.detail.current,
    })
  }
})