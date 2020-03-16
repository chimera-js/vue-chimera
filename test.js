class Test {
}

Test.opts = { salam: true }

class Test2 extends Test {
  constructor () {
    super()
      console.log(this.constructor.opts)
  }
}

new Test2()
