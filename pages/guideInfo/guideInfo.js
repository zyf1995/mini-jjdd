// pages/guideInfo/guideInfo.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    id: '',
    info: {}
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    this.getInfo()
  },
  getInfo(){
    let that = this
    http.user_guideInfo({ // 调用接口，传入参数
      data: {
        id: that.data.id
      },
      success: res => {
        let content = loginCheck.formatRichText(res.data.content)
        that.setData({
          info: res.data,
          "info.content": content
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})