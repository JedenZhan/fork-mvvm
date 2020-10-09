import Compile from "./compile.js";
import observe from "./observer.js";

class MVVM {
  constructor(options) {
    this.$options = options || {};
    const data = (this._data = this.$options.data);
    Object.keys(data).forEach(key => {
      this.proxyData(data, key); // 让obj.a 可访问 obj.data.a
    });

    observe(data, this); // 先监听数据
    this.$compile = new Compile(options.el || document.body, this); // 传入根元素，编译
  }

  proxyData(data, key) {
    Object.defineProperty(this, key, {
      configurable: true,
      enumerable: true,
      get() {
        return data[key];
      },
      set(newV) {
        data[key] = newV;
      },
    });
  }
}

export default MVVM;
