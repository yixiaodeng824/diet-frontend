// app.js
App({
  onLaunch() {
    // 小程序启动时从本地缓存读取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  // 全局数据
  globalData: {
    userInfo: null,
    baseUrl: 'http://192.168.18.66:5000/api' // 替换为你的Flask服务器地址
  },

  // 保存用户信息方法
  saveUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  // 统一的网络请求方法
  request(url, data = {}, method = 'POST') {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.baseUrl + url,
        data: data,
        method: method,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
})