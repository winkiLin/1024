// pages/edit/edit.js
var app =getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:'',
    name:'',
    phone:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInofo = wx.getStorageSync('userInfo')
    console.log(userInofo)
    this.setData({
      userInfo:userInofo,
      name:userInofo.username,
      phone:userInofo.mobile
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  updateName(e) {
    let name = e.currentTarget.dataset.name;
    console.log(e.detail.value);
    this.setData({
      name: e.detail.value
    });
  },
  updatePhone(e) {
    let name = e.currentTarget.dataset.phone;
    console.log(e.detail.value);
    this.setData({
      phone: e.detail.value
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  checkPhone: function (phone) {
    if ((/^1(3|4|5|6|7|8|9)\d{9}$/.test(phone))) {
      return true;
    } else {
      return false;
    }
  },
  loadInofo:function(){
    var that = this;
   

    if (this.data.name == '') {
      wx.showToast({
        title: '不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    var length = that.data.name.length;

    if (length>10){
      wx.showToast({
        title: '姓名不能超过10个汉字哦',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if (!that.checkPhone(that.data.phone)) {
      wx.showToast({
        title: '请检查手机号码！',
        icon: 'none',
        duration: 1500
      })
      return
    }

    wx.request({
      url: app.globalData.baseApi + '/index.php/api/mobile/accountinformation/editinfo',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "token": app.globalData.token
      },
      method: "POST",
      data: {
        name: that.data.name,
        phone: that.data.phone
      },
      success: function (resData) {
        var data = resData.data;
        if (data.code == 1) {
          that.setData({
            //list: data.data
          })
          wx.navigateBack({ 
            delta: 1
          })
        } else {
          wx.showToast({
            title: resData.data.msg,
            icon: 'none',
            duration: 1000
          })
          return false;
        }
      },
      fail: function (e) {
        console.log(e)
      }
    })
  }
})
