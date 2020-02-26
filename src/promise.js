const { typeIsObject, isCallable } = require('./util')
const promiseStatus = {
  'pending': 'pending',
  'fullfilled': 'fullfilled',
  'rejected': 'rejected',
}

function noop() { }

function Promise(executor) {
  this.status = promiseStatus.pending
  this.fullfillReactions = []
  this.rejectReactions = []
  this.result = undefined
  const [resolve, reject] = CreateResolvingFunctions(this)
  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

function CreateResolvingFunctions(promise) {
  function _resolve(value) {
    resolvePromise(promise, value)
    _resolve = _reject = noop
  }

  function _reject(reason) {
    rejectPromise(promise, reason)
    _resolve = _reject = noop
  }

  return [function (value) { _resolve(value) }, function (reason) { _reject(reason) }]
}

function resolvePromise(promise, value) {
  if (!typeIsObject(value)) {
    fullfillPromise(promise, value)
    return
  }
  let then = value.then
  if (!isCallable(then)) {
    fullfillPromise(promise, value)
    return
  }
  // 处理then函数中返回promise的情况
  // value.then((value) => {
  //   fullfillPromise(promise, value)
  // }, (reason) => {
  //   rejectPromise(promise, reason)
  // })
  const [resolve, reject] = CreateResolvingFunctions(promise)
  try {
    then.call(value, resolve, reject)
  } catch (e) {
    reject(e)
  }
}

function fullfillPromise(promise, value) {
  promise.state = promiseStatus.fullfilled
  promise.result = value
  process.nextTick(() => {
    TriggerPromiseReactions(promise.fullfillReactions, promise.result)
  })
}


function rejectPromise(promise, reason) {
  promise.state = promiseStatus.rejected
  promise.result = reason
  process.nextTick(() => {
    TriggerPromiseReactions(promise.rejectReactions, promise.result)
  })
}

function TriggerPromiseReactions(reactions, result) {
  for (let r of reactions) {
    r(result)
  }
}

function NewPromiseCapability() {
  const promiseCapability = {}
  const promise = new Promise((resolve, reject) => {
    promiseCapability.resolve = resolve
    promiseCapability.reject = reject
  })
  promiseCapability.promise = promise

  return promiseCapability
}

Promise.prototype.then = function (onFullfilled, onRejected) {
  const promiseCapability = NewPromiseCapability()
  const { resolve, reject } = promiseCapability
  const promise = this
  if (!isCallable(onFullfilled)) {
    onFullfilled = function () {
      resolve(promise.result)
    }
  }
  if (!isCallable(onRejected)) {
    onRejected = function () {
      reject(promise.result)
    }
  }
  switch (promise.status) {
    case promiseStatus.pending:
      promise.fullfillReactions.push(function (value) {
        settle(resolve, reject, onFullfilled, value)
      })
      promise.rejectReactions.push(function (reason) {
        settle(resolve, reject, onRejected, reason)
      })
      break
    case promiseStatus.fullfilled:
      process.nextTick(() => {
        settle(resolve, reject, onFullfilled, promise.result)
      })
      break
    case promiseStatus.rejected:
      process.nextTick(() => {
        settle(resolve, reject, onRejected, promise.result)
      })
      break
  }

  // 返回一个全新的promise
  return promiseCapability.promise
}

function settle(resolve, reject, onFulfilledOrOnRejected, result) {
  let nextResult
  try {
    nextResult = onFulfilledOrOnRejected(result)
  } catch (e) {
    reject(e)
    return
  }
  resolve(nextResult)
}

function isPromise(v) {
  return typeIsObject(v) && v.state !== undefined
}

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}
Promise.resolve = function (v) {
  if (isPromise(v)) return v
  const promiseCapability = NewPromiseCapability()
  promiseCapability.resolve(v)

  return promiseCapability.promise
}

Promise.reject = function (r) {
  const promiseCapability = NewPromiseCapability()
  promiseCapability.reject(r)

  return promiseCapability.promise
}

Promise.all = function (arr) {
  const promiseCapability = NewPromiseCapability()
  const { resolve, reject } = promiseCapability
  let count = arr.length
  const results = []
  arr.forEach(item => {
    item.then(r => {
      count--
      results.push(r)
      if (count === 0) {
        resolve(results)
      }
    }, (e) => {
      reject(e)
    })
  })

  return promiseCapability.promise
}

Promise.race = function (arr) {
  const promiseCapability = NewPromiseCapability()
  const { resolve, reject } = promiseCapability
  arr.forEach(item => {
    item.then(v => resolve(v), r => reject(r))
  })

  return promiseCapability.promise
}


module.exports = Promise