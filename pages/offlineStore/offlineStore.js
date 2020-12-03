// pages/offlineStore/offlineStore.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    bannerList:[],
    ds_stores:[],
    dsNearstores:[],
    showDialog: false,
    lat:"",
    lon:"",
    keyword: ''
  },
  onLoad: function (options) {
    let that = this
    that.getMerPic()
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        console.log(res)
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({
          lat: latitude,
          lon: longitude
        })
        that.getNearStores()
      }
    })
  },
  onShow: function (){
    let that = this
    that.getLocationInfo()
  },
  go_update(){
    var that = this
    this.setData({
      showDialog: false
    })
    that.getDsStoresList()
  },
  changeVal: function (e) {
    let that = this
    that.setData({
      keyword: e.detail.value
    })
    if(!e.detail.value){
      that.getDsStoresList()
    }
  },
  getLocationInfo(){
    let that = this
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则地图定位功能将无法使用',
            success: function (res) {
              if (res.cancel) {
                console.info("1授权失败返回数据");
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (data) {
                    if (data.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 2000
                      })  
                      wx.getLocation({
                        type: 'wgs84',
                        success: (res) => {
                          console.log(res)
                          var latitude = res.latitude
                          var longitude = res.longitude
                          that.setData({
                            lat: latitude,
                            lon: longitude
                          })
                          that.getNearStores()
                        }
                      })
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'success',
                        duration: 2000
                      })
                    }
                  }
                })
              }
            }
          })
        } else {
          
        }
      }
    })
  },
  getMerPic: function () {
    let that = this
    http.ds_getMerPic({ // 调用接口，传入参数
      data: {},
      success: res => {
        that.setData({
          bannerList: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  navigation(e){
    let that = this
    let item = e.currentTarget.dataset.item
    wx.openLocation({
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      name: item.name,
      scale: 10,
      address: item.address,
      success:function(r){
        console.log(r)
      },
      fail:function(err){
        console.log(err)
      }
    })  
  },
  preventTouchMove: function () {
    this.setData({
      showDialog: false
    })
  },
  onPullDownRefresh(){
    let that = this
    that.getNearStores()
  },
  getNearStores: function (){
    let that = this
    http.ds_nearstores({ 
      data: {
        longitude: that.data.lon,
        latitude: that.data.lat
      },
      success: res => {
        that.setData({
          dsNearstores: res.data
        })
        wx.stopPullDownRefresh()
        if(res.code == 1){
          that.setData({
            showDialog: true
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  moreDs: function (){
    let that = this
    this.setData({
      showDialog: false
    })
    that.getDsStoresList()
  },
  search(){
    let that = this
    if(!that.data.keyword){
      // toast: {
      //   app.wxToast({
      //     title: '关键词不能为空'
      //   })
      // };
      return false
    }
    that.getDsStoresList()
  },
  getDsStoresList(){
    let that = this
    http.ds_stores({ 
      data: {
        longitude: that.data.lon,
        latitude: that.data.lat,
        name: that.data.keyword
      },
      success: res => {
        that.setData({
          ds_stores: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  goDsDetail(e){
    let that = this
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/dsDetail/dsDetail?store_id=' + item.id,
    })
  }
})