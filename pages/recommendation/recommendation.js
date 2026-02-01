// pages/recommendation/recommendation.js
Page({
  data: {
    userInfo: null,
    goalText: '',
    recommendation: '',
    isLoading: false
  },

  onLoad() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    const goalMap = {
      'gain': '增肌',
      'lose': '减脂',
      'maintain': '健康维持'
    };
    
    this.setData({
      userInfo: userInfo,
      goalText: goalMap[userInfo.goal] || ''
    });
  },

  // 连接后端的AI推荐
  async generateRecommendation() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: 'AI思考中...' });

    try {
      const result = await getApp().request('/recommend', {
        goal: this.data.userInfo.goal,
        bmi: this.data.userInfo.bmi,
        height: this.data.userInfo.height,
        weight: this.data.userInfo.weight
      });

      if (result.success) {
        this.setData({
          recommendation: result.data.recommendation,
          isLoading: false
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('获取推荐失败:', error);
      // 失败时使用本地备选方案
      this.useLocalRecommendation();
    } finally {
      wx.hideLoading();
      this.setData({ isLoading: false });
    }
  },

  // 本地备选推荐方案（保持原有逻辑）
  useLocalRecommendation() {
    const recommendations = {
      gain: [
        "增肌期间建议每日摄入热量为体重的40大卡/公斤。早餐：3个鸡蛋+全麦面包+牛奶；午餐：鸡胸肉150g+糙米饭+蔬菜；加餐：蛋白棒或坚果；晚餐：鱼肉200g+红薯+绿叶菜。保证每天蛋白质摄入量达到2g/公斤体重。",
        "增肌需要充足碳水和蛋白质。推荐：早餐燕麦粥+蛋白粉；午餐牛肉面+额外鸡胸肉；训练后香蕉+蛋白粉；晚餐三文鱼+糙米饭。每日加餐2-3次，可选择希腊酸奶、坚果等。"
      ],
      lose: [
        "减脂期建议每日摄入热量为体重的25-30大卡/公斤。早餐：2个鸡蛋+蔬菜沙拉；午餐：鸡胸肉120g+藜麦+大量蔬菜；晚餐：清蒸鱼150g+西兰花+豆腐。避免高油高糖，多喝水，保持有氧运动。",
        "减脂饮食要低卡高蛋白。推荐：早餐蔬菜蛋白饼；午餐虾仁炒蔬菜+少量糙米饭；晚餐鸡胸肉沙拉。加餐可选择苹果、黄瓜等低糖水果蔬菜。控制晚餐碳水摄入。"
      ],
      maintain: [
        "维持期饮食要均衡多样。早餐：全麦面包+鸡蛋+水果；午餐：鱼肉/鸡肉+杂粮饭+多种蔬菜；晚餐：豆腐+蔬菜+少量主食。每天保证12种以上食物，适量运动保持代谢。",
        "健康维持需要均衡营养。推荐五颜六色的餐盘：1/2蔬菜+1/4蛋白质+1/4主食。多吃粗粮、豆制品，适量坚果，少盐少油烹饪。保持饮食规律和适度运动。"
      ]
    };

    const goalRecs = recommendations[this.data.userInfo.goal] || [];
    const randomIndex = Math.floor(Math.random() * goalRecs.length);
    
    this.setData({
      recommendation: goalRecs[randomIndex]
    });
  }
})