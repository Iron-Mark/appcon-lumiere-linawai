module.exports = {
  readFile(_path, cb) {
    if (typeof cb === "function") cb(new Error("fs is not available"));
  },
  readFileSync() {
    throw new Error("fs is not available");
  },
  existsSync() {
    return false;
  },
  promises: {
    readFile() {
      return Promise.reject(new Error("fs is not available"));
    },
  },
};
