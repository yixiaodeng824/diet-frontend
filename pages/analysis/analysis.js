// pages/analysis/analysis.js
Page({
  data: {
    imageUrl: '',
    isLoading: false,
    // YOLO 识别结果
    yoloResult: null,
    // DeepSeek 百科结果
    deepseekResult: null,
    // 是否已配置 DeepSeek Key（降级提示）
    deepseekUnavailable: false,
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
        this.uploadAndDetect(tempFilePath);
      }
    });
  },

  // 上传 → YOLO 识别 → DeepSeek 百科（一次性返回）
  async uploadAndDetect(filePath) {
    this.setData({
      isLoading: true,
      yoloResult: null,
      deepseekResult: null,
      deepseekUnavailable: false,
    });

    try {
      wx.showLoading({ title: '分析中...', mask: true });

      const uploadRes = await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: getApp().globalData.baseUrl + '/detect/deepseek',
          filePath: filePath,
          name: 'image',
          success: resolve,
          fail: reject,
        });
      });

      const result = JSON.parse(uploadRes.data);

      if (!result.success) {
        throw new Error(result.message || '识别失败');
      }

      this.setData({
        yoloResult: result.yolo_result,
        deepseekResult: result.deepseek_result,
        deepseekUnavailable: result.deepseek_result === null,
      });

      wx.hideLoading();

    } catch (error) {
      console.error('分析失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '分析失败，请重试', icon: 'none' });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 保存到今日饮食
  saveToTodayRecord() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    const yolo = this.data.yoloResult;
    if (!yolo) return;

    wx.showLoading({ title: '保存中...' });
    app.request('/record/add', {
      user_id: userInfo.user_id,
      foods: [{
        name: yolo.food_name,
        calories: yolo.nutrition.calories,
        protein: yolo.nutrition.protein,
        carbs: yolo.nutrition.carbs,
        fat: yolo.nutrition.fat,
      }],
    }).then(res => {
      wx.hideLoading();
      wx.showToast({ title: '已保存到今日饮食', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },

  onLoad(options) {},
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
});
