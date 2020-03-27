
import config from './config'

let asyncTask = []

const defaultConfig = {
  method: 'GET',
  query: {},
  data: {},
  isNeedPrefix: true,
  isNeedToken: true,
  isNeedLoading: true,
  isNeedHandleError: true
}

/**
 * @description 网络请求
 * @param {Object} query {
   method: 'GET', 请求方式  非必填 默认值：'GET'
   url: '', 路由  必填
   query: {}, url 参数 非必填
   data: {},  请求体 非必填
   isNeedPrefix: true, 是否需要接口前缀 非必填 默认值：true
   isNeedToken: true, 是否需要token验证 非必填 默认值：false
   isNeedLoading: true, 是否需要加载提示 非必填 默认值：true
 }
 *  
 */
function request(query) {
  let method
  let url
  let data
  let header
  let loginTimer = null

  return new Promise((resolve, reject) => {
    if (!query.url) return console.log('url 没有传递')
    
    
    query = handleMergeConfig(query)
    
    const requestQuery = query.url + query.method
    const requestInfo = {
      requestQuery,
      requestTask: ''
    }
    
    url = handleUlr(query)
    header = handleHeader(query)
    
    if (header === false) {
      return
    }
    
    handleLoading(true)
    
    requestInfo.requestTask = wx.request({
      method: query.method,
      url,
      data: query.data,
      header,
      success(body) {
        handleLoading(false)
        const statusCode = body.statusCode || 500
        const status_code = query.isNeedToken ? (body.data.code ? body.data.code : 500) : 200 
        const requestMessage = body.data && body.data.message
        
        if (
          statusCode === 200 
          &&
          status_code === 200
          ) {
          return resolve(body.data)
        }
          
        if (!query.isNeedHandleError) {
          return reject(body)
        }
          
        let message
          
        if (statusCode === 200) {
          switch (status_code) {
            case 401 :
              if (!query.isLogin) {
                toLogin()
              }
              default:
                message = requestMessage || '系统维护中，请稍后再试！'
              }
            } else if(statusCode === 500){
              message = requestMessage || '服务器端错误！'
            } else {
            switch (statusCode) {
              case 401 :
                if (!query.isLogin) {
                  toLogin()
                }
              case 404 :
                message = requestMessage || '服务端路由不存在！'
              case 429 :
                message = requestMessage || '接口访问次数太频繁！'
              case 500 :
                
                message = requestMessage || '服务器繁忙！'
                  default:
                  message = requestMessage || ''       
                }
              }
                  
            if(message) {
              wx.showToast({
                title: message,
                icon: 'none',
                duration: 2000
              })
            } 
            return reject(body)
          },
      fail(fail) {
        handleLoading(false)
        if (fail.errMsg.includes('abort')) {
          return reject({
            code: -1, // 取消请求了
            fail
          })
        }
        
        if (!query.isNeedHandleError) {
          return reject(fail)
        }
        
        wx.showToast({
            title: fail.errMsg || '请检查网络、域名解析等是否正确',
            icon: 'none',
            duration: 2000
        })
        reject(fail)
      },
      complete() {
        handleAbort(0)
      }
    })
    
    
    handleAbort(1)
    asyncTask.push(requestInfo)
    
    function handleAbort(type) {
      for (var i = 0; i < asyncTask.length; i++) {
        const item = asyncTask[i]
        
        if (item && item.requestQuery === requestQuery) {
          if (type === 1) {
            item.requestTask.abort()
          }
          asyncTask.splice(i, 1)
          break
        }
      }
    }
    
    function handleMergeConfig(query) {
      return Object.assign({}, defaultConfig, query)
    }
    
    function handleUlr(query) {
      const domain = config.domain.replace(/\/$/, '')
      let url = query.url.replace(/^\//, '')
      
      url = transformPath(url, query.query)
      
      if (query.isNeedPrefix) {
        return `${ domain }/${ config.prefix }/${ url }`
      } else {
        return `${ domain }/${ url }`
      }
    }
    
    function handleHeader(query) {
      let header = Object.create(null)
      
      if (query.isNeedToken) {

        // let token = getApp().globalData.token
        let token = wx.getStorageSync('token')
        
        if (token) {
          token = wx.getStorageSync('token')
        }
        
        if (!token) {
          wx.showToast({
            title: '登录超时，请重新登入！',
            icon: 'none',
            duration: 2000
          })          
          if (!query.isLogin) {
            toLogin()
          }
          return false
        }
        
        header['Authorization'] = token
        header["Accept"] = 'application/json'
        header["Content-Type"]= 'application/json'
        return header
      }    
      header["Accept"] = 'application/json'
      header["Content-Type"]= 'application/json'
      return header
    }
    
    function transformPath(url, query) {
      let tempUrl = ''
      
      for (const key in query) {
        if (query.hasOwnProperty(key)) {
          const val = query[key]
          if (
            val !== '' &&
            val !== undefined
          ) {
            tempUrl += (`&${ key }=${ val }`)
          }
        }
      }
      
      if (tempUrl) {
        tempUrl = tempUrl.substring(1)
        
        return `${ url }?${ tempUrl }`
      }
      
      return url
    }
    
    function handleLoading(isShow) {
      if (!query.isNeedLoading) {
        return
      }
      
      if (isShow) {
        clearTimeout(loginTimer)
        loginTimer = setTimeout(() => {
          wx.showLoading({
            title: 'Loading ...',
            mask: true
          })
        }, 200)
        return
      }
      
      if (loginTimer) {
        wx.hideLoading()
        clearTimeout(loginTimer)
      }
    }
    
    function toLogin() {
      getApp().globalData.token = ''
      getApp().globalData.userAccount = ''
      wx.setStorageSync('token', '')
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
  })
}

export default request
