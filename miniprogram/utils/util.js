module.exports = {
  getDate: function () {
    let year = new Date().getFullYear()
      let month = new Date().getMonth() + 1
      let day = new Date().getDate()

      if(month < 10) {
        month = '0' + '' + month
      }
      if(day < 10) {
        day = '0' + '' + day
      }

      return `${year}-${month}-${day}`
  }
}
