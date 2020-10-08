import Dep from "./dep.js";

class Watcher {
  constructor(vm, expOrFn, cb) {
    this.cb = cb;
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.depIds = {};
    this.getter = this.parseGetter(expOrFn);
    this.value = this.get();
  }
  update() {
    this.run(); // 更新函数
  }
  run() {
    const v = this.get(),
      oldV = this.value;
    if (v !== oldV) {
      this.value = v;
      this.cb(v, oldV);
    }
  }
  addDep(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this); // 收集依赖
      this.depIds[dep.id] = dep;
    }
  }
  get() {
    Dep.target = this;
    const v = this.getter(this.vm);
    Dep.target = null;
    return v;
  }
  parseGetter(exp) {
    // 闭包函数
    if (/[^\w.$]/.test(exp)) return;
    const exps = exp.split(".");
    return obj => {
      for (let i = 0, len = exps.length; i < len; i++) {
        // for循环取属性
        if (!obj) return;
        obj = obj[exps[i]];
      }
      return obj;
    };
  }
}

export default Watcher;
