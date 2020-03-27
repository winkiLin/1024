import request from '../../utils/req'
import config from '../../utils/config'
import timer from '../../utils/timer'
import Mcaptcha from '../../utils/mcaptcha.js'
const app = getApp()
Page({
  data: {
    captchaLabel:"获取验证码",
    seconds: timer.length,
    captchaDisabled: false,
    username: '',
    passcode: '',
    msgloading: false,    
    loginDisabled: false,
    loginloading: false,
    db:'',
    phone:'',
    openid:''
  },
  onReady(){
    this.mcaptcha=new Mcaptcha({
      el: 'canvas',
      width: 80,
      height: 35,
      createCodeImg: ""
      });
  },
  onLoad(e) {
      let _this = this
      wx.hideLoading()
      _this.db = wx.cloud.database()

  },


  /* 新增用户 */
  addUser: function () {
    let _this = this
    _this.db.collection('users').add({
      data: {
        openid:this.data.openid,
        phone:this.data.phone
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: res._id,
          count: 1,
        })
        wx.showToast({
          title: '注册成功',
        })
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
  queryUser: function() {
    let _this = this
    // const db = wx.cloud.database()
    // 查询当前用户所有的 user
    _this.db.collection('users').where({
      openid: this.data.openid
    }).get({
      success: res => {
        wx.showToast({
          icon: 'none',
          title: '登陆成功'
        })
        this.setData({
          queryResult: JSON.stringify(res.data, null, 2)
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '登陆失败'
        })
      }
    })
    _this.setData({loginloading : false,loginDisabled : false})

  },
  searchWrite(event) {
    this.setData({
      [`${event.target.dataset.type}`]: event.detail.value
    })
  },
  // 登入
  loginBtn() {
    let { username, passcode } = this.data,
    _this = this    
    if(!this.data.username.match(/^((1[3-9]{1})+\d{9})$/))  { 
      wx.showToast({
        title: '请输入正确的手机号码。',
        icon: 'none',
        duration: 2000
      })
      return false
    }
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

    _this.onQuery()
    _this.setData({loginloading : true,loginDisabled : true})
  },
  //刷新验证码
onTap(){
  console.log(this.mcaptcha,'图形验证码')
  this.mcaptcha.refresh();
  }
}) 