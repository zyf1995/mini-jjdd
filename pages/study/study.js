// pages/study/study.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({

  data: {
    vc_slide: {},
    vc_hot: {},
    vc_hao: {},
    vc_type: {},
    vc_detail: {},
  },

  onLoad: function (options) {
    let that = this
    that.getBanner()
    that.getVcType()
    that.getHotRank()
    that.getGoodLesson()
  },
  getBanner: function () {
    let that = this
    http.vcSlide({ // 调用接口，传入参数
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        this.setData({
          vc_slide: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getVcType: function () {
    let that = this
    http.vcType({ // 调用接口，传入参数
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        this.setData({
          vc_type: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getHotRank: function () {
    let that = this
    http.vcHot({ // 调用接口，传入参数
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        this.setData({
          vc_hot: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getGoodLesson: function () {
    let that = this
    http.vcHao({ // 调用接口，传入参数
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        this.setData({
          vc_hao: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  goMovie: function (e) {
    let that = this 
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/studyOnline/studyOnline?id=' + id,
    })
  }
})