// packageB/pages/lessonList/lessonList.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    courseList:[],
    upUrl: app.globalData.upUrl,
    dataType: '0',
    tabArray: [{
      title: '种草',
      dataType: '0'
    },{
      title: '课程',
      dataType: '1'
    }],
    liveBanner:[],
    liveHotsale:[],
    cateList: [{ name: '全部',id:'all'}],
    top_data:[],
    tindex:0,
    on_line_list:[],
    toBottom:false,
    type:'all',
    page: 1,
    hasMoreData: true,
    hasMoreData1: true,
    pageSize: 8,
    animation:{},
    currentTab: 0,
    scrollLeft: 0, 
    winHeight:"",
    wechatLiveList:[],
    wxLivePage:1,
    coursePoster: '',
  },
  onLoad: function (options) {
    let that = this
    that.getCourseList()
    that.getData()
    that.getLiveHotsale()
    that.getWechatLive()
    that.getCoursePoster()
  },
  getCourseList: function () {
    let that = this
    http.courseList({
      data: {},
      success: res => {
        that.setData({
          courseList: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getCoursePoster: function () {
    let that = this
    http.coursePoster({
      data: {},
      success: res => {
        that.setData({
          coursePoster: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  goLessonDetail: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/lessonDetail/lessonDetail?course_id=' + item.id,
    })
  },
  goOrderList: function () {
    wx.navigateTo({
      url: '/pages/buyLessonList/buyLessonList',
    })
  },
  tabS(e){
    let that = this
    let type = e.currentTarget.dataset.type
    that.setData({
      dataType: type
    })
  },
  onPullDownRefresh(){
    let that = this
    if(that.data.dataType == 0){
      that.getData()
      that.getWechatLive()
      that.getLiveHotsale()
    }else {
      that.getCourseList()
      that.getCoursePoster()
    }
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {
    var that = this
    if (that.data.hasMoreData) {
      var page = that.data.wxLivePage + 1
      that.setData({
        page: page
      })
      that.getWechatLive('scrolltobottom')
    } else {
      toast: {
        app.wxToast({
          title: '没有更多数据'
        })
      };
    }
  }, 
  getData() {
    http.liveBanner({ // 调用接口，传入参数
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        this.setData({
          liveBanner: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getLiveHotsale() {
    http.liveHotSale({ // 调用接口，传入参数
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        this.setData({
          liveHotsale: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getWechatLive: function (type){
    let that = this
    http.getwechatlive({ // 调用接口，传入参数
      data: {
        page: that.data.wxLivePage
      },
      success: res => {
        if (type == 'scrolltobottom') {
          var arr1 = that.data.wechatLiveList
          var arr2 = res.data
          arr1 = arr1.concat(arr2)
          that.setData({
            wechatLiveList: arr1
          })
          if (res.data.length == 0) {
            that.setData({
              hasMoreData: false,
              toBottom: true
            })
          }
        } else {
          that.setData({
            wechatLiveList: res.data
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  gowxLive: function (e){
    let that = this;
    let item = e.currentTarget.dataset.item;
    let roomId = item.roomid;
    let title = item.name;
    let cover = item.cover_img;
    let start_time = item.start_time;
    let pid = wx.getStorageSync('hdt_userInfo').id;
    // let customParams = { pid: pid }
    if (!loginCheck.toLoginCheck()) {
      return false
    } else {
      wx.navigateTo({
        url: '/pages/wxShare/wxShare?roomId=' + roomId + "&pid=" + pid,
      })
    }
  },
  toGoodsInfo(e){
    let that = this
    let goodsId = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?goodsId=' + goodsId
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
  goSearch(){
    wx.navigateTo({
      url: '/pages/liveSearch/liveSearch',
    })
  }
})