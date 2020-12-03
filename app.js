//app.js
let livePlayer = requirePlugin('live-player-plugin');
import http from 'utils/api';
import wxToast from 'toast/toast.js'; 
App({
  wxToast,
  onShow(options) {
    // 分享卡片入口场景才调用getShareParams接口获取以下参数
    if (options.scene == 1007 || options.scene == 1008 || options.scene == 1044) {
      livePlayer.getShareParams()
        .then(res => {
          console.log('get room id', res.room_id) // 房间号
          console.log('get openid', res.openid) // 用户openid
          console.log('get share openid', res.share_openid) // 分享者openid，分享卡片进入场景才有
          console.log('get custom params', res.custom_params.pid) // 开发者在跳转进入直播间页面时，页面路径上携带的自定义参数，这里传回给开发者       
          wx.setStorage({
            key: 'pid',
            data: res.custom_params.pid,
          })
        }).catch(err => {
          console.log('get share params', err)
        })
    }
    if(options.scene == 1007 || options.scene == 1008 || options.scene == 1044 || options.scene == 1011 || options.scene == 1012 || options.scene == 1014 || options.scene == 1036 || options.scene == 1047 || options.scene == 1048 || options.scene == 1049){
        // if(!loginCheck.toLoginCheck()){
        //   return false
        // }else{
        //   console.log('分享二维码进入已登录')
        // }
        http.userInfo({
          data:{},
          success: res => {
            
          },
          fail: err => {
            console.log(err)
          }
        })
    }
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
       // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if(res.code){
          // wx.request({
          //   url:"http://192.168.31.183/api/user/wechatLogin",
          //   data:{
          //     js_code: res.code
          //   },
          //   success: res => {
          //     console.log('接口请求成功', res)
              
          //   },
          //   fail: err => {
          //     console.log(err)
          //   }
          // })
        }else{
          console.log('登陆失败' + res.errMsg)
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log('userinfo' + JSON.stringify(res.userInfo))
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.mobileInfo = res
      }
    })
    this.autoUpdate()
  },
  autoUpdate: function () {
    var self = this
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      //1. 检查小程序是否有新版本发布
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          //2. 小程序有新版本，则静默下载新版本，做好更新准备
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  //3. 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                } else if (res.cancel) {
                  //如果需要强制更新，则给出二次弹窗，如果不需要，则这里的代码都可以删掉了
                  wx.showModal({
                    title: '温馨提示~',
                    content: '本次版本更新涉及到新的功能添加，旧版本无法正常访问的哦~',
                    success: function (res) {
                      self.autoUpdate()
                      return
                      //第二次提示后，强制更新                      
                      if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                      } else if (res.cancel) {
                        //重新回到版本更新提示
                        self.autoUpdate()
                      }
                    }
                  })
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  globalData: {
    userInfo: null,
    mobileInfo: null,
    upUrl:'https://hdt.hdtapp.com/',
    cdnUrl:'http://cdn.hdtapp.com/'
  }
})