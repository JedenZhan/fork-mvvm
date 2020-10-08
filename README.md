## MVVM

[Fork from DMQ/MVVM](https://github.com/DMQ/mvvm)

- ES6改版
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

首先，让数据的获取和赋值变成可监听，就是我们熟悉的Object.defineProperty方法

```js
const obj = {}
let v = 'i am v'
Object.defineProperty(obj, 'v', {
  configurable: true,
  enumerable: true,
  get() {
    console.log(`获取了数据${'v'}`)
    return v
  },
  set(newV) {
    console.log(`设置了数据obj.${'v'}为${newV}`)
    v = newV
  },
})
```
明白了这个以后，我们可以写出来这两个函数
```js
const defineReactive = (data, key, val) => {
  if (Array.isArray(val)) {
    // 数组的处理
  }
  if (typeof val === 'object') walk(val) // 递归处理
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get () {
      console.log('get value')
      return val
    },
    set (newV) {
      if (val === newV) return
      console.log('set value')
      val = newV
    }
  })
}

const walk = data => {
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
}
```
这就是observer.js的核心代码，就是做了这些

### 监听后的依赖收集

把上面的两个console改为这样
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