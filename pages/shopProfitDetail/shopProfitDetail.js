// pages/shopProfitDetail/shopProfitDetail.js
import http from '../../utils/api';
const app = getApp();
Page({
  data: {
    tabArray:[
      {
        title:'余额总明细',
        dataType: 'E'
      }, {
        title: '积分总明细',
        dataType: 'F'
      }
    ],
    dataType: 'E',
    page: 1,
    list: [],
    pageSize: 10,
    hasMoreData: true,
    total:''
  },

  onLoad: function (options) {
    let that = this
    that.getList()
  },
  tabS: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      dataType: item.dataType,
      page: 1
    })
    that.getList()
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      this.getList()
    } else {
      toast: {
        app.wxToast({
          title: '没有更多数据'
        })
      };
    }
  },
  getList: function () {
    let that = this
    http.shopProfitDetail({ // 调用接口，传入参数
      data: {
        type: that.data.dataType,
        page: that.data.page
      },
      success: res => {
        that.setData({
          total: res.data.total
        })
        if (res.data.list.length > 0) {
          var list1 = that.data.list;
          if (that.data.page == 1) {
            list1 = []
          }
          let list = res.data.list;
          if (list.length < that.data.pageSize) {
            that.setData({
              list: list1.concat(list),
              hasMoreData: false
            })
          } else {
            that.setData({
              list: list1.concat(list),
              hasMoreData: true,
              page: that.data.page + 1
            })
          }
        } else {
          that.setData({
            list: res.data.list,
            hasMoreData1: false
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})