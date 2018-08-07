import {VueChimera} from './index'
import {isPlainObject} from "./utils";
import {debounce} from 'throttle-debounce'

const DEFAULT_DEBOUNCE = 200

export default function (config) {

    return {
        beforeCreate() {

            const options = this.$options

            let _chimera
            if (!options.chimera || options._chimera)
                return

            else if (options.chimera instanceof VueChimera)
                _chimera = options.chimera

            else if (isPlainObject(options.chimera))
                _chimera = new VueChimera(options.chimera, this)

            this._chimeraWatcher = _chimera.watch()
            _chimera.subscribe(this)

            options.computed = options.computed || {}
            options.watch = options.watch || {}
            for (let key in _chimera._reactiveResources) {
                options.computed['__' + key] = _chimera._reactiveResources[key]
                options.watch['__' + key] = () => {
                    debounce(config.debounce || DEFAULT_DEBOUNCE, true, _chimera.updateReactiveResource(key))
                }
            }

            this.$chimera = _chimera.resources
            this._chimera = _chimera
        },

        mounted() {
            if (this._chimera)
                this._chimera.updateReactiveResources()
        },

        beforeDestroy() {
            if (!this._chimera) {
                return
            }

            this._chimera.unsubscribe(this)

            if (this._chimeraWatcher) {
                this._chimeraWatcher()
                delete this._chimeraWatcher
            }

            this._chimera = null
        }

    }
}