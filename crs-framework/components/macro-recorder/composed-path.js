function composedPath(element) {
  const result = [];
  result.push(element);
  while (element.parentElement != null) {
    element = element.parentElement;
    result.push(element);
  }
  return result;
}
export {
  composedPath
};
