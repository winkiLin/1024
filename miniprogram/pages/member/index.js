//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: '',
    hasUserInfo: false,
    row_info:'',
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  toEditInfo: function () {
    wx.navigateTo({
      url: '../edit/edit'
    })
  },
  onLoad: function () {
    var info = app.globalData.userInfo;
    console.log(info)
    if (info) {
      this.setData({
        userInfo: info
      })
    }

  },
  onShow:function(){
    this.loadData();
  },
  initUserInfo: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

  },
  login: function (e) {
    var username = '';
    var that = this;
    wx.showLoading({
      title: '授权登录中'
    })
    // wx.showToast({
    //   title: '登录接口',
    //   icon: 'success'
    // })

    wx.login({
      success: function (res) {

        if (res.code) {
          var code = res.code;

          // 获取unionid
          wx.getUserInfo({
            success: function (r) {
              console.log(r.userInfo.nickName);
              console.log(r.userInfo.gender);
              console.log(r.userInfo.avatarUrl);

              // 调用登录接口
              wx.request({
                url: app.globalData.baseApi + '/index.php/api/wxuser/login_hawk',//
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: {
                  code: code,
                  avatarUrl: r.userInfo.avatarUrl,
                  gender: r.userInfo.gender,
                  nickName: r.userInfo.nickName
                },
                success: function (resData) {
                  var result = resData.data;
                  console.log(666)
                  console.log(result)
                  if (result.code == 1) {
                    var userInfo = result.data.userInfo
                    // userInfo.mini_openid = openid
                    console.log(userInfo)
                    console.log(3435)
                    app.globalData.userInfo = userInfo;
                    app.globalData.token = userInfo.token;
                    wx.setStorageSync('token', userInfo.token)
                    wx.setStorageSync('userInfo', userInfo);
                    that.loadData();
                    wx.showToast({
                      title: '登录成功',
                      icon: 'success'
                    })
                    that.setData({
                      userInfo: userInfo
                    })

                  } else {
                    wx.showToast({
                      title: '登录失败',
                      icon: 'none'
                    })
                  }

                },
                fail: function (e) {
                  console.log(e)
                  wx.showToast({
                    title: '登录失败!',
                    icon: 'none'
                  })
                }
              })
              // 调用登录接口end

            },
            fail: function () {
              wx.showToast({
                title: '获取用户信息失败',
                icon: 'none'
              })
            }
          })

        }
      },
      fail: function () {
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      }
    })
  },
  loadData: function () {
    var that = this;
    wx.request({
      url: app.globalData.baseApi + '/index.php/api/mobile/accountinformation/info?token='+app.globalData.token,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "token": app.globalData.token
      },
      method: "GET",
      data: {

      },
      success: function (resData) {
       
        var data = resData.data;
        var info = data.data;
        console.log(info)
        wx.setStorageSync('userInfo', info);
        if (data.code == 1) {
          that.setData({
            row_info:info
          })
        } else {
       
          return false;
        }
      },
      fail: function (e) {
        console.log(e)
      }
    })
  },
  toSelectAvatar: function () {
    console.log("点击了")
    var _this = this;
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths

      }
    })

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
