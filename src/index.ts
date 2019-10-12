type _PromiseState = "pending" | "fulfilled" | "rejected";

class _Promise {
  protected fulfilledCallbacks = [];
  protected rejectedCallbacks = [];
  protected resolve(args) {
    if (this.state !== "pending") return;
    this.state = "fulfilled";
    nextTick(() => {
      this.fulfilledCallbacks.forEach(callback =>
        callback.call(undefined, args)
      );
    });
  }
  protected reject(args) {
    if (this.state !== "pending") return;
    this.state = "rejected";
    nextTick(() => {
      this.rejectedCallbacks.forEach(callback =>
        callback.call(undefined, args)
      );
    });
  }
  public state: _PromiseState = "pending";
  constructor(fn) {
    if (typeof fn !== "function") {
      throw new Error("参数必须是函数");
    }
    fn(this.resolve.bind(this), this.reject.bind(this));
  }
  then(onFulfilled?, onRejected?) {
    if (typeof onFulfilled === "function") {
      this.fulfilledCallbacks.push(onFulfilled);
    }
    if (typeof onRejected === "function") {
      this.rejectedCallbacks.push(onRejected);
    }
  }
}

export default _Promise;

function nextTick(fn) {
  if (process && typeof process.nextTick === 'function') {
    return process.nextTick(fn);
  }
  let counter = 1;
  const observer = new MutationObserver(fn);
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  });
  counter = counter + 1;
  textNode.data = String(counter);
}
