// app.js
App({
  onLaunch() {
    const that = this;
    // 先尝试读取本地 userInfo
    let userInfo = wx.getStorageSync('userInfo') || {};
    console.log('[日志] app.js onLaunch: 本地 userInfo', userInfo);
    // 启动时同步 globalData，无论 user_id 是否存在都赋值
    this.globalData.userInfo = userInfo;
    console.log('[日志] app.js onLaunch: globalData.userInfo 已赋值', this.globalData.userInfo);
    // 微信登录获取 openid
    wx.login({
      success: (res) => {
        console.log('[日志] wx.login 成功，code:', res.code);
        if (res.code) {
          that.request('/wxlogin', { code: res.code }, 'POST').then(result => {
            console.log('[日志] /wxlogin 返回:', result);
            if (result.success && result.openid) {
              userInfo.user_id = result.openid;
              that.saveUserInfo(userInfo);
              // 立即同步 globalData
              that.globalData.userInfo = userInfo;
              console.log('[日志] app.js onLaunch: user_id 已赋值', userInfo.user_id);
              // 通知所有页面 userInfo 已加载
              wx.$userInfoReady = true;
              if (typeof wx.$userInfoReadyCallback === 'function') {
                console.log('[日志] app.js wx.$userInfoReadyCallback 执行，userInfo:', userInfo);
                wx.$userInfoReadyCallback(userInfo);
              }
            } else {
              console.warn('[日志] /wxlogin 未返回 openid 或 success=false', result);
            }
          }).catch(err => {
            console.error('[日志] /wxlogin 请求失败', err);
          });
        }
      },
      fail: (err) => {
        console.error('[日志] wx.login失败', err);
      }
    });
  },

  // 全局数据
  globalData: {
    userInfo: null,
    baseUrl: 'http://192.168.31.167:5000/api' // 替换为你的Flask服务器地址
  },

  // 保存用户信息方法
  saveUserInfo(userInfo) {
    // 合并本地已有 userInfo，避免字段丢失
    const oldUserInfo = wx.getStorageSync('userInfo') || {};
    const mergedUserInfo = { ...oldUserInfo, ...userInfo };
    this.globalData.userInfo = mergedUserInfo;
    wx.setStorageSync('userInfo', mergedUserInfo);
  },

  // 统一的网络请求方法
  request(url, data = {}, method = 'POST') {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.baseUrl + url,
        data: data,
        method: method,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
})