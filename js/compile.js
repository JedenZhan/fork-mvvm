import Watcher from "./watcher.js";
import utils from "./utils/utils.js";
import updater from "./utils/updater.js";

// 指令处理集合, 比如 v-text， v-html， v-bind
const compileUtil = {
  text(node, vm, exp) {
    this.bind(node, vm, exp, "text");
  },

  html(node, vm, exp) {
    this.bind(node, vm, exp, "html");
  },

  model(node, vm, exp) {
    this.bind(node, vm, exp, "model");

    let val = this._getVMVal(vm, exp);
    node.addEventListener("input", e => {
      const newValue = e.target.value;
      if (val === newValue) {
        return;
      }
      this._setVMVal(vm, exp, newValue);
      val = newValue;
    });
  },

  class(node, vm, exp) {
    this.bind(node, vm, exp, "class");
  },

  bind(node, vm, exp, dir) {
    const updaterFn = updater[dir + "Updater"];
    updaterFn && updaterFn(node, this._getVMVal(vm, exp));
    new Watcher(vm, exp, function (value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue);
    });
  },

  // 事件处理
  eventHandler(node, vm, exp, dir) {
    const eventType = dir.split(":")[1],
      fn = vm.$options.methods && vm.$options.methods[exp];
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },

  _getVMVal(vm, exp) {
    let val = vm;
    exp = exp.split(".");
    exp.forEach(function (k) {
      val = val[k];
    });
    return val;
  },

  _setVMVal(vm, exp, value) {
    let val = vm;
    exp = exp.split(".");
    exp.forEach(function (k, i) {
      // 非最后一个key，更新val的值
      if (i < exp.length - 1) {
        val = val[k];
      } else {
        val[k] = value;
      }
    });
  },
};
class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = utils.isElementNode(el) ? el : document.querySelector(el); // this.$el是真实的dom
    this.$fragment = this.node2Fragment(this.$el);
    this.init();
    this.$el.appendChild(this.$fragment);
  }

  node2Fragment(el) {
    const fragment = document.createDocumentFragment();
    let child;
    while ((child = el.firstChild)) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  init() {
    this.compileElement(this.$fragment); // 这样写是方便递归
  }

  compileElement(el) {
    const childNodes = el.childNodes,
      reg = /\{\{(.*)\}\}/;
    [...childNodes].forEach(node => {
      const text = node.textContent;
      if (utils.isElementNode(node)) {
        this.compile(node); // 递归编译节点
      } else if (utils.isTextNode(node) && reg.test(text)) {
        this.compileText(node, RegExp.$1.trim());
      }
      if (node.childNodes && node.childNodes.length > 0) {
        this.compileElement(node);
      }
    });
  }

  compile(node) {
    const nodeAttrs = node.attributes; // 获取元素的属性， 比如 class， v-xxx
    [...nodeAttrs].forEach(attr => {
      const attrName = attr.name;
      if (utils.isDirective(attrName)) {
        const exp = attr.value,
          dir = attrName.substring(2); // 获取v-xxx的xxx
        if (utils.isEventDirective(dir)) {
          compileUtil.eventHandler(node, this.$vm, exp, dir);
        } else {
          compileUtil[dir] && compileUtil[dir](node, this.$vm, exp);
        }
        node.removeAttribute(attrName); // 编译完移除attr
      }
    });
  }

  compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp);
  }
}

export default Compile;
