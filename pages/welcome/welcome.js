// pages/welcome/welcome.js
Page({
  data: {
    userName: ''
  },

  // 监听输入框输入
  onNameInput(e) {
    this.setData({
      userName: e.detail.value
    });
  },

  // 进入应用
  enterApp() {
    if (!this.data.userName.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    // 1. 保存用户信息到全局
    const app = getApp();
    const userInfo = {
      name: this.data.userName,
      height: null,
      weight: null, 
      goal: null // 目标：'gain'增肌 / 'lose'减脂 / 'maintain'维持
    };
    app.saveUserInfo(userInfo);

    // 2. 跳转到主页面
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})