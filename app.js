// app.js
App({
  onLaunch() {
    // 小程序启动时，尝试从本地缓存读取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  // 全局数据，所有页面都可以访问
  globalData: {
    userInfo: null // 存储用户信息 {name, height, weight, goal}
  },

  // 保存用户信息到全局数据和本地缓存
  saveUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo); // 持久化存储
  }
})