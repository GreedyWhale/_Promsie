type _PromiseState = "pending" | "fulfilled" | "rejected";

class _Promise {
  protected fulfilledCallbacks = [];
  protected rejectedCallbacks = [];
  protected resolve(args) {
    if (this.state !== "pending") return;
    this.state = "fulfilled";
    setTimeout(() => {
      this.fulfilledCallbacks.forEach(callback =>
        callback.call(undefined, args)
      );
    }, 0);
  }
  protected reject(args) {
    if (this.state !== "pending") return;
    this.state = "rejected";
    setTimeout(() => {
      this.rejectedCallbacks.forEach(callback =>
        callback.call(undefined, args)
      );
    }, 0);
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
