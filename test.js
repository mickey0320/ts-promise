const myPromise = require('./src/promise')

const p1 = new myPromise((resolve, reject) => {
  aa
})
  .then(val => {
    console.log(val)
    return 'mickey_new'
  })
  // .then((val) => {
  //   console.log(aaa)
  // }).catch((e) => {
  //   return 'success'
  // }).then((res) => {
  //   console.log(res)
  // })
// p1.then(v => {
//   console.log(v)
//   return 'haha'
// })
// p1.then(v => {
//   console.log(v)
// })