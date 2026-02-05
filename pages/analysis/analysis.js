// pages/analysis/analysis.js
Page({
  data: {
    imageUrl: '',
    analysisResult: null,
    isLoading: false
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({ imageUrl: tempFilePath });
        this.uploadImage(tempFilePath);
      }
    });
  },

  // 上传图片到后端
// 上传图片到后端
  async uploadImage(filePath) {
    this.setData({ isLoading: true });
    try {
      wx.showLoading({ title: '分析中...' });
      const uploadRes = await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: getApp().globalData.baseUrl + '/detect',
          filePath: filePath,
          name: 'image',
          success: resolve,
          fail: reject
        });
      });
      const result = JSON.parse(uploadRes.data);
      if (result.success) {
        // 这里 result.data 是数组
        this.setData({
          analysisResult: result.data,
          isLoading: false
        });
        wx.hideLoading();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('分析失败:', error);
      this.setData({ isLoading: false });
      wx.hideLoading();
      wx.showToast({
        title: '分析失败，请重试',
        icon: 'none'
      });
    }
  },
  saveToTodayRecord() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    const food = this.data.analysisResult;
    if (!food) return;
  
    wx.showLoading({ title: '保存中...' });
    app.request('/record/add', {
      user_id: userInfo.name || 'default',
      foods: [{
        name: food.foodName,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat
      }]
    }).then(res => {
      wx.hideLoading();
      wx.showToast({ title: '已保存到今日饮食', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },
  saveToTodayRecord() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    const foods = this.data.analysisResult;
    if (!foods || !foods.length) return;

    wx.showLoading({ title: '保存中...' });
    app.request('/record/add', {
      user_id: userInfo.name || 'default',
      foods: foods.map(food => ({
        name: food.foodName,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat
      }))
    }).then(res => {
      wx.hideLoading();
      wx.showToast({ title: '已保存到今日饮食', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },

  // 其他生命周期函数保持不变
  onLoad(options) {},
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})