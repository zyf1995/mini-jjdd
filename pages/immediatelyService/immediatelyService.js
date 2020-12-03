// pages/immediatelyService/immediatelyService.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    serverOrder: {},
    lon: '',
    lat: '',
    technician_name: '',
    technician_id: '',
    technician_position: '',
    selectDateList: [],
    selectTimeList: [],
    day: '',
    time: '',
    week: '',
    dateList: [],
    newArr: [],
    technicianList: []
  },
  onLoad: function (options) {
    let that = this;
    let serverOrder = JSON.parse(decodeURIComponent(options.serverOrder))
    that.setData({
      serverOrder: serverOrder,
      lon: options.lon,
      lat: options.lat
    })
    that.data.selectTimeList = that.data.serverOrder.goods.choose[0].date[0].time
    that.data.time = that.data.selectTimeList[0] || ''
    that.data.selectDateList = that.data.serverOrder.goods.choose[0].date
    that.data.day = that.data.selectDateList[0].day
    that.setData({
      selectTimeList: that.data.selectTimeList,
      time: that.data.time,
      selectDateList: that.data.selectDateList,
      day: that.data.day
    })
    that.getDateList()
  },
  go_update(){
    let that = this
    that.setData({
      technician_name: that.data.technicianList.name,
      technician_id: that.data.technicianList.id,
      technician_position: that.data.technicianList.position
    })
    let newArr = []
    that.data.serverOrder.goods.choose.forEach(function (tem) {
      if(tem.message){
        newArr.push(tem)
      }
    })
    newArr.forEach(function (tem) {
      if(that.data.technician_id == tem.message.id){
        that.data.selectDateList = tem.date
        that.setData({
          selectDateList: that.data.selectDateList
        })
        that.getDateList()
      }
    })
  },
  getDateList(){
    let that = this
    let weekDay =  ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    let dd = new Date();
    let y = dd.getFullYear();
    that.data.selectDateList.forEach(function (tem) {
      tem.year = y + '-' + tem.day
      tem.week = weekDay[new Date(Date.parse(tem.year)).getDay()]
      if(loginCheck.GetDateStr(0) == tem.day){
        tem.week = '今天'
      }else if(loginCheck.GetDateStr(1) == tem.day){
        tem.week = '明天'
      }else if(loginCheck.GetDateStr(2) == tem.day){
        tem.week = '后天'
      }
      that.setData({
        "tem.week": tem.week
      })
      // let newObj = {
      //   week: tem.week,
      //   day: tem.day,
      // }
      // that.data.newArr.push(newObj)
      that.setData({
        selectDateList:　that.data.selectDateList
      })
    })
    that.data.week = that.data.selectDateList[0].week
    that.setData({
      week: that.data.week
    })
  },
  selectDate(e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      day: item.day,
      week: item.week
    })
    that.data.selectDateList.forEach(function (tem) {
      if(that.data.day == tem.day){
        that.data.selectTimeList = tem.time
        that.data.time = that.data.selectTimeList[0] || ''
        that.setData({
          selectTimeList: that.data.selectTimeList,
          time: that.data.time
        })
      }
    })
  },
  selectTime(e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      time: item
    })
  },
  selectTechnician(){
    let that = this
    wx.navigateTo({
      url: '/pages/technicianList/technicianList?store_id=' + that.data.serverOrder.shops.id,
    })
  },
  nextStep(){
    let that = this
    if(!that.data.technician_name){
      toastoast: {
        app.wxToast({
          title:'请您先选择技师'
        })
      }
      return false
    }
    if(!that.data.day || !that.data.time){
      toast: {
        app.wxToast({
          title:'请您先预约服务时间'
        })
      }
      return false
    }
    let dateInfo = {
      day: that.data.day,
      week: that.data.week,
      time: that.data.time
    }
    let params = {
      serverOrder: that.data.serverOrder,
      technician_name: that.data.technician_name,
      technician_id: that.data.technician_id,
      technician_position: that.data.technician_position,
      dateInfo: dateInfo,
      lon: that.data.lon,
      lat: that.data.lat
    } 
    wx.navigateTo({
      url: '/pages/submintImmediately/submintImmediately?params=' + JSON.stringify(params),
    })
  }
})