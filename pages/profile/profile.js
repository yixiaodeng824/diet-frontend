// pages/profile/profile.js
Page({
  data: {
    userInfo: {
      height: '',
      weight: '',
      goal: ''
    },
    bmi: '',
    bmiStatus: '',
    bmiLevel: ''
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const app = getApp();
    let globalUserInfo = app.globalData.userInfo || {};
    // 本地缓存兜底
    if (!globalUserInfo.user_id) {
      const localUserInfo = wx.getStorageSync('userInfo') || {};
      if (localUserInfo.user_id) {
        globalUserInfo = { ...globalUserInfo, user_id: localUserInfo.user_id };
        console.log('[日志] profile.js loadUserInfo: 使用本地缓存 user_id 兜底', localUserInfo.user_id);
      }
    }
    console.log('[日志] profile.js loadUserInfo: globalUserInfo', globalUserInfo);
    if (globalUserInfo.user_id) {
      app.request('/user/info', { user_id: globalUserInfo.user_id }, 'GET').then(res => {
        console.log('[日志] profile.js loadUserInfo: /user/info 返回', res);
        if (res.success) {
          const mergedUserInfo = {
            user_id: globalUserInfo.user_id,
            height: res.height || '',
            weight: res.weight || '',
            goal: res.goal || globalUserInfo.goal || ''
          };
          console.log('[日志] profile.js loadUserInfo: mergedUserInfo', mergedUserInfo);
          this.setData({ userInfo: mergedUserInfo });
          app.saveUserInfo(mergedUserInfo);
          if (res.height && res.weight) {
            this.calculateBMI();
          }
        } else {
          // 合并 user_id，防止丢失
          this.setData({
            userInfo: {
              ...globalUserInfo,
              user_id: (app.globalData.userInfo && app.globalData.userInfo.user_id) || globalUserInfo.user_id
            }
          });
          console.warn('[日志] profile.js loadUserInfo: /user/info 失败，使用 globalUserInfo', globalUserInfo);
        }
      });
    } else {
      // 只赋值一次回调，回调后立即清除
      if (!wx.$userInfoReadyCallback) {
        wx.$userInfoReadyCallback = () => {
          const app = getApp();
          const globalUserInfo = app.globalData.userInfo || {};
          console.log('[日志] profile.js userInfoReadyCallback 执行，globalUserInfo:', globalUserInfo);
          wx.$userInfoReadyCallback = null;
          // 直接 setData，确保 user_id 不丢失
          this.setData({
            userInfo: {
              ...this.data.userInfo,
              user_id: globalUserInfo.user_id
            }
          });
          // 再次尝试加载用户信息
          this.loadUserInfo();
        };
        console.warn('[日志] profile.js loadUserInfo: user_id 不存在，等待回调');
      }
    }
  },

  onHeightInput(e) {
    const height = e.detail.value;
    // 保留 user_id 字段
    this.setData({
      userInfo: {
        ...this.data.userInfo,
        height: height
      }
    });
    if (height && this.data.userInfo.weight) {
      this.calculateBMI();
    }
  },

  onWeightInput(e) {
    const weight = e.detail.value;
    // 保留 user_id 字段
    this.setData({
      userInfo: {
        ...this.data.userInfo,
        weight: weight
      }
    });
    if (weight && this.data.userInfo.height) {
      this.calculateBMI();
    }
  },

  selectGoal(e) {
    const goal = e.currentTarget.dataset.goal;
    // 保留 user_id 字段
    this.setData({
      userInfo: {
        ...this.data.userInfo,
        goal: goal
      }
    });
  },

  calculateBMI() {
    const height = parseFloat(this.data.userInfo.height);
    const weight = parseFloat(this.data.userInfo.weight);
    
    if (!height || !weight || height <= 0 || weight <= 0) return;
    
    const heightInM = height / 100;
    const bmiValue = (weight / (heightInM * heightInM)).toFixed(1);
    
    let status = '';
    let level = '';
    const bmiNum = parseFloat(bmiValue);
    
    // 根据BMI值判断状态和推荐等级
    if (bmiNum < 18.5) {
      status = '偏瘦';
      level = 'underweight'; // 偏瘦
    } else if (bmiNum < 24) {
      status = '正常';
      level = 'normal'; // 正常
    } else if (bmiNum < 28) {
      status = '超重';
      level = 'overweight'; // 超重
    } else {
      status = '肥胖';
      level = 'obese'; // 肥胖
    }
    
    this.setData({
      bmi: bmiValue,
      bmiStatus: status,
      bmiLevel: level
    });
    this.updateRecommendedGoalText();
  },

  updateRecommendedGoalText() {
    const recommendedGoal = this.getRecommendedGoal();
    let goalText = '健康维持';
    
    if (recommendedGoal === 'gain') {
      goalText = '增肌增重';
    } else if (recommendedGoal === 'lose') {
      goalText = '减脂瘦身';
    }
    
    this.setData({
      recommendedGoalText: goalText
    });
  },

 // 获取推荐目标（根据BMI）- 修正版本
getRecommendedGoal() {
  const level = this.data.bmiLevel;
  console.log('计算推荐目标，当前等级:', level);
  
  if (!level) {
    console.log('没有BMI等级，返回默认维持');
    return 'maintain';
  }
  
  if (level === 'underweight') {
    console.log('偏瘦，推荐增肌');
    return 'gain';
  } else if (level === 'overweight' || level === 'obese') {
    console.log('超重/肥胖，推荐减脂');
    return 'lose';  // 这里应该是 lose，不是 maintain
  } else if (level === 'normal') {
    console.log('正常，推荐维持');
    return 'maintain';
  } else {
    console.log('未知等级，默认维持');
    return 'maintain';
  }
},

// 检查是否为推荐目标
isRecommendedGoal(goal) {
  const recommendedGoal = this.getRecommendedGoal();
  console.log('当前BMI等级:', this.data.bmiLevel, '推荐目标:', recommendedGoal, '检查目标:', goal);
  return goal === recommendedGoal;
},

  saveProfile() {
    const app = getApp();
    // 本地缓存兜底获取 user_id
    let user_id = (app.globalData.userInfo && app.globalData.userInfo.user_id) || this.data.userInfo.user_id;
    if (!user_id) {
      const localUserInfo = wx.getStorageSync('userInfo') || {};
      if (localUserInfo.user_id) {
        user_id = localUserInfo.user_id;
        console.log('[日志] saveProfile: 使用本地缓存 user_id 兜底', user_id);
      }
    }
    const userInfo = {
      ...this.data.userInfo,
      user_id: user_id
    };
    if (!userInfo.height || !userInfo.weight) {
      wx.showToast({
        title: '请填写身高体重',
        icon: 'none'
      });
      return;
    }
    if (!userInfo.goal) {
      wx.showToast({
        title: '请选择健康目标',
        icon: 'none'
      });
      return;
    }
    const globalUserInfo = app.globalData.userInfo || {};
    const mergedUserInfo = {
      user_id: userInfo.user_id,
      height: userInfo.height,
      weight: userInfo.weight,
      goal: userInfo.goal
    };
    console.log('[日志] saveProfile: user_id', mergedUserInfo.user_id);
    if (!mergedUserInfo.user_id) {
      wx.showToast({
        title: '用户ID未获取，无法保存',
        icon: 'none'
      });
      console.warn('[日志] saveProfile: user_id 缺失', mergedUserInfo);
      return;
    }
    app.saveUserInfo(mergedUserInfo);
    this.setData({ userInfo: mergedUserInfo });
    // 同步保存到后端
    app.request('/user/update', {
      user_id: mergedUserInfo.user_id,
      height: mergedUserInfo.height,
      weight: mergedUserInfo.weight
    }, 'POST');
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  }
})  