// pages/submintImmediately/submintImmediately.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({
  data: {
    serverOrder:{},
    technician_name: '',
    technician_id: '',
    technician_position: '',
    dateInfo: '',
    lon: '',
    lat: '',
    remarks: '',
    lessonMember: {},
    member_id: ''
  },
  onLoad: function (options) {
    let that = this
    let params = JSON.parse(options.params)
    that.setData({
      serverOrder: params.serverOrder,
      technician_name: params.technician_name,
      technician_id: params.technician_id,
      technician_position: params.technician_position,
      dateInfo: params.dateInfo,
      lon: params.lon,
      lat: params.lat
    })
    that.getLessonMemberLists()
  },
  go_update(){
    this.getLessonMemberLists()
  },
  call(){
    let that = this
    wx.getSystemInfo({
      success:function(res){
        if(res.platform == "devtools"){
          wx.showActionSheet({
            itemList: [that.data.serverOrder.shops.phone,'呼叫'],
            success:function(res){
              if(res.tapIndex==1){
                wx.makePhoneCall({
                  phoneNumber: that.data.serverOrder.shops.phone
                })
              }
            }
          })
        }else if(res.platform == "ios"){
          wx.makePhoneCall({
            phoneNumber: that.data.serverOrder.shops.phone
          })
        }else if(res.platform == "android"){
          wx.showActionSheet({
            itemList: [that.data.serverOrder.shops.phone,'呼叫'],
            success:function(res){
              if(res.tapIndex==1){
                wx.makePhoneCall({
                  phoneNumber: that.data.serverOrder.shops.phone
                })
              }
            }
          })
        }
      }
    })
  },
  updatePersonMsg(){
    wx.navigateTo({
      url: '/pages/personMsgList/personMsgList',
    })
  },
  updateValue(e){
    let that = this
    that.setData({
      remarks: e.detail.value
    })
  },
  getLessonMemberLists: function () {
    let that = this
    http.lessonMemberLists({
      data: {},
      success: res => {
        res.data.list.forEach(function(ele, index) {
          if (ele.isdefault == 1) {
              that.data.lessonMember = ele
              that.data.member_id = ele.member_id
              that.setData({
                lessonMember: that.data.lessonMember,
                member_id: that.data.member_id
              }) 
          }
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  submit(){
    let that = this
    wx.showLoading({
      title: "正在调起支付···",
      mask: true
    })
    var json = {
      store_server_id: that.data.serverOrder.goods.id,
      tec_id: that.data.technician_id,
      date: that.data.dateInfo.day,
      arrive_time: that.data.dateInfo.time,
      remarks: that.data.remarks,
      member_id: that.data.member_id,
      longitude: that.data.lon,
      latitude: that.data.lat
    }
    http.userCommitServerOrder({
      data: json,
      success: res => {
        if(res.code == 1){
          that.payOrder(res.data)
        }else{
          wx.hideLoading()
          toast: {
            app.wxToast({
              title:res.msg
            })
          }
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  payOrder(data){
    let that = this
    // wx.navigateTo({
    //   url: '/pages/immediatelySuccess/immediatelySuccess?order_num=' + data + '&lessonMember=' + JSON.stringify(that.data.lessonMember) + '&dateInfo=' + JSON.stringify(that.data.dateInfo) + '&serverOrder=' + JSON.stringify(that.data.serverOrder),
    // })
    var json = {
      order_num: data,
      type: 'miniapp'
    }
    http.ds_order_pay({
      data: json,
      success: res => {
        wx.hideLoading()
        if(res.code == 1){
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            success: function (res) {
              toast: {
                app.wxToast({
                  title: '支付成功'
                })
              };
              wx.navigateTo({
                url: '/pages/immediatelySuccess/immediatelySuccess?order_num=' + data + '&lessonMember=' + JSON.stringify(that.data.lessonMember) + '&dateInfo=' + JSON.stringify(that.data.dateInfo) + '&serverOrder=' + JSON.stringify(that.data.serverOrder),
              })
            },
            fail: function (err) {
              toast: {
                app.wxToast({
                  title: '支付失败'
                })
              };
            }
          })
        }else{
          toast: {
            app.wxToast({
              title:'支付失败'
            })
          }
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})