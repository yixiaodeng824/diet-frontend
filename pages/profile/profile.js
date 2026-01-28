// pages/profile/profile.js
Page({
  data: {
    userInfo: {
      name: '',
      height: '',
      weight: '',
      goal: '',
      bmi: '',
      bmiStatus: '',
      bmiLevel: '',
      recommendedGoalText: ''
    },
    bmi: '',
    bmiStatus: '',
    bmiLevel: '' // 新增：BMI等级，用于推荐判断
  },

  onLoad() {
    const app = getApp();
    const globalUserInfo = app.globalData.userInfo;
    
    if (globalUserInfo) {
      this.setData({
        userInfo: {
          name: globalUserInfo.name || '',
          height: globalUserInfo.height || '',
          weight: globalUserInfo.weight || '',
          goal: globalUserInfo.goal || ''
        }
      });
      
      if (globalUserInfo.height && globalUserInfo.weight) {
        this.calculateBMI();
      }
    }
  },

  onHeightInput(e) {
    const height = e.detail.value;
    this.setData({
      'userInfo.height': height
    });
    
    if (height && this.data.userInfo.weight) {
      this.calculateBMI();
    }
  },

  onWeightInput(e) {
    const weight = e.detail.value;
    this.setData({
      'userInfo.weight': weight
    });
    
    if (weight && this.data.userInfo.height) {
      this.calculateBMI();
    }
  },

  selectGoal(e) {
    const goal = e.currentTarget.dataset.goal;
    this.setData({
      'userInfo.goal': goal
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
    const userInfo = this.data.userInfo;
    
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

    const app = getApp();
    app.saveUserInfo(userInfo);
    
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