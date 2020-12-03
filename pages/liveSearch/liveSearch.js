// pages/liveSearch/liveSearch.js
import http from '../../utils/api';
Page({
  data: {
    keywords: '',
    searchList: [],
  },
  onLoad: function (options) {

  },
  search: function (e) {
    let that = this
    that.setData({
      keywords: e.detail.value
    })
    http.searchRoom({ // 调用接口，传入参数
      data: {
        param: that.data.keywords
      },
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          searchList: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  
})