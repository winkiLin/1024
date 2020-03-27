let config = {}
let prefix = "wxapi"
let clientId = 2
let clientSecret = "fUe82Hb5B4IXWX5rcXp98KAGG3FKaFJEdfOF0wQP"

//   // 开发环境
//   config.domain = 'https://cloth-nebula-api.szhibu.com'

  // // 正式环境
  // config.domain = 'https://fabricserviceagent.sfabric.com'

  // 测试环境
  config.domain = 'https://cloth-nebula-api.szhibu.com'

module.exports = {
  domain: config.domain, clientId, clientSecret, prefix
}