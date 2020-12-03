// pages/studyOnline/studyOnline.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
function get_wxml(className, callback) {
  wx.createSelectorQuery().selectAll(className).boundingClientRect(callback).exec()
}
Page({
  data: {
    id:'',
    vc_detail:{},
    playUrl:"",
    videoNum:'',
    navState: 0,
    videoId:'',
    swiperH:''
  },

  onLoad: function (options) {
    let that = this
    that.setData({
      id: options.id
    })
    that.getDetail()
  },
  getDetail: function () {
    let that = this
    http.vcDetail({ // 调用接口，传入参数
      data: {
        course_id: 34
      },
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          vc_detail: res.data,
          videoNum: res.data.videos.length,
          playUrl: res.data.videos[0].video_file,
          videoId: res.data.videos[0].id
        })
        that.getHeight()
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getHeight: function () {
    let that = this
    let id = that.data.vc_detail.id
    get_wxml(`.li${id}`, (rects) => {
      let sum_heigth = 0
      for (let i = 0; i < that.data.videoNum; i++) {
        sum_heigth += rects[i].height
      }
      that.setData({
        swiperH: sum_heigth
      })
      console.log(that.data.swiperH)
    })
  },
  //监听滑块
  bindchange(e) {
    let index = e.detail.current;
    this.setData({
      navState: index
    })
  },
  //点击导航
  navSwitch: function (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      navState: index
    })
  },
  playVideoAgain: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      videoId: item.id,
      playUrl: item.video_file
    })
  },
  goBuy: function () {
    let that = this
    wx.navigateTo({
      url: '/pages/studyBuy/studyBuy?id=' + that.data.id,
    })
  }
})