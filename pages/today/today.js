// pages/today/today.js
Page({
  data: {
    records: [],
    nutritionSum: {},
    isLoading: false
  },
  onLoad() {
    this.loadTodayRecords();
  },
  loadTodayRecords() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    this.setData({ isLoading: true });
    app.request('/record/today?user_id=' + (userInfo.name || 'default'), {}, 'GET')
      .then(res => {
        if (res.success) {
          // 格式化总览数据
          const sum = res.nutrition_sum || {};
          const nutritionSum = {
            calories: sum.calories ? Number(sum.calories).toFixed(1) : '0.0',
            protein: sum.protein ? Number(sum.protein).toFixed(1) : '0.0',
            carbs: sum.carbs ? Number(sum.carbs).toFixed(1) : '0.0',
            fat: sum.fat ? Number(sum.fat).toFixed(1) : '0.0'
          };
          this.setData({
            records: res.records,
            nutritionSum,
            isLoading: false
          });
        } else {
          this.setData({ isLoading: false });
        }
      })
      .catch(() => {
        this.setData({ isLoading: false });
      });
  },
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条进食记录吗？',
      success: (res) => {
        if (res.confirm) {
          app.request('/record/delete', { id }).then(resp => {
            if (resp.success) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.loadTodayRecords();
            } else {
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  }
});