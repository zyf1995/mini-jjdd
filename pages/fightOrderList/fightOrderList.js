// pages/fightOrderList/fightOrderList.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    goodsList:[],
    keywords: ''
  },
  onLoad: function (options) {
    let that = this
    that.getList()
  },
  onPullDownRefresh() {
    let that = this
    that.getList()
    wx.stopPullDownRefresh()
  },
  getList(){
    let that = this
    http.getgoodslist({
      data: {
        key_word: that.data.keywords
      },
      success: res => {
        that.setData({
          goodsList: res.data.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  toGoodsInfo(e){
    let that = this
    let id = e.currentTarget.dataset.id
    let goodsid = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: '/pages/fightOrderDetail/fightOrderDetail?id=' + id + '&goodsid=' + goodsid,
    })
  },
  goMyOrderList(){
    if(!loginCheck.toLoginCheck()){
      return false
    }
    wx.navigateTo({
      url: '/pages/fightingOrderList/fightingOrderList',
    })
  },
})