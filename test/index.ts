import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import Promise from "../src/index";
chai.use(sinonChai);

const assert = chai.assert;

describe("Promise 测试", () => {
  it("Promise 是一个类", () => {
    assert.isFunction(Promise);
    assert.isObject(Promise.prototype);
  });
  it("Promise 接受一个参数，该参数必须是函数", () => {
    assert.throw(() => {
      // @ts-ignore
      new Promise(false);
    }, "参数必须是函数");
    assert.throw(() => {
      // @ts-ignore
      new Promise();
    }, "参数必须是函数");
  });
  it("new Promise(fn) 中的 fn 立即执行", () => {
    let fn = sinon.fake();
    new Promise(fn);
    assert.isTrue(fn.called);
  });
  it("new Promise(fn) 中的 fn 执行的时候接受 resolve 和 reject 两个函数", done => {
    new Promise((resolve, reject) => {
      assert.isFunction(resolve);
      assert.isFunction(reject);
      done();
    });
  });
  it("new Promise(fn) 会生成一个对象，对象有 then 方法", () => {
    const promise = new Promise(() => {});
    // @ts-ignore
    assert.isObject(promise);
    assert.isFunction(promise.then);
  });
  it("promise.then(onFulfilled) 中的 onFulfilled 会在 resolve 被调用的时候执行", done => {
    const onFulfilled = sinon.fake();
    const promise = new Promise(resolve => {
      assert.isFalse(onFulfilled.called);
      resolve();
      setTimeout(() => {
        assert.isTrue(onFulfilled.called);
        done();
      }, 0);
    });
    // @ts-ignore
    promise.then(onFulfilled);
  });
  it("promise.then(null, onRejected) 中的 fail 会在 reject 被调用的时候执行", done => {
    const onRejected = sinon.fake();
    const promise = new Promise((resolve, reject) => {
      assert.isFalse(onRejected.called);
      reject();
      setTimeout(() => {
        assert.isTrue(onRejected.called);
        done();
      }, 0);
    });
    // @ts-ignore
    promise.then(null, onRejected);
  });
  // Promise/A+ 规范
  describe("2.2 then 方法", () => {
    it("2.2.1 onFulfilled和onRejected都是可选的参数", () => {
      const promise = new Promise(() => {});
      promise.then();
      assert(true);
    });
    it("2.2.1.1 如果 onFulfilled不是函数，必须忽略", () => {
      const promise = new Promise(() => {});
      promise.then(true, "123");
      assert(true);
    });
    it("2.2.1.1 如果 onRejected不是函数，必须忽略", () => {
      const promise = new Promise(() => {});
      promise.then([], {});
      assert(true);
    });
    describe("2.2.2 如果onFulfilled是函数", () => {
      it("2.2.2.1 此函数必须在promise fulfilled后被调用,并把promise 的值作为它的第一个参数", done => {
        const onFulfilled = sinon.fake();
        const promise = new Promise(resolve => {
          resolve(1);
          setTimeout(() => {
            assert.isTrue(promise.state === "fulfilled");
            assert.isTrue(onFulfilled.calledOnce);
            assert.isTrue(onFulfilled.calledWith(1));
            done();
          }, 0);
        });
        promise.then(onFulfilled);
      });
      it("2.2.2.2 此函数在promise fulfilled之前绝对不能被调用", done => {
        const onFulfilled = sinon.fake();
        const promise = new Promise(resolve => {
          assert.isFalse(onFulfilled.called);
          resolve(1);
          setTimeout(() => {
            assert.isTrue(promise.state === "fulfilled");
            assert.isTrue(onFulfilled.calledOnce);
            assert.isTrue(onFulfilled.calledWith(1));
            done();
          }, 0);
        });
        promise.then(onFulfilled);
      });
      it("2.2.2.2 此函数绝对不能被调用超过一次", done => {
        const onFulfilled = sinon.fake();
        const promise = new Promise(resolve => {
          assert.isFalse(onFulfilled.called);
          resolve(1);
          resolve(2);
          resolve(3);
          resolve(4);
          setTimeout(() => {
            assert.isTrue(promise.state === "fulfilled");
            assert.isTrue(onFulfilled.calledOnce);
            assert.isTrue(onFulfilled.calledWith(1));
            done();
          }, 0);
        });
        promise.then(onFulfilled);
      });
    });
    describe("2.2.3 如果onRejected是函数", () => {
      it("2.2.3.1 此函数必须在promise rejected后被调用,并把promise 的reason作为它的第一个参数", done => {
        const onRejected = sinon.fake();
        const promise = new Promise((resolve, reject) => {
          reject(1);
          setTimeout(() => {
            assert.isTrue(promise.state === "rejected");
            assert.isTrue(onRejected.calledOnce);
            assert.isTrue(onRejected.calledWith(1));
            done();
          }, 0);
        });
        promise.then(null, onRejected);
      });
      it("2.2.3.2 此函数在promise rejected之前绝对不能被调用", done => {
        const onRejected = sinon.fake();
        const promise = new Promise((resolve, reject) => {
          assert.isFalse(onRejected.called);
          reject(1);
          setTimeout(() => {
            assert.isTrue(promise.state === "rejected");
            assert.isTrue(onRejected.calledOnce);
            assert.isTrue(onRejected.calledWith(1));
            done();
          }, 0);
        });
        promise.then(null, onRejected);
      });
      it("2.2.2.3 此函数绝对不能被调用超过一次", done => {
        const onRejected = sinon.fake();
        const promise = new Promise((resolve, reject) => {
          assert.isFalse(onRejected.called);
          reject(1);
          reject(2);
          reject(3);
          reject(4);
          setTimeout(() => {
            assert.isTrue(promise.state === "rejected");
            assert.isTrue(onRejected.calledOnce);
            assert.isTrue(onRejected.calledWith(1));
            done();
          }, 0);
        });
        promise.then(null, onRejected);
      });
    });
    describe("2.2.4 onFulfilled 或 onRejected 只在执行环境堆栈只包含平台代码之后调用", () => {
      it("onFulfilled", done => {
        const promise = new Promise(resolve => resolve(1));
        const onFulfilled = sinon.fake();
        promise.then(onFulfilled);
        assert.isFalse(onFulfilled.called);
        let a = 0;
        a += 1;
        setTimeout(() => {
          assert.isTrue(onFulfilled.called);
          done();
        }, 0);
      });
      it("onRejected", done => {
        const promise = new Promise((resolve, reject) => reject(1));
        const onRejected = sinon.fake();
        promise.then(null, onRejected);
        assert.isFalse(onRejected.called);
        let a = 0;
        a += 1;
        setTimeout(() => {
          assert.isTrue(onRejected.called);
          done();
        }, 0);
      });
    });
    it("2.2.5 onFulfilled 和 onRejected 会作为函数形式调用 ", done => {
      const promise = new Promise(resolve => {
        resolve();
      });
      promise.then(function() {
        "use strict";
        assert(this === undefined);
        done();
      });
    });
    describe("2.2.6 then可以在同一个promise里被多次调用", () => {
      it("2.2.6.1 如果/当 promise 完成执行（fulfilled）,各个相应的onFulfilled回调 必须根据最原始的then 顺序来调用", done => {
        const promise = new Promise(resolve => resolve());
        const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()];
        promise.then(callbacks[0]);
        promise.then(callbacks[1]);
        promise.then(callbacks[2]);
        setTimeout(() => {
          assert(callbacks[0].called);
          assert(callbacks[1].called);
          assert(callbacks[2].called);
          assert(callbacks[1].calledAfter(callbacks[0]));
          assert(callbacks[2].calledAfter(callbacks[1]));
          done();
        });
      });
      it("2.2.6.2 如果/当 promise 被拒绝（rejected）,各个相应的onRejected回调 必须根据最原始的then 顺序来调用", done => {
        const promise = new Promise((resolve, reject) => {
          reject();
        });
        const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()];
        promise.then(null, callbacks[0]);
        promise.then(null, callbacks[1]);
        promise.then(null, callbacks[2]);
        setTimeout(() => {
          assert(callbacks[0].called);
          assert(callbacks[1].called);
          assert(callbacks[2].called);
          assert(callbacks[1].calledAfter(callbacks[0]));
          assert(callbacks[2].calledAfter(callbacks[1]));
          done();
        });
      });
    });
  });
});
