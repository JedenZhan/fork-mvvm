## MVVM

[Fork from DMQ/MVVM](https://github.com/DMQ/mvvm)

- ES6 改版
- 拆分编译工具
- 注释

## 目录结构

```js
├── js
│   ├── compile.js // 编译
│   ├── dep.js // 依赖数组，包括新增依赖，更新函数
│   ├── index.js // MVVM类所在
│   ├── observer.js // 监听数据，收集依赖和触发更新
│   ├── utils
│   │   ├── updater.js // 更新数据工具
│   │   └── utils.js // 判断元素类型工具
│   └── watcher.js // dep里面的东西
```

## 解析

### 让数据可监听

首先，让数据的获取和赋值变成可监听，就是我们熟悉的 Object.defineProperty 方法

```js
const obj = {};
let v = "i am v";
Object.defineProperty(obj, "v", {
  configurable: true,
  enumerable: true,
  get() {
    console.log(`获取了数据${"v"}`);
    return v;
  },
  set(newV) {
    console.log(`设置了数据obj.${"v"}为${newV}`);
    v = newV;
  },
});
```

明白了这个以后，我们可以写出来这两个函数

```js
const defineReactive = (data, key, val) => {
  if (Array.isArray(val)) {
    // 数组的处理
  }
  if (typeof val === "object") walk(val); // 递归处理
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get() {
      console.log("get value");
      return val;
    },
    set(newV) {
      if (val === newV) return;
      console.log("set value");
      val = newV;
    },
  });
};

const walk = data => {
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key]);
  });
};
```

这就是 observer.js 的核心代码，就是做了这些

### 监听后的依赖收集

把上面的两个 console 改为这样

```js
// ...
const dep = new Dep() // 实例化dep
// ...
get () {
  dep.depend() // 收集依赖
  return val
},
set (newV) {
  if (val === newV) return
  dep.notify() // 通知更新
  val = newV
}
```

[dep 在这里](./js/dep.js)

[watcher 在这里](./js/watcher.js)

dep 的更新数组, 里面就是一个个的 watcher

mvvm 的步骤

1. 拿到 option 后, 取出 data 属性, 使用 proxyData 让每一个数据可以通过 this.xxx 访问

2. 接下来进行 data 数据的监听, 使用 observer 为每一个 key 添加监听, 监听获取和赋值, 并且实例化 dep, 每一个 key 都有闭包保存一个 dep

3. 在 compile.js 里面可以看到 new Watcher 的时候参数(expOrFn 为 xxx 即访问数据的路径, 比如 a.b.c, cb 就是对应的更新函数, 都在 utils/updater.js 里面定义, v-html 和 v-text 等的更新函数都不同), 在 watcher 里面, 执行了 get 方法获取数据, get 方法先把本身赋值给 Dep 这个全局上面, 然后获取数据, 记住, 这时候的 data 是被监听的, watcher 获取的时候就会触发 get 函数, 然后执行 dep.depend, 这个 watcher 实例就会被加到这个属性对应的 dep 依赖数组 subs 里面. 就这样编译好对应的 html, 也收集好了依赖

4. 我们通过 this.xxx = 123 设置数据的时候, 触发 set 函数, 进而触发里面的 dep.notify 方法, 将这个属性对应的 dep.subs 也就是里面所有的 watcher 执行 update 函数, update 函数就是操作 DOM 的函数, 完成更新

5. 数据的双向绑定, 本质就是监听了 input 的 onchange 方法, 对属性进行赋值, 然后触发 set 操作, 同第 4 步
