import Axios from 'axios';
import pDebounce from 'p-debounce';
import __vue_normalize__ from 'vue-runtime-helpers/dist/normalize-component.mjs';

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
  return typeof value === 'object' && Object.prototype.toString(value) === '[object Object]';
}
const hasKey = (obj, key) => key in (obj || {});
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
function getServerContext(contextString) {
  try {
    let context = window;
    const keys = contextString.split('.');
    keys.forEach(key => {
      context = context[key];
    });
    return context;
  } catch (e) {}

  return null;
}
function noopReturn(arg) {
  return arg;
}

const SUCCESS = 'success';
const ERROR = 'error';
const CANCEL = 'cancel';
const LOADING = 'loading';
const TIMEOUT = 'timeout';

var events = /*#__PURE__*/Object.freeze({
  SUCCESS: SUCCESS,
  ERROR: ERROR,
  CANCEL: CANCEL,
  LOADING: LOADING,
  TIMEOUT: TIMEOUT
});

const {
  CancelToken
} = Axios;
const INITIAL_DATA = {
  loading: false,
  status: null,
  data: null,
  headers: null,
  error: null,
  lastLoaded: null
};
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
        request = _objectWithoutProperties(options, ["autoFetch", "prefetch", "cache", "debounce", "transformer", "axios", "key", "interval"]);

    request.method = (request.method || 'get').toLowerCase();

    if (typeof autoFetch === 'string') {
      this.autoFetch = autoFetch.toLowerCase() === request.method;
    } else {
      this.autoFetch = Boolean(autoFetch);
    }

    this.key = key;
    this.prefetch = prefetch != null ? prefetch : this.autoFetch;
    this.cache = cache;
    this.axios = axios;
    this.fetchDebounced = pDebounce(this.fetch.bind(this), debounce, {
      leading: true
    }); // Set Transformers

    this.setTransformer(transformer);

    if (request.data) {
      console.warn('[Chimera]: Do not use "params" key inside resource options, use data instead');
    }

    if (request.method !== 'get') {
      request.data = request.params;
      delete request.params;
    }

    this.request = _objectSpread({}, request, {
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

    initial && Object.assign(this, INITIAL_DATA, initial);
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
      this.emit(LOADING); // Merge extra options

      let {
        request
      } = this;

      if (isPlainObject(extraOptions)) {
        request = Object.assign({}, request, isPlainObject(extraOptions) ? {} : {});
      } // Merge extra params


      if (isPlainObject(extraParams)) {
        const paramKey = request.method === 'get' ? 'params' : 'data';
        request[paramKey] = Object.assign(request[paramKey], extraParams);
      } // Finally make request


      this.axios.request(request).then(res => {
        this.setByResponse(res);
        this.setCache(res);
        this.emit(SUCCESS);
        resolve(res);
      }).catch(err => {
        this.setByResponse(err.response);

        if (Axios.isCancel(err)) {
          this.emit(CANCEL);
        } else if (err.message && !err.response && err.message.indexOf('timeout') !== -1) {
          this.emit(TIMEOUT);
        } else {
          this.emit(ERROR);
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
    this.request.cancelToken = new CancelToken(c => {
      this._canceler = c;
    });
  }

  getCacheKey() {
    if (this.key) return this.key;
    return (typeof window !== 'undefined' && typeof btoa !== 'undefined' ? window.btoa : x => x)(this.request.url + this.request.params + this.request.data + this.request.method);
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
    Object.keys(INITIAL_DATA).forEach(key => {
      json[key] = this[key];
    });
    return json;
  }

  toString() {
    return JSON.stringify(this.toObj());
  }

  get params() {
    return this.request.method === 'get' ? this.request.params : this.request.data;
  }

  get url() {
    return this.request.url;
  }

  get method() {
    return this.request.method;
  }

}

class NullResource extends Resource {
  fetch(force) {
    return Promise.reject(new Error('Null Resource'));
  }

  cancel() {}

}

const shouldAutoFetch = r => r.autoFetch && (!r.prefetched || r.prefetch === 'override');

class VueChimera {
  constructor(vm, _ref2, _ref) {
    let resources = _extends({}, _ref2);

    let {
      deep,
      ssrContext
    } = _ref,
        options = _objectWithoutProperties(_ref, ["deep", "ssrContext"]);

    this._vm = vm;
    this._watchers = [];
    this._axios = options.axios = createAxios(options.axios);
    this._options = options;
    this._deep = deep;
    this._ssrContext = getServerContext(ssrContext);
    this._server = vm.$isServer;
    const watchOption = {
      immediate: true,
      deep: this._deep,
      sync: true
    };

    for (let key in resources) {
      if (key.charAt(0) === '$') continue;
      let r = resources[key];

      if (typeof r === 'function') {
        this._watchers.push([() => r.call(this._vm), (t, f) => this.updateResource(key, t, f), watchOption]);
      } else {
        r = resources[key] = this.resourceFrom(r);
        !this._server && shouldAutoFetch(r) && r.reload();
      }
    }

    Object.defineProperty(resources, '$cancelAll', {
      value: this.cancelAll.bind(this)
    });
    Object.defineProperty(resources, '$axios', {
      get: () => this._axios
    });
    Object.defineProperty(resources, '$loading', {
      get() {
        return !!Object.values(this).find(el => !!el.loading);
      }

    });
    this._resources = resources; // Init computeds

    const vmOptions = this._vm.$options;
    const computeds = vmOptions.computed = vmOptions.computed || {};
    Object.keys(resources).forEach(key => {
      if (hasKey(computeds, key) || hasKey(vmOptions.props, key) || hasKey(vmOptions.methods, key)) return;

      computeds[key] = () => this._resources[key];
    });
  }

  init() {
    this._watchers = this._watchers.map(w => this._vm.$watch(...w));
  }

  initServer() {
    this._vm.$_chimeraPromises = [];
    Object.values(this._resources).forEach(r => {
      if (r.prefetch) {
        if (!r.key) {
          console.warn('[Chimera]: used prefetch with no key associated with resource!');
          return;
        }

        this._vm.$_chimeraPromises.push(r.fetch(true).catch(() => null).then(() => r));
      }
    });
  }

  updateResource(key, newValue, oldValue) {
    const oldResource = this._resources[key];
    const newResource = this.resourceFrom(newValue, oldValue && oldValue.keepData ? oldResource.toObj() : null);

    if (oldValue && oldResource) {
      oldResource.stopInterval();
      newResource.lastLoaded = oldResource.lastLoaded;
    }

    if (!this._server) {
      if (newValue.interval) {
        newResource.startInterval(newValue.interval);
      }

      if (shouldAutoFetch(newResource)) newResource.reload();
    }

    this._vm.$set(this._resources, key, newResource);
  }

  resourceFrom(value, initial) {
    if (value == null) return new NullResource();
    if (typeof value === 'string') value = {
      url: value
    };

    if (isPlainObject(value.on)) {
      Object.entries(value.on).forEach(([event, handler]) => {
        if (typeof handler === 'function') {
          handler = handler.bind(this._vm);
        }

        if (typeof handler === 'string') handler = this._vm[handler];
        value.on[event] = handler;
      });
    }

    const baseOptions = Object.create(this._options);
    const r = new Resource(Object.assign(baseOptions, value), initial);

    if (!this._server && !initial && r.key && r.prefetch && this._ssrContext) {
      initial = this._ssrContext[value.key];
      if (initial) initial.prefetched = true;
      Object.assign(r, initial);
    }

    return r;
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
    let chimera; // Stop if instance doesn't have chimera or already initialized

    if (!vmOptions.chimera || vmOptions._chimera) return;

    if (typeof vmOptions.chimera === 'function') {
      // Initialize with function
      vmOptions.chimera = vmOptions.chimera.call(this);
    }

    if (vmOptions.chimera instanceof VueChimera) {
      chimera = vmOptions.chimera;
    } else if (isPlainObject(vmOptions.chimera)) {
      const _vmOptions$chimera = vmOptions.chimera,
            {
        $options
      } = _vmOptions$chimera,
            resources = _objectWithoutProperties(_vmOptions$chimera, ["$options"]);

      chimera = new VueChimera(this, resources, _objectSpread({}, options, $options));
    }

    this._chimera = chimera;
    Object.defineProperty(this, '$chimera', {
      get: () => chimera._resources
    });
  },

  data() {
    if (!this._chimera) return {};
    return {
      $chimera: this._chimera._resources
    };
  },

  created() {
    if (!this._chimera) return;

    this._chimera.init();

    this.$isServer && this._chimera.initServer();
  },

  serverPrefetch(...args) {
    if (!this.$_chimeraPromises) return;

    const ChimeraSSR = require('../ssr/index');

    return Promise.all(this.$_chimeraPromises).then(results => {
      results.forEach(r => {
        r && ChimeraSSR.addResource(r);
      });
    });
  }

}));

var script = {
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

  data() {
    return {
      resource: this.getResource()
    };
  },

  beforeCreate() {
    this._ssrContext = getServerContext(this.$chimeraOptions.ssrContext);
  },

  mounted() {
    if (this.resource.autoFetch) {
      this.resource.reload();
    }
  },

  render(h) {
    let result = this.$scopedSlots.default(this.resource);

    if (Array.isArray(result)) {
      result = result.concat(this.$slots.default);
    } else {
      result = [result].concat(this.$slots.default);
    }

    return this.tag ? h(this.tag, result) : result[0];
  },

  methods: {
    getResource() {
      let value = this.options;
      if (value == null) return new NullResource();
      if (typeof value === 'string') value = {
        url: value
      };

      if (!this.$chimeraOptions.axios) {
        this.$chimeraOptions.axios = createAxios();
      }

      const resource = new Resource(_objectSpread({}, this.$chimeraOptions, value));
      Object.values(events).forEach(ev => {
        resource.on(ev, () => this.$emit(ev, resource));
      });
      resource.on('success', () => {
        this.$nextTick(this.$forceUpdate);
      });

      if (!this._server && resource.key && resource.prefetch && this._ssrContext) {
        const initial = this._ssrContext[value.key];
        if (initial) initial.prefetched = true;
        Object.assign(resource, initial);
      }

      return resource;
    }

  }
};

/* script */
const __vue_script__ = script;
/* template */

/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = undefined;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = __vue_normalize__({}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

class MemoryCache {
  constructor(expiration) {
    this.expiration = expiration || 1000 * 60;
    this._store = {};
  }
  /**
     *
     * @param key         Key for the cache
     * @param value       Value for cache persistence
     * @param expiration  Expiration time in milliseconds
     */


  setItem(key, value, expiration) {
    this._store[key] = {
      expiration: Date.now() + (expiration || this.expiration),
      value
    };
  }
  /**
     * If Cache exists return the Parsed Value, If Not returns {null}
     *
     * @param key
     */


  getItem(key) {
    let item = this._store[key];

    if (item && item.value && Date.now() <= item.expiration) {
      return item.value;
    }

    console.log('sss');
    this.removeItem(key);
    return null;
  }

  removeItem(key) {
    delete this._store[key];
  }

  keys() {
    return Object.keys(this._store);
  }

  all() {
    return this.keys().reduce((obj, str) => {
      obj[str] = this._store.getItem(str);
      return obj;
    }, {});
  }

  length() {
    return this.keys().length;
  }

  clearCache() {
    this._store = {};
  }

}

class StorageCache extends MemoryCache {
  constructor(key, expiration, sessionStorage = false) {
    super(expiration);
    this.key = key;
    const storage = sessionStorage ? 'sessionStorage' : 'localStorage';

    if (typeof window === 'undefined' || !window[storage]) {
      throw Error(`StorageCache: ${storage} is not available.`);
    } else {
      this.storage = window[storage];
    }

    try {
      this._store = JSON.parse(this.storage.getItem(key)) || {};
    } catch (e) {
      this.clearCache();
      this._store = {};
    }
  }

  setItem(key, value, expiration) {
    super.setItem(key, value, expiration);
    this.storage.setItem(this.key, JSON.stringify(this._store));
  }

  clearCache() {
    this.storage.removeItem(this.key);
  }

}

const plugin = {
  options: {
    axios: null,
    cache: null,
    debounce: 50,
    deep: true,
    keepData: true,
    autoFetch: 'get',
    // false, true, '%METHOD%',
    prefetch: false,
    prefetchTimeout: 4000,
    transformer: null,
    ssrContext: null
  },

  install(Vue, options = {}) {
    Object.keys(options).forEach(key => {
      if (key in this.options) {
        this.options[key] = options[key];
      }
    });
    Vue.mixin(mixin(this.options));
    Vue.component('chimera-resource', __vue_component__);
    Vue.prototype.$chimeraOptions = this.options;
  }

}; // Auto-install

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
export { CANCEL, ERROR, LOADING, MemoryCache, SUCCESS, StorageCache, TIMEOUT };
