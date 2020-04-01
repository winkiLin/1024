import request from '../../utils/req'
import config from '../../utils/config'
import timer from '../../utils/timer'
import Mcaptcha from '../../utils/mcaptcha.js'
const app = getApp()
Page({
  data: {
    username: '',
    passcode: '',
    loginDisabled: false,
    loginloading: false,
    db: '',
    phone: '',
    openid: ''
  },
  onReady() {
    /* 加载验证码 */
    this.mcaptcha = new Mcaptcha({
      el: 'canvas',
      width: 80,
      height: 35,
      createCodeImg: ""
    });
  },
  onLoad(e) {
    let _this = this
    wx.hideLoading()
    _this.db = wx.cloud.database();/* 加载云数据库操作对象 */
  },


  /* 新增用户 */
  addUser: function (params) {
    let _this = this
    _this.db.collection('users').add({
      data: {
        phone: params
      },
      success: res => {
        console.log('增加了一个用户')
        wx.showToast({
          title: '注册成功',
        })
        _this.setData({ loginloading: false, loginDisabled: false })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '注册失败'
        })
      }
    })
  },

  /* 查询用户信息 */
  queryUser: function () {
    let _this = this
    console.log(_this.data.username, '输入的电话')
    _this.db.collection('users').where({
      phone: _this.data.username
    }).get({
      success: res => {
        if (res.data.length < 1) {
          _this.addUser(_this.data.username);/* 添加用户 */
        } else {
          wx.showToast({
            icon: 'none',
            title: '登陆成功'
          })
        }
        wx.redirectTo({
          url:'../index/index'
        })
        _this.setData({ loginloading: false, loginDisabled: false })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '登陆失败'
        })
        _this.setData({ loginloading: false, loginDisabled: false })
      }
    })

  },
  /* 双向绑定 */
  searchWrite(event) {
    this.setData({
      [`${event.target.dataset.type}`]: event.detail.value
    })
  },
  // 登入
  loginBtn() {
    let { passcode, username } = this.data
    let _this = this
    /* 手机号码格式验证 */
    if (!username.match(/^((1[3-9]{1})+\d{9})$/)) {
      wx.showToast({
        title: '请输入正确的手机号码。',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    /* 图形验证码验证 */
    if (!passcode) {
      wx.showToast({
        title: '请输入图形验证码。',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (passcode.toLowerCase() != _this.mcaptcha.options.createCodeImg.toLowerCase()) {
      wx.showToast({
        title: '请输入正确的图形验证码。',
        icon: 'none',
        duration: 2000
      })
      return
    }
    /* 查询数据库 */
    _this.queryUser()
    _this.setData({ loginloading: true, loginDisabled: true })
  },
  //刷新验证码
  onTap() {
    this.mcaptcha.refresh();
  }
}) 