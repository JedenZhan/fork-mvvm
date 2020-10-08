import Dep from "./dep.js";

class Observer {
  constructor(data) {
    this.data = data;
    this.walk(data);
  }
  walk(data) {
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
    });
  }
  defineReactive(data, key, val) {
    if (typeof data[key] === "object") this.walk(data[key]);
    const dep = new Dep(); // 每一个key对应一个dep实例， 类似闭包， 被get和set引用，不能回收
    Object.defineProperty(data, key, {
      configurable: false,
      enumerable: true,
      get() {
        dep.depend();
        return val;
      },
      set(v) {
        if (v === val) return;
        val = v;
        dep.notify();
      },
    });
  }
}

const observe = value => {
  if (!value || typeof value !== "object") {
    return;
  }

  return new Observer(value);
};

export default observe;
