function typeIsObject(v) {
  if (v == null) return false
  return typeof v === 'object' || v === 'function'
}
function isCallable(v) {
  return typeof v === 'function'
}
module.exports = {
  typeIsObject,
  isCallable,
}