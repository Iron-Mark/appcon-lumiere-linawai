function join(...parts) {
  return parts.join("/");
}

module.exports = {
  join,
  dirname: join,
  resolve: join,
  sep: "/",
};
