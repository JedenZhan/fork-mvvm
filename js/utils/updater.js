export default {
  // 更新函数， 也是watcher的cb
  textUpdater: function (node, value) {
    node.textContent = typeof value == "undefined" ? "" : value;
  },

  htmlUpdater: function (node, value) {
    node.innerHTML = typeof value == "undefined" ? "" : value;
  },

  classUpdater: function (node, value, oldValue) {
    var className = node.className;
    className = className.replace(oldValue, "").replace(/\s$/, "");

    var space = className && String(value) ? " " : "";

    node.className = className + space + value;
  },

  modelUpdater: function (node, value, oldValue) {
    node.value = typeof value == "undefined" ? "" : value;
  },
};
