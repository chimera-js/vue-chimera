<script>
import NullEndpoint from "../NullEndpoint";
import Endpoint from "../Endpoint";
import * as events from "../events"
import { getServerContext, createAxios } from "../utils";

export default {

    inheritAttrs: false,

    props: {
        options: {
            type: [Object, String],
            required: true,
        },
        tag: {
            type: String,
            default: null,
        }
    },

    data () {
        return {
            endpoint: this.getEndpoint()
        }
    },

    beforeCreate() {
        this._ssrContext = getServerContext(this.$chimeraOptions.ssrContext)
    },

    mounted() {
        if (this.endpoint.autoFetch) {
            this.endpoint.reload()
        }
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

    methods: {
        getEndpoint () {
            let value = this.options
            if (value == null) return new NullEndpoint()
            if (typeof value === 'string') value = { url: value }

            if (!this.$chimeraOptions.axios) {
                this.$chimeraOptions.axios = createAxios()
            }

            const endpoint = new Endpoint({
                ...this.$chimeraOptions,
                ...value,
            })

            Object.values(events).forEach(ev => {
                endpoint.on(ev, () => this.$emit(ev, endpoint))
            })

            endpoint.on('success', () => {
                this.$nextTick(this.$forceUpdate)
            })

            if (!this._server && endpoint.key && endpoint.prefetch && this._ssrContext) {
                const initial = this._ssrContext[value.key]
                if (initial) initial.prefetched = true
                Object.assign(endpoint, initial)
            }

            return endpoint
        }
    }

}
</script>
