// 图片合成插件
export default class ImgMerge {
  constructor(imgs = [], options) {
    // 图片数组默认配置项
    let defaultImgsItem = {
      url: '',
      x: 0,
      y: 0,
      w: 0,
      h: 0
    };
    // 导出图片的格式与压缩程度默认配置项
    let defaultOpts = {
      type: 'image/jpeg',
      compress: 1
    };
    try {
      imgs.forEach((item, i, arr) => {
        arr[i] = Object.assign({}, defaultImgsItem, item)
      });
    } catch (e) {
      throw '请传入一个正确的对象数组作为参数';
    }
    this.ctx = null
    this.canvas = null
    this.imgList = []
    this.imgs = imgs; // 图片数组配置项
    this.opts = Object.assign({}, defaultOpts, options); // 其他配置项
    this.imgObjs = []; // 图片对象数组
    return this.createCanvas(); // 创建画布
  }

  // 创建画布
  createCanvas() {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery()
      query.select('#myCanvas')
        .fields({
          id: true,
          node: true,
          size: true
        })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          let w = this.imgs[0].w,
            h = this.imgs[0].h
          if (!w) {
            throw Error('第一张图片宽度未设置')
          }
          if (!h) {
            throw Error('第一张图片高度未设置')
          }
          canvas.width = w
          canvas.height = h
          this.canvas = canvas
          this.ctx = ctx
          resolve(this.outputImg()) // 导出图片
        });
    })
  }
  // 绘制图片
  drawImg(i) {
    let img = this.canvas.createImage();
    img.src = this.imgs[i].url;
    this.imgObjs.push(img);
    return new Promise((resolve) => {
      img.onload = resolve;
    });
  }
  // 导出图片
  outputImg() {
    let imgArr = [];
    // 将单张图片的Promise对象存入数组
    this.imgs.forEach((item, i) => {
      imgArr.push(this.drawImg(i));
    });
    // 所有图片加载成功后将图片绘制于Canvas中，后将Canvas导出为图片
    return Promise.all(imgArr).then(() => {
      this.imgs.forEach((item, i) => {
        let drawPara = [this.imgObjs[i]];
        // 此处判断参数中图片是否设置了宽高，若宽高均设置，则绘制已设置的宽高，否则按照图片默认宽高绘制
        if (this.imgs[i].w && this.imgs[i].h) {
          drawPara.push(this.imgs[i].x, this.imgs[i].y, this.imgs[i].w, this.imgs[i].h);
        }
        this.ctx.drawImage(...drawPara);
      });
      this.ctx.font = 'normal normal bold 14px Arial'
      this.ctx.fillStyle = "white"
      let text = this.ctx.measureText(this.opts.nickname)
      let textW = text.width
      let width = this.ctx.canvas.width - textW - 28
      this.ctx.fillText(this.opts.nickname, width, this.imgs[1].y - 10)
      // 以base64格式导出图片
      return Promise.resolve(this.ctx.canvas.toDataURL(this.opts.type), this.opts.compress);
    });
  }
}