import 'vue';
import Axios from 'axios';
import pDebounce from 'p-debounce';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function isPlainObject(value) {
  const OBJECT_STRING = '[object Object]';
  return typeof value === 'object' && Object.prototype.toString(value) === OBJECT_STRING;
}
function mergeExistingKeys(...obj) {
  let o = Object.assign(...obj);
  return Object.keys(obj[0]).reduce((carry, item) => {
    carry[item] = o[item];
    return carry;
  }, {});
}
function createAxios(config) {
  if (config instanceof Axios) {
    return config;
  } // Support nuxt axios


  if (config && typeof config.$request === 'function') {
    return config;
  }

  if (isPlainObject(config)) {
    return Axios.create(config);
  }

  if (typeof config === 'function') {
    if (typeof config.request === 'function') return config;
    let axios = config();
    if (axios instanceof Axios) return axios;
  }

  return Axios;
}
function noopReturn(arg) {
  return arg;
}

const {
  CancelToken
} = Axios;
const EVENT_SUCCESS = 'success';
const EVENT_ERROR = 'error';
const EVENT_CANCEL = 'cancel';
const EVENT_LOADING = 'loading';
const EVENT_TIMEOUT = 'timeout';
class Resource {
  constructor(options, initial) {
    if (typeof options === 'string') options = {
      url: options
    };

    let {
      autoFetch,
      prefetch,
      cache,
      debounce,
      transformer,
      axios,
      key,
      interval
    } = options,
        requestConfig = _objectWithoutProperties(options, ["autoFetch", "prefetch", "cache", "debounce", "transformer", "axios", "key", "interval"]);

    requestConfig.method = (requestConfig.method || 'get').toLowerCase();

    if (typeof autoFetch === 'string') {
      this.autoFetch = autoFetch.toLowerCase() === requestConfig.method;
    } else {
      this.autoFetch = Boolean(prefetch);
    }

    this.key = key;
    this.prefetch = typeof prefetch === 'boolean' ? prefetch : this.autoFetch;
    this.cache = cache;
    this.axios = axios;
    this.fetchDebounced = pDebounce(this.fetch.bind(this), debounce, {
      leading: true
    });
    this._interval = interval; // Set Transformers

    this.setTransformer(transformer);

    if (requestConfig.data) {
      console.warn('[Chimera]: Do not use "params" key inside resource options, use data instead');
    }

    if ('params' in options && !isPlainObject(options.params)) {
      throw new Error('[Chimera]: Parameters is not a plain object');
    }

    if (requestConfig.method !== 'get') {
      requestConfig.data = requestConfig.params;
      delete requestConfig.params;
    }

    this.requestConfig = _objectSpread({}, requestConfig, {
      cancelToken: new CancelToken(c => {
        this._canceler = c;
      })
    });
    this._listeners = {};
    this.prefetched = false; // Set Events

    if (isPlainObject(options.on)) {
      for (let key in options.on) {
        this.on(key, options.on[key]);
      }
    }

    this.setInitial(initial);
  }

  setTransformer(transformer) {
    if (typeof transformer === 'function') {
      this.responseTransformer = transformer;
      this.errorTransformer = transformer;
    } else if (isPlainObject('object')) {
      const {
        response,
        error
      } = transformer;
      this.responseTransformer = response || noopReturn;
      this.errorTransformer = error || noopReturn;
    } else {
      this.responseTransformer = noopReturn;
      this.errorTransformer = noopReturn;
    }
  }

  setInitial(data) {
    Object.assign(this, mergeExistingKeys({
      loading: false,
      status: null,
      data: null,
      headers: null,
      error: null,
      lastLoaded: null
    }, data || {}));
  }

  on(event, handler) {
    let listeners = this._listeners[event] || [];
    listeners.push(handler);
    this._listeners[event] = listeners;
    return this;
  }

  emit(event) {
    (this._listeners[event] || []).forEach(handler => {
      handler(this, event);
    });
  }

  fetch(force, extraParams, extraOptions) {
    return new Promise((resolve, reject) => {
      if (this.cache && !force) {
        let cacheValue = this.getCache();

        if (cacheValue) {
          this.setByResponse(cacheValue);
          return resolve(cacheValue);
        }
      }

      this.loading = true;
      this.emit(EVENT_LOADING); // Merge extra options

      let {
        requestConfig
      } = this;

      if (isPlainObject(extraOptions)) {
        requestConfig = Object.assign({}, requestConfig, isPlainObject(extraOptions) ? {} : {});
      } // Merge extra params


      if (isPlainObject(extraParams)) {
        const paramKey = requestConfig.method === 'get' ? 'params' : 'data';
        requestConfig[paramKey] = Object.assign(requestConfig[paramKey], extraParams);
      } // Finally make request


      this.axios.request(requestConfig).then(res => {
        this.setByResponse(res);
        this.setCache(res);
        this.emit(EVENT_SUCCESS);
        resolve(res);
      }).catch(err => {
        this.setByResponse(err.response);

        if (Axios.isCancel(err)) {
          this.emit(EVENT_CANCEL);
        } else if (err.message && !err.response && err.message.indexOf('timeout') !== -1) {
          this.emit(EVENT_TIMEOUT);
        } else {
          this.emit(EVENT_ERROR);
        }

        reject(err);
      }).finally(() => {
        this.loading = false;
      });
    });
  }

  reload(force) {
    return this.fetchDebounced(force);
  }

  send(params, options) {
    return this.fetchDebounced(true, params, options);
  }

  cancel(unload) {
    if (unload) this.data = null;
    if (typeof this._canceler === 'function') this._canceler();
    this.requestConfig.cancelToken = new CancelToken(c => {
      this._canceler = c;
    });
  }

  getCacheKey() {
    if (this.key) return this.key;
    return (typeof window !== 'undefined' && typeof btoa !== 'undefined' ? window.btoa : x => x)(this.requestConfig.url + this.requestConfig.params + this.requestConfig.data + this.requestConfig.method);
  }

  getCache() {
    return this.cache ? this.cache.getItem(this.getCacheKey()) : undefined;
  }

  setCache(value) {
    this.cache && this.cache.setItem(this.getCacheKey(), value);
  }

  deleteCache() {
    this.cache && this.cache.removeItem(this.getCacheKey());
  }

  setByResponse(res) {
    res = res || {};
    const isSuccessful = String(res.status).charAt(0) === '2';
    this.status = res.status;
    this.headers = res.headers || {};
    this.lastLoaded = new Date();
    this.data = isSuccessful ? this.responseTransformer(res.data, this) : null;
    this.error = !isSuccessful ? this.errorTransformer(res.data, this) : null;
  }

  startInterval(ms) {
    if (typeof ms !== 'number') throw new Error('[Chimera]: interval should be number');
    if (typeof process !== 'undefined' && process.server) return;
    this._interval = ms;
    this.stopInterval();
    this._interval_id = setInterval(() => this.reload(true), this._interval);
    this.looping = true;
  }

  stopInterval() {
    if (this._interval_id) {
      clearInterval(this._interval_id);
      this.looping = false;
      this._interval_id = null;
      this._interval = false;
    }
  }

  toObj() {
    const json = {};
    ['loading', 'status', 'data', 'headers', 'error', 'lastLoaded', 'prefetched'].forEach(key => {
      json[key] = this[key];
    });
    return json;
  }

  toString() {
    return JSON.stringify(this.toObj());
  }

}

class NullResource extends Resource {
  fetch(force) {
    return Promise.reject(new Error('Null Resource'));
  }

  cancel() {}

}

class VueChimera {
  constructor(vm, resources, _ref) {
    let options = _extends({}, _ref);

    this._vm = vm;
    this._watchers = [];
    this._axios = options.axios = createAxios(options.axios);
    this._options = options;
    this._resources = resources; // this._vm.$on('hook:created', this.init)
  }

  init() {
    const resources = this._resources = Object.assign({}, this._resources);

    for (let key in resources) {
      if (key.charAt(0) === '$') continue;
      let r = resources[key];

      if (typeof r === 'function') {
        this._watchers.push(this._vm.$watch(() => r.call(this._vm), (t, f) => this.updateResource(key, t, f), {
          immediate: true,
          deep: true
        }));
      } else {
        resources[key] = this.resourceFrom(r, key);
      }

      Object.defineProperty(this._vm, key, {
        get: () => resources[key],
        configurable: true,
        enumerable: true
      });
    }

    Object.defineProperty(resources, '$cancelAll', {
      value: this.cancelAll.bind(this)
    });
    Object.defineProperty(resources, '$axios', {
      get: () => this._axios
    });
    Object.defineProperty(resources, '$loading', {
      get() {
        return !!Object.values(this).find(Boolean);
      }

    });
  }

  updateResource(key, newValue, oldValue) {
    const oldResource = this._resources[key];
    const newResource = this.resourceFrom(newValue, key); // Keep data

    if (oldValue && oldValue.keepData) {
      newResource.setInitial(oldResource);
    }

    if (oldValue && oldResource) {
      oldResource.stopInterval();
      newResource.lastLoaded = oldResource.lastLoaded;
    }

    if (newResource.prefetch) newResource.reload();
    this._resources[key] = newResource;
  }

  resourceFrom(value, key) {
    if (value == null) return new NullResource();
    if (typeof value === 'string') value = {
      url: value
    };
    return new Resource(Object.assign(Object.create(this._options), value));
  }

  cancelAll() {
    Object.values(this._resources).forEach(r => {
      r.cancel();
    });
  }

  destroy() {
    const vm = this._vm;
    this.cancelAll();
    delete vm._chimera;
  }

}

var mixin = ((options = {}) => ({
  beforeCreate() {
    const vmOptions = this.$options;

    let _chimera; // Stop if instance doesn't have chimera or already initialized


    if (!vmOptions.chimera || vmOptions._chimera) return;

    if (typeof vmOptions.chimera === 'function') {
      // Initialize with function
      vmOptions.chimera = vmOptions.chimera.call(this);
    }

    if (vmOptions.chimera instanceof VueChimera) {
      _chimera = vmOptions.chimera;
    } else if (isPlainObject(vmOptions.chimera)) {
      const _vmOptions$chimera = vmOptions.chimera,
            {
        $options
      } = _vmOptions$chimera,
            resources = _objectWithoutProperties(_vmOptions$chimera, ["$options"]);

      _chimera = new VueChimera(this, resources, _objectSpread({}, options, $options));
    } // Nuxtjs prefetch


    const NUXT = typeof process !== 'undefined' && process.server && this.$ssrContext ? this.$ssrContext.nuxt : typeof window !== 'undefined' ? window.__NUXT__ : null;

    if (_chimera && NUXT && NUXT.chimera) {
      try {
        if (this.$router) {
          let matched = this.$router.match(this.$router.currentRoute.fullPath);
          (matched ? matched.matched : []).forEach((m, i) => {
            let nuxtChimera = NUXT.chimera[i];

            if (nuxtChimera) {
              Object.keys(_chimera.resources).forEach(key => {
                let localResource = _chimera.resources[key];
                let ssrResource = nuxtChimera[key];

                if (localResource && ssrResource && ssrResource._data) {
                  ['_data', '_status', '_headers', 'ssrPrefetched', '_lastLoaded'].forEach(key => {
                    localResource[key] = ssrResource[key];
                  });
                }
              });
            }
          }); // if (process.client) {
          //   delete NUXT.chimera
          // }
        }
      } catch (e) {}
    }

    this._chimera = _chimera;
  },

  data() {
    return {
      $chimera: this._chimera ? this._chimera._resources : null
    };
  },

  created() {
    if (!this._chimera) return;

    this._chimera.init();
  } // mounted () {
  //   if (this._chimera) {
  //     this._chimera.updateReactiveResources()
  //     for (let r in this._chimera.resources) {
  //       let resource = this._chimera.resources[r]
  //       if (resource.prefetch && (!resource.ssrPrefetched || resource.ssrPrefetch === 'override')) {
  //         resource.reload()
  //       }
  //     }
  //   }
  // },


}));

function NuxtPlugin () {
  this.options = this.options || {};
  const baseOptions = this.options;
  return function ({
    beforeNuxtRender,
    isDev,
    $axios
  }) {
    if (!beforeNuxtRender) {
      return;
    }

    const cancelTokens = [];

    async function prefetchAsyncData({
      Components,
      nuxtState
    }) {
      nuxtState.chimera = nuxtState.chimera || {};

      for (let i = 0, len = Components.length; i < len; i++) {
        let component = Components[i];
        let chimera = component.options ? component.options.chimera : null;

        if (typeof chimera === 'function') {
          // Append @Nuxtjs/axios to component (maybe needed by constructor)
          if ($axios && !component.$axios) component.$axios = $axios;
          chimera = chimera.bind(component)();
        }

        if (!chimera) {
          continue;
        }

        const nuxtChimera = {};

        const {
          $options
        } = chimera,
              resources = _objectWithoutProperties(chimera, ["$options"]);

        const options = Object.assign({}, baseOptions, $options);
        if (!options.axios) options.axios = $axios;

        for (let key in resources) {
          let resource = resources[key];

          if (resource && typeof resource !== 'function') {
            resource = resource && resource._data ? resource : Resource.from(resource, options);
            cancelTokens.push(resource.cancel.bind(resource));
            if (!resource.prefetch || !resource.ssrPrefetch) continue;

            try {
              isDev && console.log('  Prefetching: ' + resource.requestConfig.url); // eslint-disable-line no-console

              let response = await resource.execute();
              resource._data = response.data;
            } catch (err) {
              isDev && console.error(err.message); // eslint-disable-line no-console
            }

            resource.ssrPrefetched = true;
            resources[key] = nuxtChimera[key] = resource;
          }
        }

        if (Object.keys(nuxtChimera).length) {
          nuxtState.chimera[i] = nuxtChimera;
        }
      }
    }

    beforeNuxtRender((...args) => {
      return new Promise((resolve, reject) => {
        prefetchAsyncData(...args).then(resolve).catch(reject);
        setTimeout(reject, baseOptions.ssrPrefetchTimeout, new Error('  SSR Prefetch Timeout.'));
      }).catch(err => {
        for (let cancel of cancelTokens) if (typeof cancel === 'function') cancel();

        isDev && console.error(err.message); // eslint-disable-line no-console
      });
    });
  };
}

const plugin = {
  options: {
    axios: null,
    cache: null,
    debounce: 50,
    autoFetch: 'get',
    // false, true, '%METHOD%',
    prefetch: null,
    prefetchTimeout: 4000,
    transformer: null
  },

  install(Vue, options = {}) {
    Object.keys(options).forEach(key => {
      if (key in this.options) {
        this.options[key] = options[key];
      }
    });

    if (!Vue.prototype.hasOwnProperty('$chimera')) {
      Object.defineProperty(Vue.prototype, '$chimera', {
        get() {
          return this._chimera ? this._chimera._resources : null;
        }

      });
    }

    Vue.mixin(mixin(this.options));
  },

  NuxtPlugin // Auto-install

};
let GlobalVue = null;

if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}

if (GlobalVue) {
  GlobalVue.use(plugin, plugin.options);
}

export default plugin;
export { EVENT_CANCEL, EVENT_ERROR, EVENT_LOADING, EVENT_SUCCESS, EVENT_TIMEOUT };
