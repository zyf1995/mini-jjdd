// pages/shopCart/shopCart.js
import http from '../../utils/api';
const app = getApp();
Page({
  data: {
    list: [],
    order_total_price: 0,
    goodsChoiceList: [],
    shopChoiceList: [],
    buyList: [],
    allChoice: false,
    allGoodsNum: 0,
    allGoodsPrice: 0,
    delBtnWidth: 160,
    isScroll: true,
    windowHeight: 0,
    dsCartList: [],
    goodsChoiceList1: [],
    shopChoiceList1: [],
    selected2: true,
    selected1: true,
    lat: "",
    lon: "",
    userInfo: {},
  },
  onShow: function (options) {
    let that = this
    that.getList();
    that.initData();
    that.getDsCartList();
    that.getUserInfo();
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
  drawStart: function (e) {
    // console.log("drawStart");  
    var touch = e.touches[0]
    for (var index in this.data.list.goods) {
      var item = this.data.list.goods[index]
      item.right = 0
    }
    this.setData({
      "list.goods": this.data.list.goods,
      startX: touch.clientX,
    })

  },
  drawMove: function (e) {
    var touch = e.touches[0]
    var item = this.data.list.goods[e.currentTarget.dataset.index]
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        isScroll: false,
        "list.goods": this.data.list.goods,
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        "list.goods": this.data.list.goods,
      })
    }
  },
  drawEnd: function (e) {
    var item = this.data.list.goods[e.currentTarget.dataset.index]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        isScroll: true,
        "list.goods": this.data.list.goods,
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        "list.goods": this.data.list.goods,
      })
    }
  },
  delItem: function (e) {
    let that = this;
    let item = e.currentTarget.dataset.item;
    let type = e.currentTarget.dataset.type;
    if (type == 'store') {
      let deleteList = [];
      deleteList.push(item.user_cart_id)
      http.dsUcMuldelete({
        data: {
          cart_ids: deleteList.join(',')
        },
        success: res => {
          toast: {
            app.wxToast({
              title: res.msg
            })
          };
          that.initData();
          that.getDsCartList();
        },
        fail: err => {
          console.log(err)
        }
      })
    } else {
      let deleteList = [];
      deleteList.push(item.goods_id + '_' + item.goods_sku_id)
      http.mallCartDelete2({
        data: {
          index: deleteList
        },
        success: res => {
          toast: {
            app.wxToast({
              title: res.msg
            })
          };
          that.initData();
          that.getList();
        },
        fail: err => {
          console.log(err)
        }
      })
    }
  },
  clearStore: function (e) {
    let that = this
    let arr = [];
    let item = e.currentTarget.dataset.item
    for (let e of item.product) {
      arr.push(e.user_cart_id)
    }
    http.dsUcMuldelete({
      data: {
        cart_ids: arr.join(',')
      },
      success: res => {
        toast: {
          app.wxToast({
            title: res.msg
          })
        };
        that.setData({
          selected2: true
        })
        that.initData();
        that.getDsCartList();
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  clearShop: function (e) {
    let that = this
    let arr = [];
    let item = e.currentTarget.dataset.item
    for (let e of item.goods) {
      arr.push(e.goods_id + '_' + e.goods_sku_id)
    }
    http.mallCartDelete2({
      data: {
        index: arr
      },
      success: res => {
        toast: {
          app.wxToast({
            title: res.msg
          })
        };
        that.setData({
          selected1: true
        })
        that.initData();
        that.getList();
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getUserInfo: function (options) {
    let that = this
    http.userInfo({
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          userInfo: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  // 门店
  getDsCartList: function (options) {
    let that = this
    http.dsUsercartList({
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          dsCartList: res.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  shopsChoice1: function (e) {
    let that = this
    let store_id = e.currentTarget.dataset.storeid;
    let index = e.currentTarget.dataset.index;
    if (that.data.shopChoiceList1.indexOf(store_id) >= 0) {
      let tindex = that.data.goodsChoiceList1.indexOf(store_id);
      that.data.shopChoiceList1.splice(tindex, 1);
      that.setData({
        shopChoiceList1: that.data.shopChoiceList1,
        selected2: true
      });
      that.shopsGoods1(store_id, index);
    } else {
      that.data.shopChoiceList1.push(store_id)
      that.setData({
        shopChoiceList1: that.data.shopChoiceList1,
        selected2: false
      })
      that.shopsGoods1(store_id, index);
    };
  },
  shopsGoods1: function (store_id, index) {
    let that = this
    let item;
    for (let i in that.data.dsCartList) {
      if (i == index) {
        item = that.data.dsCartList[i];
        break;
      }
    }
    if (that.data.shopChoiceList1.indexOf(store_id) >= 0) {
      for (let e of item.product) {
        var arr = [];
        var arr1 = [];
        for (e of item.product) {
          arr1.push(e.user_cart_id);
        }
        let goodsChoiceList1 = that.distinct(that.data.goodsChoiceList1, arr1);
        that.setData({
          goodsChoiceList1: goodsChoiceList1
        })
      }
    } else {
      for (let e of item.product) {
        var tindex = that.data.goodsChoiceList1.indexOf(e.user_cart_id);
        that.data.goodsChoiceList1.splice(tindex, 1);
        that.setData({
          goodsChoiceList1: that.data.goodsChoiceList1
        });
      }
    }
    that.allNum();
  },
  goodsChoice1: function (e) {
    let that = this
    let goods_id = e.currentTarget.dataset.goodsid;
    let index = e.currentTarget.dataset.index;
    if (that.data.goodsChoiceList1.indexOf(goods_id) >= 0) {
      let tindex = that.data.goodsChoiceList1.indexOf(goods_id);
      that.data.goodsChoiceList1.splice(tindex, 1);
      that.setData({
        goodsChoiceList1: that.data.goodsChoiceList1
      });
      that.goodShops1(index);
    } else {
      that.data.goodsChoiceList1.push(goods_id);
      that.setData({
        goodsChoiceList1: that.data.goodsChoiceList1,
        selected2: false
      })
      that.goodShops1(index);
    };
    if (that.data.goodsChoiceList1.length == 0) {
      that.setData({
        selected2: true
      })
    }
  },
  goodShops1: function (index) {
    let that = this
    let item;
    let arr = [];
    for (let i in that.data.dsCartList) {
      if (i == index) {
        item = that.data.dsCartList[i];
        break;
      }
    }
    for (let e of item.product) {
      arr.push(e.user_cart_id)
    }
    if (that.isContained(that.data.goodsChoiceList1, arr)) {
      var tindex = that.data.shopChoiceList1.indexOf(item.store_id);
      if (tindex < 0) {
        that.data.shopChoiceList1.push(item.store_id);
        that.setData({
          shopChoiceList1: that.data.shopChoiceList1
        })
      }
    } else {
      var tindex = that.data.shopChoiceList1.indexOf(item.store_id);
      if (tindex >= 0) {
        that.data.shopChoiceList1.splice(tindex, 1);
        that.setData({
          shopChoiceList1: that.data.shopChoiceList1
        })
      }
    }
    // that.shopAll();
    that.allNum();
  },
  changeNum1: function (e) {
    let that = this
    let type = e.currentTarget.dataset.type
    let item = e.currentTarget.dataset.item
    if (type == 'minus') {
      if (item.quantity == 1) {
        toast: {
          app.wxToast({
            title: '不能再少啦'
          })
        };
      } else {
        http.dsUsercartReduce({
          data: {
            user_id: that.data.userInfo.id,
            quantity: 1,
            store_product_id: item.store_product_id
          },
          success: res => {
            let quantity = item.quantity
            quantity--
            that.setData({
              "item.quantity": quantity
            })
            that.getDsCartList();
            setTimeout(function () {
              that.allNum();
            }, 200)
          },
          fail: res => {
            console.log(err)
          }
        })
      }
    } else {
      if (item.quantity >= item.stock) {
        toast: {
          app.wxToast({
            title: '不能再加啦'
          })
        };
      } else {
        http.dsUsercartAdd({
          data: {
            user_id: that.data.userInfo.id,
            quantity: 1,
            store_product_id: item.store_product_id
          },
          success: res => {
            let quantity = item.quantity
            quantity++
            that.setData({
              "item.quantity": quantity
            })
            that.getDsCartList();
            setTimeout(function () {
              that.allNum();
            }, 200)
          },
          fail: res => {
            console.log(err)
          }
        })
      }
    }
  },
  //自营商城
  getList: function (options) {
    let that = this
    http.mallCartList({
      data: {},
      success: res => {
        console.log('接口请求成功', res)
        that.setData({
          list: res.data.goods_list,
          order_total_price: res.data.order_total_price
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  shopsChoice: function (e) {
    let that = this
    let shop_id = e.currentTarget.dataset.shopid;
    let index = e.currentTarget.dataset.index;
    if (that.data.shopChoiceList.indexOf(shop_id) >= 0) {
      let tindex = that.data.goodsChoiceList.indexOf(shop_id);
      that.data.shopChoiceList.splice(tindex, 1);
      that.setData({
        shopChoiceList: that.data.shopChoiceList,
        selected1: true
      });
      that.shopsGoods(shop_id, index);
    } else {
      that.data.shopChoiceList.push(shop_id)
      that.setData({
        shopChoiceList: that.data.shopChoiceList,
        selected1: false
      })
      that.shopsGoods(shop_id, index);
    };
    // that.shopAll();
  },
  shopsGoods: function (shop_id, index) {
    let that = this
    let item;
    for (let i in that.data.list) {
      if (i == index) {
        item = that.data.list[i];
        break;
      }
    }
    if (that.data.shopChoiceList.indexOf(shop_id) >= 0) {
      for (let e of item.goods) {
        var arr = [];
        var arr1 = [];
        for (e of item.goods) {
          arr.push(e.goods_spec_value);
          arr1.push(e.goods_id + '_' + e.goods_sku_id);
        }
        let goodsChoiceList = that.distinct(that.data.goodsChoiceList, arr);
        let buyList = that.distinct(that.data.buyList, arr1);
        that.setData({
          goodsChoiceList: goodsChoiceList,
          buyList: buyList
        })
        console.log(that.data.buyList)
      }
    } else {
      for (let e of item.goods) {
        var tindex = that.data.goodsChoiceList.indexOf(e.goods_spec_value);
        that.data.goodsChoiceList.splice(tindex, 1);
        that.data.buyList.splice(tindex, 1);
        that.setData({
          goodsChoiceList: that.data.goodsChoiceList,
          buyList: that.data.buyList
        });
      }
    }
    that.allNum();
  },
  // 数组去重
  distinct: function (a, b) {
    return Array.from(new Set([].concat(a, b)));
  },
  //  数组包含
  isContained: function (a, b) {
    if (!(a instanceof Array) || !(b instanceof Array)) return false;
    if (a.length < b.length) return false;
    var aStr = a.toString();
    for (let i in b) {
      if (aStr.indexOf(b[i]) < 0) return false;
    }
    return true;
  },
  goodsChoice: function (e) {
    let that = this
    let goods_spec_value = e.currentTarget.dataset.goodsid;
    let index = e.currentTarget.dataset.index;
    if (that.data.goodsChoiceList.indexOf(goods_spec_value) >= 0) {
      let tindex = that.data.goodsChoiceList.indexOf(goods_spec_value);
      that.data.goodsChoiceList.splice(tindex, 1);
      that.data.buyList.splice(tindex, 1);
      that.setData({
        goodsChoiceList: that.data.goodsChoiceList,
        buyList: that.data.buyList
      });
      that.goodShops(index);
    } else {
      that.data.goodsChoiceList.push(goods_spec_value);
      that.data.buyList.push(goods_spec_value);
      that.setData({
        goodsChoiceList: that.data.goodsChoiceList,
        buyList: that.data.buyList,
        selected1: false
      })
      that.goodShops(index);
      console.log(that.data.goodsChoiceList)
    };
    if (that.data.goodsChoiceList.length == 0) {
      that.setData({
        selected1: true
      })
    }
  },
  goodShops: function (index) {
    let that = this
    let item;
    let arr = [];
    for (let i in that.data.list) {
      if (i == index) {
        item = that.data.list[i];
        break;
      }
    }
    for (let e of item.goods) {
      arr.push(e.goods_spec_value)
    }
    if (that.isContained(that.data.goodsChoiceList, arr)) {
      var tindex = that.data.shopChoiceList.indexOf(item.shops.id);
      if (tindex < 0) {
        that.data.shopChoiceList.push(item.shops.id);
        that.setData({
          shopChoiceList: that.data.shopChoiceList
        })
      }
    } else {
      var tindex = that.data.shopChoiceList.indexOf(item.shops.id);
      if (tindex >= 0) {
        that.data.shopChoiceList.splice(tindex, 1);
        that.setData({
          shopChoiceList: that.data.shopChoiceList
        })
      }
    }
    // that.shopAll();
    that.allNum();
  },
  // all: function () {
  //   let that = this
  //   that.data.allChoice = !that.data.allChoice
  //   that.setData({
  //     allChoice: that.data.allChoice
  //   })
  //   if (!that.data.allChoice){
  //     that.data.shopChoiceList = [];
  //     that.data.goodsChoiceList = [];
  //     that.setData({
  //       shopChoiceList: that.data.shopChoiceList,
  //       goodsChoiceList: that.data.goodsChoiceList
  //     })
  //   }else{
  //     for(let i in that.data.list){
  //       if (that.data.shopChoiceList.indexOf(that.data.list[i].shops.id) < 0) {
  //         that.data.shopChoiceList.push(that.data.list[i].shops.id);
  //         that.setData({
  //           shopChoiceList: that.data.shopChoiceList
  //         })
  //         that.shopsGoods(that.data.list[i].shops.id, i);
  //       }
  //     }
  //   }
  //   that.allNum();
  // },
  // shopAll: function () {
  //   let that = this;
  //   let arr = [];
  //   for (let i of that.data.list) {
  //     arr.push(i.shops.id);
  //   }
  //   if (that.data.shopChoiceList.length == that.data.list.length) {
  //     that.setData({
  //       allChoice: true
  //     })
  //   } else {
  //     that.setData({
  //       allChoice: false
  //     })
  //   }
  // },
  allNum: function () {
    let that = this;
    let goodsIdArr = [];
    let goodsNumArr = [];
    let goodsPriceArr = [];
    let allGoodsNum = 0;
    let allGoodsPrice = 0;
    if (that.data.goodsChoiceList1.length > 0) {
      http.dsUcUserCartSum({
        data: {
          cart_ids: that.data.goodsChoiceList1.join(',')
        },
        success: res => {
          that.setData({
            allGoodsPrice: res.data
          })
        },
        fail: err => {
          console.log(err)
        }
      })
      for (let i of that.data.dsCartList) {
        for (let e of i.product) {
          goodsIdArr.push(e.user_cart_id);
          goodsNumArr.push(e.quantity.quantity);
        }
      }
      for (let s of that.data.goodsChoiceList1) {
        var tt = goodsIdArr.indexOf(s);
        if (tt >= 0) {
          allGoodsNum += parseFloat(goodsNumArr[tt]);
        }
      }
      that.setData({
        allGoodsNum: allGoodsNum
      })
    } else if (that.data.buyList.length > 0) {
      for (let i of that.data.list) {
        for (let e of i.goods) {
          goodsIdArr.push(e.goods_spec_value);
          goodsNumArr.push(e.total_num);
          goodsPriceArr.push(e.goods_price);
        }
      }
      for (let s of that.data.goodsChoiceList) {
        var tt = goodsIdArr.indexOf(s);
        if (tt >= 0) {
          allGoodsNum += parseFloat(goodsNumArr[tt]);
          allGoodsPrice += parseFloat(goodsPriceArr[tt]) * parseFloat(goodsNumArr[tt])
        }
      }
      that.setData({
        allGoodsNum: allGoodsNum,
        allGoodsPrice: allGoodsPrice
      })
    }
  },
  buy: function () {
    let that = this;
    if (that.data.buyList.length < 1 && that.data.goodsChoiceList1.length < 1) {
      toast: {
        app.wxToast({
          title: '请至少选择一件商品'
        })
      };
      return
    }
    if (that.data.selected1) {
      //门店购买
      http.dsUserPreCartOrder({
        data: {
          cart_ids: that.data.goodsChoiceList1.join(','),
          longitude: that.data.lon,
          latitude: that.data.lat
        },
        success: res => {
          toast: {
            app.wxToast({
              title: res.msg
            })
          };
          if (res.code == 1) {
            wx.navigateTo({
              url: '/pages/dsOrderConfirm/dsOrderConfirm?cartOrder=true&goodsInfo=' + JSON.stringify(res.data),
            })
          }
          setTimeout(function () {
            that.initData();
            that.getList();
          }, 800);
        },
        fail: err => {
          console.log(err)
        }
      })
    } else if (that.data.selected2) {
      //自营购买
      http.mallCartPay({
        data: {
          goodslist: that.data.buyList
        },
        success: res => {
          toast: {
            app.wxToast({
              title: res.msg
            })
          };
          let orderInfo = JSON.stringify(res.data)
          let goodslist = JSON.stringify(that.data.buyList)
          if (res.code == 1) {
            wx.navigateTo({
              url: '/pages/orderConfirm/orderConfirm?cartOrder=true&goodslist=' + goodslist + '&orderInfo=' + orderInfo,
            })
          }
          setTimeout(function () {
            that.initData();
            that.getList();
          }, 800);
        },
        fail: err => {
          console.log(err)
        }
      })
    }
  },
  initData: function () {
    let that = this;
    that.setData({
      allChoice: false,
      shopChoiceList: [],
      goodsChoiceList: [],
      shopChoiceList1: [],
      goodsChoiceList1: [],
      buyList: [],
      allGoodsNum: 0,
      allGoodsPrice: 0,
      selected1: true,
      selected2: true
    })
  },
  changeNum: function (e) {
    let that = this
    let type = e.currentTarget.dataset.type
    let item = e.currentTarget.dataset.item
    let buyInfo = {
      goods_id: item.goods_id,
      goods_num: 1,
      goods_sku_id: item.goods_sku_id
    }
    if (type == 'minus') {
      if (item.total_num == 1) {
        toast: {
          app.wxToast({
            title: '不能再少啦'
          })
        };
      } else {
        http.mallSubCart({
          data: buyInfo,
          success: res => {
            let total_num = item.total_num
            total_num--
            that.setData({
              "item.total_num": total_num
            })
            that.getList();
            setTimeout(function () {
              that.allNum();
            }, 200)
          },
          fail: res => {
            console.log(err)
          }
        })
      }
    } else {
      if (item.total_num >= item.goods_sku.stock_num) {
        toast: {
          app.wxToast({
            title: '不能再加啦'
          })
        };
      } else {
        http.mallAddCart({
          data: buyInfo,
          success: res => {
            let total_num = item.total_num
            total_num++
            that.setData({
              "item.total_num": total_num
            })
            that.getList();
            setTimeout(function () {
              that.allNum();
            }, 200)
          },
          fail: res => {
            console.log(err)
          }
        })
      }
    }
  },
  toGoodsInfo: function (e) {
    let that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?goodsId=' + id,
    })
  }
})