// pages/orderAnchor/orderAnchor.js
let utils = require('../../utils/util.js');
import http from '../../utils/api';
const app = getApp();
Page({

  data: {
    room: {},
    live_time:'',
    end_time:'',
    isOrder: true,
    bgImg:''
  },

  onLoad: function (options) {
    let that = this
    let room = JSON.parse(decodeURIComponent(options.room))
    that.setData({
      room: room,
      bgImg: room.cover
    })
    let live_time = utils.formatTime(that.data.room.livetime * 1000, 'Y/M/D h:m:s')
    let end_time = utils.formatTime(that.data.room.endtime * 1000, 'Y/M/D h:m:s')
    that.setData({
      live_time: live_time,
      end_time: end_time
    })
    that.countDown()
  },
  countDown: function () {
    let that = this;
    let nowTime = new Date().getTime();
    let endTime = new Date(that.data.live_time).getTime();
    let time = (endTime - nowTime)/1000;
    let day = parseInt(time / (60 * 60 * 24));
    let hou = parseInt(time % (60 * 60 * 24) / 3600);
    let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
    let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
    day = that.timeFormin(day);
    hou = that.timeFormin(hou);
    min = that.timeFormin(min);
    sec = that.timeFormin(sec);
    that.setData({
      day: that.timeFormat(day),
      hou: that.timeFormat(hou),
      min: that.timeFormat(min),
      sec: that.timeFormat(sec)
    })
    if (time > 0) {
      that.setData({
        countDown: true
      })
      setTimeout(this.countDown, 1000);
    } else {
      that.setData({
        countDown: false
      })
    }
  },
  //小于10的格式化函数（2变成02）
  timeFormat(param) {
    return param < 10 ? '0' + param : param;
  },
  //小于0的格式化函数（不会出现负数）
  timeFormin(param) {
    return param < 0 ? 0 : param;
  },
  immediatelyOrder: function () {
    let that = this
    http.liveBooking({
      data: {
        room_id: that.data.room.id,
        anchor_id: that.data.room.anchor_id
      },
      success: res => {
        console.log('接口请求成功', res)
        toast: {
          //调用
          app.wxToast({
            title: res.msg
          })
        };
        that.setData({
          isOrder: false
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  cancelOrder: function () {
    let that = this
    http.liveCancelBooking({
      data: {
        room_id: that.data.room.id,
        anchor_id: that.data.room.anchor_id
      },
      success: res => {
        console.log('接口请求成功', res)
        toast: {
          //调用
          app.wxToast({
            title: res.msg
          })
        };
        that.setData({
          isOrder: true
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  goBack: function () {
    wx.navigateBack({
      delta: 1
    })
  }
})