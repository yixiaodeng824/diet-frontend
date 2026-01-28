Page({
  data: {
    currentTab: 1  // 当前选中的标签索引
  },
  
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (index === this.data.currentTab) return;
    
    this.setData({ currentTab: index });
    
    const pages = ['/pages/index/index', '/pages/profile/profile'];
    wx.switchTab({
      url: pages[index]
    });
  },
  
  onShow() {
    // 页面显示时设置当前选中的标签
    this.setData({ currentTab: 1 });
  }
})