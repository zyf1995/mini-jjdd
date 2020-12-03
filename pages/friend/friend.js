// pages/friend/friend.js
import http from '../../utils/api';
import loginCheck from '../../utils/loginCheck';
import ImgMerge from '../../utils/canvas-poster';
const app = getApp();
Page({
  data: {
    tabArray: [
      '俭单资讯',
      '发圈素材'
    ],
    currentIndex: 0,
    list: [],
    user_level: 0,
    noMore: false,
    left: 0,
    tabWidth: 0,
    page: 1,
    hasMoreData: true,
    hasMoreData1: true,
    cateList: [],
    guideList: [],
    page1: 1,
    cate_id: '',
    noMore1: false,
    banner: [],
    guideBanner: '',
    scrollLeft: 0,
    tabWidth: 0,
    left1: 0,
    poster: [],
    userInfo: {}
  },
  onLoad: function (options) {
    let that = this
    if (!wx.getStorageSync('hdt_userInfo') || wx.getStorageSync('hdt_userInfo').token == '') {

    } else {
      that.getUserInfo()
    }
    if (that.data.currentIndex == 1) {
      that.getList()
    } else {
      that.getCate()
      that.getBanner()
    }

  },
  onPullDownRefresh() {
    let that = this
    if (that.data.currentIndex == 1) {
      that.getList()
      if (!wx.getStorageSync('hdt_userInfo') || wx.getStorageSync('hdt_userInfo').token == '') {

      } else {
        that.getUserInfo()
      }
    } else {
      that.getCate()
      that.getBanner()
    }
    wx.stopPullDownRefresh()
  },
  getUserInfo: function () {
    let that = this
    http.userInfo({ // 调用接口，传入参数
      data: {},
      success: res => {
        that.setData({
          user_level: parseInt(res.data.level.level),
          userInfo: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  onReachBottom: function () {
    var that = this
    if (that.data.currentIndex == 1) {
      if (that.data.hasMoreData) {
        var page = that.data.page + 1
        that.setData({
          page: page
        })
        that.getList('scrolltobottom')
      } else {
        toast: {
          app.wxToast({
            title: '没有更多数据'
          })
        };
      }
    } else {
      if (that.data.hasMoreData1) {
        var page1 = that.data.page1 + 1
        that.setData({
          page1: page1
        })
        that.getGuideList('scrolltobottom')
      } else {
        toast: {
          app.wxToast({
            title: '没有更多数据'
          })
        };
      }
    }
  },
  tabS(e) {
    var that = this
    let index = e.currentTarget.dataset.index
    this.setData({
      currentIndex: index,
      page: 1,
      page1: 1
    })
    const query = wx.createSelectorQuery()
    query.select('.gs_tabs1 .gs_t_item').boundingClientRect()
    query.exec(function (res) {
      that.setData({
        left: res[0].width * index
      })
    })
    if (that.data.currentIndex == 1) {
      that.getList()
    } else {
      that.setData({
        left1: 0,
        scrollLeft: 0
      })
      that.getCate()
      that.getBanner()
    }
  },
  getList(type) {
    var that = this
    var json = {
      page: that.data.page,
      type: 20
    }
    http.friend_bibei({ // 调用接口，传入参数
      data: json,
      success: res => {
        if (type == 'scrolltobottom') {
          var arr1 = that.data.list
          var arr2 = res.data.data
          arr1 = arr1.concat(arr2)
          that.setData({
            list: arr1,
            qrcode: res.data.qrcode
          })
          if (res.data.data.length == 0) {
            that.setData({
              hasMoreData: false,
              noMore: true
            })
          }
        } else {
          that.setData({
            list: res.data.data,
            noMore: true,
            qrcode: res.data.qrcode
          })
        }
        that.data.list.forEach((item, index) => {
          var obj = {
            avatar: []
          }
          that.data.poster[index] = obj
          item.avatar.forEach((avatar) => {
            const PosterMerge = new ImgMerge([{
                url: avatar,
                x: 0,
                y: 0,
                w: 450,
                h: 760
              },
              {
                url: that.data.qrcode,
                x: 300,
                y: 604,
                w: 122,
                h: 122
              }
            ], { nickname: (that.data.userInfo.nickname || that.data.userInfo.mobile) || '' })
            PosterMerge.then((image) => {
              that.data.poster[index].avatar.push(image)
              that.setData({
                poster: that.data.poster
              })
            })
          })
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  showPic(e) {
    let pics = e.currentTarget.dataset.avatar
    let index = e.currentTarget.dataset.index
    wx.previewImage({
      current: index, // 当前显示图片的http链接
      urls: pics // 需要预览的图片http链接列表
    })
  },
  getCate() {
    let that = this
    http.user_new_guide_cate({
      data: {},
      success: res => {
        that.setData({
          cateList: res.data,
          cate_id: res.data[0].id
        })
        that.getGuideList()
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getBanner() {
    let that = this
    http.mallHome({
      data: {},
      success: res => {
        if (res.data.bannerlist.article.length > 0) {
          that.setData({
            banner: res.data.bannerlist.article
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getGuideList(type) {
    let that = this
    let json = {
      page: that.data.page1
    }
    json.cate_id = that.data.cate_id
    http.userGuide({ // 调用接口，传入参数
      data: json,
      success: res => {
        if (type == 'scrolltobottom') {
          var arr1 = that.data.guideList
          var arr2 = res.data
          arr1 = arr1.concat(arr2)
          that.setData({
            guideList: arr1
          })
          if (res.data.length == 0) {
            that.setData({
              hasMoreData1: false,
              noMore1: true
            })
          }
        } else {
          that.setData({
            guideList: res.data
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  tabS1(e) {
    var that = this
    let index = e.currentTarget.dataset.index
    let item = e.currentTarget.dataset.item
    that.setData({
      cate_id: item.id,
      page1: 1,
      hasMoreData1: true
    })
    const query = wx.createSelectorQuery();
    setTimeout(function () {
      query.select('.gs_tabs .gs_t_item').boundingClientRect()
      query.exec(function (res) {
        that.setData({
          left1: res[0].width * index,
          tabWidth: res[0].width
        })
      })
    }, 200)
    if (index > 1 && index < (that.data.cateList.length - 2)) {
      that.setData({
        scrollLeft: that.data.tabWidth * (index - 2)
      })
    } else if (index < 2) {
      that.setData({
        scrollLeft: 0
      })
    } else {
      that.setData({
        scrollLeft: that.data.tabWidth * index
      })
    }
    that.getGuideList()
  },
  toInfo(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/guideInfo/guideInfo?id=' + id,
    })
  }
})