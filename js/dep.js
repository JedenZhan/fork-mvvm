let uid = 0;

class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub) {
    // 新增依赖, 在 watcher 里面运行
    this.subs.push(sub);
  }

  depend() {
    // set的时候在watcher里面新增依赖, 方便获取watcher实例
    Dep.target && Dep.target.addDep(this);
  }

  // 这里用不到 remove
  // removeSub(sub) {
  //   var index = this.subs.indexOf(sub);
  //   if (index != -1) {
  //     this.subs.splice(index, 1);
  //   }
  // }

  notify() {
    this.subs.forEach(function (sub) {
      sub.update();
    });
  }
}

Dep.target = null;

export default Dep;
