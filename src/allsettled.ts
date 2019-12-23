function allSettled(promiseList) {
  const formatedList = promiseList.map(promise => {
    return promise.then(
      (value) => ({status: "fulfilled", value}),
      (reason) => ({status: "rejected", reason}))
  })
  return Promise.all(formatedList)
}
