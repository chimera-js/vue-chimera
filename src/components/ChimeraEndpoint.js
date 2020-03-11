import NullEndpoint from '../NullEndpoint'
import Endpoint from '../Endpoint'
import * as events from '../events'
import { getServerContext } from '../utils'

export default {

  inheritAttrs: false,

  props: {
    options: {
      type: [Object, String],
      required: true
    },
    tag: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      endpoint: this.getEndpoint()
    }
  },

  beforeCreate () {
    this._ssrContext = getServerContext(this.$chimeraOptions.ssrContext)
  },

  render (h) {
    let result = this.$scopedSlots.default(this.endpoint)
    if (Array.isArray(result)) {
      result = result.concat(this.$slots.default)
    } else {
      result = [result].concat(this.$slots.default)
    }
    return this.tag ? h(this.tag, result) : result[0]
  },

  created () {
    const ep = this.endpoint
    if (this.$isServer && ep.key) {
      this.$_chimeraPromises = [ep.fetch(true).then(() => ep).catch(() => null)]
    }
  },

  mounted () {
    const ep = this.endpoint
    if (ep.auto && (!ep.data || ep.prefetch === 'override')) {
      ep.reload()
    }
  },

  methods: {
    getEndpoint () {
      let value = this.options
      if (value == null) return new NullEndpoint()
      if (typeof value === 'string') value = { url: value }

      const endpoint = new Endpoint({
        ...this.$chimeraOptions,
        ...value
      })

      Object.values(events).forEach(ev => {
        endpoint.on(ev, () => this.$emit(ev, endpoint))
      })

      if (!this._server && endpoint.key && endpoint.prefetch && this._ssrContext) {
        const initial = this._ssrContext[endpoint.key]
        if (initial) initial.prefetched = true
        Object.assign(endpoint, initial)
      }

      return endpoint
    }
  }

}
