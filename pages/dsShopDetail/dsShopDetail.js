// pages/dsShopDetail/dsShopDetail.js
import http from '../../utils/api';
let wxparse = require("../../wxParse/wxParse.js");
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
Page({

  data: {
    goodsInfo: {},
    userInfo: {},
    current: 0,
    hideModal: true, //模态框的状态  true-隐藏  false-显示
    animationData: {},
    buyInfo: {
      user_id: '',
      store_product_id: '',
      quantity: 1
    },
    handle: 'buy',
    lon: '',
    lat: '',
    product_id:"",
    poster:"",
    pageFrom: ''
  },

  onLoad: function (options) {
    let that = this
    if (options.scene) {
      let getQueryString = {}
      let strs = decodeURIComponent(options.scene).split('&')
      for (var i = 0; i < strs.length; i++) {
        getQueryString[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
      }
      that.setData({
        product_id: getQueryString['product_id'],
        pageFrom: 'doorShop'
      })
      wx.setStorage({
        key: 'pid',
        data: getQueryString['pid']
      })
    } else {
      that.setData({
        product_id: options.product_id,
        pageFrom: options.pageFrom
      })
      wx.setStorage({
        key: 'pid',
        data: options.pid || ''
      })
    }
    console.log(that.data.pageFrom)
    that.getshopInfo()
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({ 
          lat: latitude, 
          lon: longitude 
        })
      }
    })
  },
  onShareAppMessage: function () {
    console.log(this.data.product_id)
    return {
      title: this.data.goodsInfo.product_name, //转发页面的标题
      path: '/pages/dsShopDetail/dsShopDetail?product_id=' + this.data.product_id + '&pid=' + this.data.userInfo.id,
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  },
  shareFriend: function () {
    let that = this
    if (!loginCheck.toLoginCheck()) {
      return false
    } else {
      that.setData({
        showModel: true
      })
      that.getMallShare()
      wx.showLoading({								//显示 loading 提示框
        title: "正在生成海报···",
      })
    }
  },
  getMallShare: function () {
    let that = this
    http.goodsShare({
      data: {
        goods_id: '',
        product_id: that.data.product_id,
        pid: that.data.userInfo.id,
        type: 2
      },
      success: res => {
        wx.hideLoading()
        that.setData({
          poster: res.data.url
        })
        console.log(that.data.poster)
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  preventTouchMove: function () {
    this.setData({
      showModel: false
    })
  },
  share: function () {
    wx.showLoading({
      title: "正在下载···",
    })
    this.wxToPromise('downloadFile', {
      url: this.data.poster
    })
      .then(res => this.wxToPromise('saveImageToPhotosAlbum', {
        filePath: res.tempFilePath
      }))
      .then(res => {
        console.log(res);
        wx.hideLoading()
        wx.showToast({
          title: '保存成功~',
          icon: 'success',
        });
      })
      .catch(({ errMsg }) => {
        console.log(errMsg)
        wx.hideLoading()
        // if (~errMsg.indexOf('cancel')) return;
        if (!~errMsg.indexOf('auth')) {
          wx.showToast({ title: '图片保存失败，稍后再试', icon: 'none' });
        } else {
          // 调用授权提示弹框
          this.setData({
            showDialog: true
          })
        };
      })
  },
  wxToPromise(method, opt) {
    return new Promise((resolve, reject) => {
      wx[method]({
        ...opt,
        success(res) {
          opt.success && opt.success();
          resolve(res)
        },
        fail(err) {
          opt.fail && opt.fail();
          reject(err)
        }
      })
    });
  },
  confirm() {
    this.setData({
      showDialog: false
    })
  },
  cancel() {
    this.setData({
      showDialog: false
    })
  },
  swiperChange: function (e) {
    var that = this;
    that.setData({
      current: e.detail.current
    })
  },
  previewImg: function (e) {
    let that = this
    let index = e.currentTarget.dataset.index;
    let listarray = that.data.goodsInfo.images;
    wx.previewImage({
      current: listarray[index],
      urls: listarray,
    })
  },
  getUserInfo: function () {
    let that = this
    http.userInfo({
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          userInfo: res.data,
          "buyInfo.user_id": res.data.id
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getshopInfo: function () {
    let that = this
    http.dsProductDetail({
      data: {
        product_id: that.data.product_id
      },
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          goodsInfo: res.data,
          "buyInfo.store_product_id": res.data.id
        })
        wxparse.wxParse('dkcontent', 'html', res.data.content, this, 0);
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  updateValue: function (e) {
    let that = this;
    let quantity = e.detail.value;
    that.setData({
      "buyInfo.quantity": quantity
    })
  },
  changeNum: function (e) {
    let that = this
    let type = e.target.dataset.type
    if (type == 'minus') {
      if (that.data.buyInfo.quantity == 1) {
        toast: {
          app.wxToast({
            title: '不能再少啦'
          })
        };
        return false;
      } else {
        let quantity = that.data.buyInfo.quantity
        quantity--
        that.setData({
          "buyInfo.quantity": quantity
        })
      }
    } else {
      if (that.data.buyInfo.quantity > that.data.buyInfo.stock) {
        toast: {
          app.wxToast({
            title: '只能买这么多了'
          })
        };
        return false;
      } else {
        let quantity = that.data.buyInfo.quantity
        quantity++
        that.setData({
          "buyInfo.quantity": quantity
        })
        console.log(that.data.buyInfo.quantity)
      }
    }
  },
  // 显示遮罩层
  cartPanelS: function (e) {
    var that = this;
    if (!loginCheck.toLoginCheck()) {
      return false
    }
    that.getUserInfo()
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则商品购买功能将无法正常使用',
            success: function (res) {
              if (res.cancel) {
                
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (data) {
                    if (data.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 2000
                      })  
                      that.showModel()
                      wx.getLocation({
                        type: 'wgs84',
                        success: (res) => {
                          var latitude = res.latitude
                          var longitude = res.longitude
                          that.setData({
                            lat: latitude,
                            lon: longitude
                          })
                        }
                      })
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'success',
                        duration: 2000
                      })
                    }
                  }
                })
              }
            }
          })
        } else {
          that.showModel()
        }
      },
    })
    let type = e.target.dataset.type
    that.setData({
      handle: type
    })
  },
  showModel(){
    var that = this
    that.setData({
      hideModal: false
    })
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn();//调用显示动画
    }, 400)
  },
  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown();//调用隐藏动画   
    setTimeout(function () {
      that.setData({
        hideModal: true
      })
    }, 400)//先执行下滑动画，再隐藏模块

  },

  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
  fadeDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  attrComputed: function (e) {
    let that = this
    let type = e.target.dataset.type
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    this.animation = animation
    that.fadeDown();
    setTimeout(function () {
      that.setData({
        hideModal: true
      })
    }, 400)
    if (type == 'cart') {
      console.log(that.data.buyInfo)
      http.dsUsercartAdd({
        data: that.data.buyInfo,
        success: res => {
          console.log('接口请求成功', res)
          toast: {
            //调用
            app.wxToast({
              title: res.msg
            })
          };
        },
        fail: err => {
          console.log(err)
        }
      })
    } else {
      http.dsUserPreProductOrder({
        data: {
          latitude: that.data.lat,
          longitude: that.data.lon,
          store_product_id: that.data.buyInfo.store_product_id,
          quantity: that.data.buyInfo.quantity
        },
        success: res => {
          toast: {
            app.wxToast({
              title: res.msg
            })
          };
          if(res.code == 1){
            wx.navigateTo({
              url: '/pages/dsOrderConfirm/dsOrderConfirm?cartOrder=false&goodsInfo=' + JSON.stringify(res.data)
            })
          }
        },
        fail: err => {
          console.log(err)
        }
      })
      
    }
  }
})