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
    userInfo: null
  },

  // 保存用户信息方法
  saveUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  }
})