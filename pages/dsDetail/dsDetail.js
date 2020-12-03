// pages/dsDetail/dsDetail.js
import http from '../../utils/api';
let loginCheck = require('../../utils/loginCheck');
const app = getApp();
let proListToTop = [0], menuToTop = [], MENU = 0, windowHeight, timeoutId;
Page({
  heightArr: [],
  distance: 0,
  data: {
    leftMenuH:'',
    currentActiveIndex: 0,
    rightProTop:'',
    store_id: '',
    hideModal: true,
    hideModal1: true,
    animationData: {},
    goodsInfo:{},
    buyInfo: {
      user_id: '',
      store_product_id: '',
      quantity: 1
    },
    userInfo:{},
    lat:"",
    lon:"",
    dsStoreCart:{},
    isSelected: false,
    ds_detail:{},
    poster: '',
    dsProductList: [],
    dataType: '1',
    tabArray: [{
      title: '在售产品',
      dataType: '1'
    },{
      title: '店内服务',
      dataType: '2'
    }],
    type: 1,
    subTabArray: [{
      name: 'spa',
      id: '1'
    },{
      name: 'psa',
      id: '2'
    }],
    category_list: [],
    technicianList: [],
    server_list: [],
    showModel1: false,
    projectInfo: {},
    scrollLeft: 0,
    tabWidth: 0
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
        store_id: getQueryString['store_id']
      })
      wx.setStorage({
        key: 'pid',
        data: getQueryString['pid']
      })
    } else {
      that.setData({
        store_id: options.store_id,
        dataType: options.dataType
      })
      wx.setStorage({
        key: 'pid',
        data: options.pid || ''
      })
    }
    this.setData({
      leftMenuH: wx.getSystemInfoSync().windowHeight*2 - 100 - 100
    })
    that.getProductType()
    that.getProductDetail()
    that.getCategoryList()
    that.getTechnicianList()
    that.getServerList()
    if(!wx.getStorageSync('hdt_userInfo') || wx.getStorageSync('hdt_userInfo').token == ''){
      
    }else{
      that.getUserInfo()
    }
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({
          lat: latitude,
          lon: longitude
        })
        that.getStoreMsg()
      }
    })
  },
  onShow: function () {
    let that = this
    that.getStoreIndex()
  },
  onUnload: function (){
    let pages = getCurrentPages();
    let beforePage = pages[pages.length - 2];
    beforePage.setData({
      txt: '修改数据了'
    })
    beforePage.go_update();
  },
  onShareAppMessage: function () {
    return {
      title: this.data.ds_detail.name, 
      path: '/pages/dsDetail/dsDetail?store_id=' + this.data.store_id + '&pid=' + this.data.userInfo.id,
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
  getCategoryList(){
    let that = this
    http.server_category_list({
      data: {},
      success: res => {
        that.setData({
          subTabArray: res.data
        })
        if(res.data && res.data.length != 0){
          that.setData({
            type: res.data[0].id
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getTechnicianList(){
    let that = this
    http.technician_list({
      data: {
        store_id: that.data.store_id || '7'
      },
      success: res => {
        that.setData({
          technicianList: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getServerList(){
    let that = this
    http.server_list({
      data: {
        store_id: that.data.store_id || '7',
        type: that.data.type
      },
      success: res => {
        that.setData({
          server_list: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  tabS(e){
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      dataType: item.dataType
    })
  },
  typeS(e) {
    let that = this
    let item = e.currentTarget.dataset.item
    let index = e.currentTarget.dataset.index
    that.setData({
      type: item.id
    })
    var query = wx.createSelectorQuery();
    setTimeout(function(){
      query.select('.gs_tabs1 .gs_t_item').boundingClientRect(function (rect) {
        that.setData({
          tabWidth: rect.width
        })
        
      }).exec();
    },200)
    if(index > 1 && index < (that.data.subTabArray.length - 2)){
      that.setData({
        scrollLeft:that.data.tabWidth * (index - 2)
      })
    }else if(index < 2){
      that.setData({
        scrollLeft:0
      })
    }else{
      that.setData({
        scrollLeft:that.data.tabWidth * index
      })
    }
    that.getServerList()
  },
  reserveProduct(e){
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      showModel1: true,
      projectInfo: item
    })
  },
  goImmediately(){
    let that = this
    if(!loginCheck.toLoginCheck()){
      return false
    }
    http.userPreServerOrder({
      data: {
        store_server_id: that.data.projectInfo.id || '7',
        longitude: that.data.lon,
        latitude: that.data.lat
      },
      success: res => {
        if(res.code == 1){
          wx.navigateTo({
            url: '/pages/immediatelyService/immediatelyService?serverOrder=' + encodeURIComponent(JSON.stringify(res.data[0])) + '&lon=' + that.data.lon + '&lat=' + that.data.lat,
          })
        }else{
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
    // wx.navigateTo({
    //   url: '/pages/immediatelyService/immediatelyService',
    // })
  },
  getUserInfo: function () {
    let that = this
    http.userInfo({
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          "buyInfo.user_id": res.data.id,
          userInfo: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  goSearch: function () {
    let that = this
    wx.navigateTo({
      url: '/packageA/pages/goodsSearch/goodsSearch?currentType=0&from=dsDetail&store_id=' + that.data.store_id,
    })
  },
  navigation(){
    let that = this
    wx.openLocation({
      latitude: parseFloat(that.data.ds_detail.latitude),
      longitude: parseFloat(that.data.ds_detail.longitude),
      name: that.data.ds_detail.name,
      scale: 10,
      address: that.data.ds_detail.address,
      success:function(r){
        console.log(r)
      },
      fail:function(err){
        console.log(err)
      }
    })  
  },
  call(){
    let that = this
    wx.getSystemInfo({
      success:function(res){
        if(res.platform == "devtools"){
          wx.showActionSheet({
            itemList: [that.data.ds_detail.phone,'呼叫'],
            success:function(res){
              if(res.tapIndex==1){
                wx.makePhoneCall({
                  phoneNumber: that.data.ds_detail.phone,
                })
              }
            }
          })
        }else if(res.platform == "ios"){
          wx.makePhoneCall({
            phoneNumber: that.data.ds_detail.phone,
          })
        }else if(res.platform == "android"){
          wx.showActionSheet({
            itemList: [that.data.ds_detail.phone,'呼叫'],
            success:function(res){
              if(res.tapIndex==1){
                wx.makePhoneCall({
                  phoneNumber: that.data.ds_detail.phone,
                })
              }
            }
          })
        }
      }
    })
  },
  getStoreMsg(){
    let that = this
    http.ds_store({
      data: {
        store_id: that.data.store_id || 7,
        latitude: that.data.lat,
        longitude: that.data.lon
      },
      success: res => {
        that.setData({
          ds_detail: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getStoreIndex(){
    let that = this
    http.ds_storeindex({ // 调用接口，传入参数
      data: {
        store_id:that.data.store_id || 7
      },
      success: res => {
        this.setData({
          dsStoreCart: res.data
        })
        if (that.data.dsStoreCart) {
          that.setData({
            isSelected: true
          })
        }else {
          that.setData({
            isSelected: false
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getshopDetail: function (e) {
    let that = this
    let product_id = e.currentTarget.dataset.item.id
    console.log(product_id)
    wx.navigateTo({
      url: '/pages/dsShopDetail/dsShopDetail?product_id=' + product_id + '&pageFrom=dsDetail',
    })
  },
  getProductType: function () {
    let that = this
    http.dsProductType({ // 调用接口，传入参数
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        this.setData({
          tabArraySub: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getProductDetail: function () {
    let that = this
    http.ds_product_list({ // 调用接口，传入参数
      data: {
        store_id: that.data.store_id || 7
      },
      success: res => {
        that.setData({
          dsProductList: res.data
        })
        setTimeout(function(){
          that.getAllRects();
        },200)
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  changeMenu(e) {
    // 改变左侧tab栏操作
    if (Number(e.target.id) === this.data.currentActiveIndex) return
    MENU = 1
    this.setData({
      currentActiveIndex: Number(e.target.id),
      rightProTop: proListToTop[Number(e.target.id)]
    })
    console.log(this.data.rightProTop)
    this.setMenuAnimation(Number(e.target.id))
  },
  scroll(e) {
    for (let i = 0; i < proListToTop.length; i++) {
      if (e.detail.scrollTop < proListToTop[i] && i !== 0 && e.detail.scrollTop > proListToTop[i - 1]) {
        return this.setDis(i)
      }
    }
    // 找不到匹配项，默认显示第一个数据
    if (!MENU) {
      this.setData({
        currentActiveIndex: 0
      })
    }
    MENU = 0
  },
  setDis(i) {
    // 设置左侧menu栏的选中状态
    if (i !== this.data.currentActiveIndex + 1 && !MENU) {
      this.setData({
        currentActiveIndex: i - 1
      })
    }
    MENU = 0
    this.setMenuAnimation(i)
  },
  setMenuAnimation(i) {
    // 设置动画，使menu滚动到指定位置。
    let self = this
    if (menuToTop[i]) {
      // 节流操作
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        self.setData({
          leftMenuTop: (menuToTop[i].top - windowHeight)
        })
      }, 50)
    } else {
      if (this.data.leftMenuTop === 0) return
      this.setData({
        leftMenuTop: 0
      })
    }
  },
  getActiveReacts() {
    wx.createSelectorQuery().selectAll('.menu-active').boundingClientRect(function (rects) {
      return rects[0].top
    }).exec()
  },
  getAllRects() {
    // 获取商品数组的位置信息
    wx.createSelectorQuery().selectAll('.pro-item').boundingClientRect(function (rects) {
      let height = 0;
      rects.forEach(function (rect) {
        height += rect.height;
        proListToTop.push(height)
      })
    }).exec()
    // 获取menu数组的位置信息
    wx.createSelectorQuery().selectAll('.menu-item').boundingClientRect(function (rects) {
      wx.getSystemInfo({
        success: function (res) {
          windowHeight = res.windowHeight / 2
          rects.forEach(function (rect) {
            menuToTop.push({
              top: rect.top,
              // animate:rect.top > windowHeight
            })
          })
        }
      })
    }).exec()
  },
  // 获取系统的高度信息
  getSystemInfo() {
    let self = this
    wx.getSystemInfo({
      success: function (res) {
        windowHeight = res.windowHeight / 2
      }
    })
  },
  addShop: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      goodsInfo: item,
      hideModal: false
    })
    console.log(item)
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
        hideModal: true,
        hideModal1: true
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
  changeNum: function (e) {
    let that = this;
    let type = e.currentTarget.dataset.type
    if (type == 'minus') {
      if (that.data.buyInfo.quantity == 1) {
        toast: {
          app.wxToast({
            title:'不能再少啦'
          })
        }
        return false;
      } else {
        that.data.buyInfo.quantity--
        that.setData({
          "buyInfo.quantity": that.data.buyInfo.quantity
        })
      }
    } else {
      if (that.data.buyInfo.quantity >= that.data.goodsInfo.stock) {
        toast: {
          app.wxToast({
            title: '只能买这么多了'
          })
        }
        return false;
      } else {
        that.data.buyInfo.quantity++
        that.setData({
          "buyInfo.quantity": that.data.buyInfo.quantity
        })
      }
    }
  },
  updateValue: function (e) {
    let that = this;
    let quantity = e.detail.value;
    that.setData({
      "buyInfo.quantity": quantity
    })
  },
  attrComputed: function (e) {
    let that = this
    let type = e.target.dataset.type
    if(!loginCheck.toLoginCheck()){
      return false
    }
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
      http.dsUsercartAdd({
        data: {
          quantity: that.data.buyInfo.quantity,
          user_id: that.data.userInfo.id,
          store_product_id: that.data.goodsInfo.id
        },
        success: res => {
          console.log('接口请求成功', res)
          that.getStoreIndex()
          toast: {
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
          store_product_id: that.data.goodsInfo.id,
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
  },
  buy(){
    let that = this
    let arr = [];
    for(let e of that.data.dsStoreCart.product){
      arr.push(e.user_cart_id)
    }
    var json = {
      cart_ids: arr.join(','),
      longitude: that.data.lon,
      latitude: that.data.lat
    }
    http.dsUserPreCartOrder({
      data: json,
      success: res => {
        toast: {
          app.wxToast({
            title: res.msg
          })
        };
        if(res.code == 1){
          wx.navigateTo({
            url: '/pages/dsOrderConfirm/dsOrderConfirm?cartOrder=true&goodsInfo=' + JSON.stringify(res.data)
          })
        }
       
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  cartDetail: function () {
    var that = this
    if (that.data.isSelected) {
      that.setData({
        hideModal1: false
      })
      var animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease',
      })
      this.animation = animation
      setTimeout(function () {
        that.fadeIn();
      }, 400)
    }
  },
  changeNum:function (e) {
    let that = this
    let type = e.currentTarget.dataset.type
    let item = e.currentTarget.dataset.item
    console.log(type)
    if (type == 'minus') {
      //减
      if (item.quantity == 1) {
        toast: {
          app.wxToast({
            title: '不能再减了'
          })
        };
      }else {
        var json = {
          user_id: that.data.userInfo.id,
          quantity: 1,
          store_product_id: item.store_product_id
        }
        http.dsUsercartReduce({
          data: json,
          success: res => {
            let quantity = item.quantity
            quantity--
            that.setData({
              "item.quantity": quantity
            })
          that.getStoreIndex()
          },
          fail: res => {
            console.log(err)
          }
        })
      }
    }else {
      //加
      console.log(type)
      if (item.quantity >= item.stock) {
        toast: {
          app.wxToast({
            title: '不能再加啦'
          })
        };
      }else {
        var json = {
          user_id: that.data.userInfo.id,
          quantity: 1,
          store_product_id: item.store_product_id
        }
        http.dsUsercartAdd({
          data: json,
          success: res => {
            let quantity = item.quantity
            quantity++
            that.setData({
              "item.quantity": quantity
            })
            that.getStoreIndex()
          },
          fail: res => {
            console.log(err)
          }
        })
      }
    }
  },
  clearCart: function () {
     var that = this
     var arr = [];
     for(let e of that.data.dsStoreCart.product){
       arr.push(e.user_cart_id)
     }
     var json = {
       cart_ids: arr.join(',')
     }
     http.dsUcMuldelete({
      data: json,
      success: res => {
        toast: {
          app.wxToast({
            title: res.msg
          })
        };
        that.hideModal()
        that.getStoreIndex()
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  shareApp: function () {
    let that = this
    if (!loginCheck.toLoginCheck()) {
      return false
    } else {
      that.setData({
        showModel: true,
        showModel1: false
      })
      that.getMallShare()
      wx.showLoading({								//显示 loading 提示框
        title: "正在生成海报···",
      })
    }
  },
  getMallShare: function () {
    let that = this
    http.ds_storeshare({
      data: {
        store_id : that.data.store_id ,
        pid: that.data.userInfo.id,
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
      showModel: false,
      showModel1: false
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
  goOrderList(){
    wx.navigateTo({
      url: '/pages/userOrderList/userOrderList',
    })
  }
})