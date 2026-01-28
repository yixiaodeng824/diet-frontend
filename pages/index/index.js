// pages/index/index.js
Page({
  data: {
    userInfo: null
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    this.setData({
      userInfo: userInfo
    });
  },

  // 跳转到拍照分析页面
  goToAnalysis() {
    wx.navigateTo({
      url: '/pages/analysis/analysis'
    });
  },

  // 跳转到推荐页面
  goToRecommendation() {
    if (!this.data.userInfo || !this.data.userInfo.goal) {
      wx.showToast({
        title: '请先完善个人信息',
        icon: 'none'
      });
      wx.switchTab({
        url: '/pages/profile/profile'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/recommendation/recommendation'
    });
  }
})