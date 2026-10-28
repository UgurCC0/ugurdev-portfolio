function shouldBlockCapture({ complete, loading, rect }) {
  if (complete) return false;
  const hiddenLazyImage = loading === 'lazy' && rect.width === 0 && rect.height === 0;
  return !hiddenLazyImage;
}

module.exports = {
  shouldBlockCapture,
  browserPredicateSource: `(${shouldBlockCapture.toString()})`,
};
