// pages/profile/profile.js
Page({
  data: {
    userInfo: {
      name: '',
      height: '',
      weight: '',
      goal: ''
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
  },

  // 获取推荐目标（根据BMI）
  getRecommendedGoal() {
    const level = this.data.bmiLevel;
    
    switch(level) {
      case 'underweight': // 偏瘦 → 推荐增肌
        return 'gain';
      case 'overweight': // 超重 → 推荐减脂
      case 'obese': // 肥胖 → 推荐减脂
        return 'lose';
      case 'normal': // 正常 → 推荐维持
      default:
        return 'maintain';
    }
  },

  // 检查是否为推荐目标
  isRecommendedGoal(goal) {
    const recommendedGoal = this.getRecommendedGoal();
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