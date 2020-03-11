import './vue'
import Vue, { PluginFunction, PluginObject } from 'vue'

export default class VueChimera implements PluginObject<{}>{
    [key: string]: any
    install: PluginFunction<{}>

    static install(vue: typeof Vue, options?:{} | undefined): void
}
