// pages/studyBuy/studyBuy.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({

  data: {
    id: '34'
  },

  onLoad: function (options) {
    let that = this
    that.setData({
      id: options.id
    })
    that.getDetail();
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
          vc_detail: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})