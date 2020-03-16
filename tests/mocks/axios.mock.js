module.exports = (fn) => {
  const axiosMock = jest.fn(request => Promise.resolve(fn ? fn(request) : request))
  axiosMock.request = axiosMock
  return axiosMock
}
