import Vue from 'vue'
import { EndpointDef, Endpoint } from './endpoint'

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue> {
        chimera?: {
            $options?: object,
        } & {
            [key: string]: EndpointDef | (() => EndpointDef)
        }
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        readonly $chimera: {
            $loading: Boolean,
            $cancelAll: () => void,
        } & {
            [key: string]: Endpoint
        },
    }
}
