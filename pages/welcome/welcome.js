// pages/welcome/welcome.js
Page({
  data: {
    userName: ''
  },

  onNameInput(e) {
    this.setData({
      userName: e.detail.value
    });
  },

  enterApp() {
    if (!this.data.userName.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    // 保存用户信息到全局
    const app = getApp();
    const userInfo = {
      name: this.data.userName,
      height: null,
      weight: null,
      goal: null
    };
    app.saveUserInfo(userInfo);

    // 跳转到主页面
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})