// pages/doorShop/doorShop.js
import http from '../../utils/api';
const loginCheck = require('../../utils/loginCheck');
const app = getApp();
let proListToTop = [0], menuToTop = [], MENU = 0, windowHeight, timeoutId;
Page({
  heightArr: [],
  distance: 0,
  data: {
    ds_IndexMerPic:[],
    tabArraySub:[],
    dsProductList:[],
    leftMenuH:'',
    store_id:'',
    currentActiveIndex: 0,
    rightProTop:'',
    hideModal: true, //模态框的状态  true-隐藏  false-显示
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
    showDialog: false,
    showModel: false,
    poster: "",
    dataType: '0',
    info:{},
    user_level: 0,
    goodsList:[],
    page: 1,
    hasMoreData: true,
    toBottom: false,

    bannerList:[],
    ds_stores:[],
    dsNearstores:[],
    showDialog1: false,
    lat:"",
    lon:"",
    keyword: '',
    showDialog2: false,
    isScroll: false,
    isTabScroll: false,
    vip_product: []
  },

  onLoad: function (options) {
    let that = this
    this.setData({
      leftMenuH: wx.getSystemInfoSync().windowHeight
    })
    that.getDsIndexMerPic()
    that.getProductType()
    that.getDsAdmin()
    //附近门店
    that.getMerPic()
    if(!wx.getStorageSync('hdt_userInfo') || wx.getStorageSync('hdt_userInfo').token == ''){
      
    }else{
      that.getUserInfo()
    }
  },
  onShow: function (){
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({
          lat: latitude,
          lon: longitude
        })
        if(that.data.dataType == 1){
          that.getDsStoresList()
        }
      }
    })
  },
  onPullDownRefresh(){
    let that = this
    if(that.data.dataType == 1){
      that.getMerPic()
      that.getDsStoresList()
      that.getNearStores()
    }else{
      that.getDsAdmin()
      that.getDsIndexMerPic()
      that.getProductType()
    }
    wx.stopPullDownRefresh()
  },
  onPageScroll: function (e) {
    let that = this
    if(that.data.dataType == 0){
      let query = wx.createSelectorQuery()
      query.select('.pro-container').boundingClientRect( (rect) => {
          let top = Math.floor(rect.top)
          if (top <= 0) {  
            that.setData({
              isScroll: true,
              isTabScroll: true
            })
          } else {
            that.setData({
              isScroll: false,
              isTabScroll: false
            })
          }
      }).exec()
    }
  },
  tabS(e){
    let that = this
    let index = e.currentTarget.dataset.index
    if(this.data.dataType == index) {
      return
    }
    that.setData({
      dataType: index
    })
    if(that.data.dataType == 1){
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
            that.setData({
              showDialog2: true
            })
          } else {
            
          }
        },
      })
      that.setData({
        page: 1,
        hasMoreData: true
      })
      that.getNearStores()
      that.getDsStoresList()
    }
  },
  getInfo: function () {
    let that = this
    http.mallHome({ // 调用接口，传入参数
      data: {},
      success: res => {
        that.setData({
          info: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  toGoodsInfo: function (e) {
    let that = this
    let goodsId = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?goodsId=' + goodsId
    })
  },
  onReachBottom: function () {
    var that = this
    if(that.data.dataType == 1){
      if (that.data.hasMoreData) {
        var page = that.data.page + 1
        that.setData({
          page: page
        })
        that.getDsStoresList('scrolltobottom')
      } else {
        toast: {
          app.wxToast({
            title: '没有更多数据'
          })
        };
      }
    }
    
  }, 
  getUserInfo: function () {
    let that = this
    http.userInfo({
      data: {},
      success: res => {
        that.setData({
          "buyInfo.user_id": res.data.id,
          userInfo: res.data,
          user_level: parseInt(res.data.level.level)
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getDsIndexMerPic: function () {
    let that = this
    http.dsGetIndexMerPic({ // 调用接口，传入参数
      data: {},
      success: res => {
        this.setData({
          ds_IndexMerPic: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getProductType: function () {
    let that = this
    http.dsProductType({ // 调用接口，传入参数
      data: {},
      success: res => {
        this.setData({
          tabArraySub: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getDsAdmin: function () {
    let that = this
    http.dsGetAdmin({ // 调用接口，传入参数
      data: {},
      success: res => {
        this.setData({
          store_id: res.data
        })
        that.getVipProduct()
        that.getProductDetail()
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getVipProduct(){
    let that = this
    http.vip_product({ // 调用接口，传入参数
      data: {
        store_id: that.data.store_id
      },
      success: res => {
        that.setData({
          vip_product: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getProductDetail: function () {
    let that = this
    http.dsProductList({ // 调用接口，传入参数
      data: {
        store_id: that.data.store_id
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
    if(!this.data.isScroll) {
      this.setData({
        isScroll: true,
      })
    }
    // 改变左侧tab栏操作
    if (Number(e.target.id) === this.data.currentActiveIndex) return
    MENU = 1
    this.setData({
      currentActiveIndex: Number(e.target.id),
      rightProTop: proListToTop[Number(e.target.id)]
    })
    this.setMenuAnimation(Number(e.target.id))
  },
  scroll(e) {
    if(!this.data.isTabScroll){
      this.setData({
        isScroll: false
      })
    }
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
  getshopDetail: function (e) {
    let that = this
    let product_id = e.currentTarget.dataset.item.id
    console.log(product_id)
    wx.navigateTo({
      url: '/pages/dsShopDetail/dsShopDetail?product_id=' + product_id + '&pageFrom=doorShop',
    })
  },
  addShop: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      goodsInfo: item
    })
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          that.setData({
            showDialog2: true
          })
        } else {
          that.showModel()
        }
      },
    })
    
  },
  showModel(){
    var that = this
    that.setData({
      hideModal: false
    })
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn();
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
      console.log(that.data.buyInfo)
      http.dsUsercartAdd({
        data: {
          quantity: that.data.buyInfo.quantity,
          user_id: that.data.userInfo.id,
          store_product_id: that.data.goodsInfo.id
        },
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
  downLoadApp: function () {
    let that = this;
    let appVersion = wx.getSystemInfoSync().platform;
    if (appVersion == 'android'){
      that.setData({
        downLoadUrl: that.data.serveVersion.app_downloaduri
      })
    }else{
      that.setData({
        downLoadUrl: that.data.serveVersion.app_downloaduri_ios
      })
    }
    wx.showModal({
      title: '下载APP',
      content: '请复制链接后，在浏览器粘贴后打开',
      confirmText: "复制链接",
      success : function (res) {
        if (res.cancel) {
          console.log("点击了取消按钮")
        } else {
          //点击确定
          console.log("点击了确定按钮")
          wx.setClipboardData({
            data: that.data.downLoadUrl,
            success: function (res) {
              wx.getClipboardData({
                success: function (res) {
                  wx.showToast({
                    title: '复制成功'
                  })
                }
              })
            }
          })
        }
      }
    })
  },
  goAddressList: function () {
    wx.navigateTo({
      url: '/pages/addressList/addressList',
    })
  },
  onShareAppMessage: function () {
    return {
      title: '俭单',
      path: 'pages/my/my',
      success: (res) => {
        // 分享成功
      },
      fail: (res) => {
        // 分享失败
      }
    }
  },
  shareApp: function () {
    let that = this
    if (!loginCheck.toLoginCheck()) {
      return false
    } else {
      wx.navigateTo({
        url: '/pages/shareApp/shareApp',
      })
    }
  },
  getHomeShare: function () {
    let that = this
    http.homeShare({
      data: {},
      success: res => {
        wx.hideLoading()
        that.setData({
          poster: res.data[0]
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
      showDialog1: false
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
      showDialog: false,
      showDialog2: false
    })
  },
  cancel() {
    this.setData({
      showDialog: false,
      showDialog2: false
    })
  },
  goSearch: function () {
    let that = this
    wx.navigateTo({
      url: '/packageA/pages/goodsSearch/goodsSearch?currentType=0' + '&store_id=' + that.data.store_id,
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
  // 附近门店
  go_update(){
    var that = this
    this.setData({
      showDialog1: false
    })
    that.getDsStoresList()
  },
  getMerPic: function () {
    let that = this
    http.ds_getMerPic({ // 调用接口，传入参数
      data: {},
      success: res => {
        that.setData({
          bannerList: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  navigation(e){
    let that = this
    let item = e.currentTarget.dataset.item
    wx.openLocation({
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      name: item.name,
      scale: 10,
      address: item.address,
      success:function(r){
        console.log(r)
      },
      fail:function(err){
        console.log(err)
      }
    })  
  },
  getNearStores: function (){
    let that = this
    http.ds_nearstores({ 
      data: {
        longitude: that.data.lon,
        latitude: that.data.lat
      },
      success: res => {
        that.setData({
          dsNearstores: res.data
        })
        wx.stopPullDownRefresh()
        if(res.code == 1){
          that.setData({
            showDialog1: true
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  moreDs: function (){
    let that = this
    this.setData({
      showDialog1: false,
      page: 1,
      hasMoreData: true,
      toBottom: false
    })
    that.getDsStoresList()
  },
  getDsStoresList(type){
    let that = this
    http.ds_stores({ 
      data: {
        longitude: that.data.lon,
        latitude: that.data.lat,
        name: that.data.keyword,
        page: that.data.page
      },
      success: res => {
        if (type == 'scrolltobottom') {
          var arr1 = that.data.ds_stores
          var arr2 = res.data
          arr1 = arr1.concat(arr2)
          that.setData({
            toBottom: false,
            ds_stores: arr1
          })
          if (res.data.length == 0) {
            that.setData({
              hasMoreData: false,
              toBottom: true
            })
          }
        } else {
          that.setData({
            toBottom: true,
            ds_stores: res.data
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  goDsDetail(e){
    let that = this
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/dsDetail/dsDetail?store_id=' + item.id,
    })
  },
  toInfo(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/guideInfo/guideInfo?id=' + id,
    })
  }
})