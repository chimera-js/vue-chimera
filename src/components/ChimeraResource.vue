<script>
import NullResource from "../NullResource";
import Resource from "../Resource";
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
            resource: this.getResource()
        }
    },

    beforeCreate() {
        this._ssrContext = getServerContext(this.$chimeraOptions.ssrContext)
    },

    mounted() {
        if (this.resource.autoFetch) {
            this.resource.reload()
        }
    },

    render (h) {
        let result = this.$scopedSlots.default(this.resource)
        if (Array.isArray(result)) {
            result = result.concat(this.$slots.default)
        } else {
            result = [result].concat(this.$slots.default)
        }
        return this.tag ? h(this.tag, result) : result[0]
    },

    methods: {
        getResource () {
            let value = this.options
            if (value == null) return new NullResource()
            if (typeof value === 'string') value = { url: value }

            if (!this.$chimeraOptions.axios) {
                this.$chimeraOptions.axios = createAxios()
            }

            const resource = new Resource({
                ...this.$chimeraOptions,
                ...value,
            })

            Object.values(events).forEach(ev => {
                resource.on(ev, () => this.$emit(ev, resource))
            })

            resource.on('success', () => {
                this.$nextTick(this.$forceUpdate)
            })

            if (!this._server && resource.key && resource.prefetch && this._ssrContext) {
                const initial = this._ssrContext[value.key]
                if (initial) initial.prefetched = true
                Object.assign(resource, initial)
            }

            return resource
        }
    }

}
</script>
