function toKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function toCamelCase(value) {
  return value.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
}
export {
  toCamelCase,
  toKebabCase
};
