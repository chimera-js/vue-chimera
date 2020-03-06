(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('axios')) :
  typeof define === 'function' && define.amd ? define(['exports', 'axios'], factory) :
  (global = global || self, factory(global['vue-chimera'] = {}, global.Axios));
}(this, function (exports, Axios) { 'use strict';

  var Axios__default = 'default' in Axios ? Axios['default'] : Axios;

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

  var pDebounce = (fn, wait, opts) => {
  	if (!Number.isFinite(wait)) {
  		throw new TypeError('Expected `wait` to be a finite number');
  	}

  	opts = opts || {};

  	let leadingVal;
  	let timer;
  	let resolveList = [];

  	return function () {
  		const ctx = this;
  		const args = arguments;

  		return new Promise(resolve => {
  			const runImmediately = opts.leading && !timer;

  			clearTimeout(timer);

  			timer = setTimeout(() => {
  				timer = null;

  				const res = opts.leading ? leadingVal : fn.apply(ctx, args);

  				for (resolve of resolveList) {
  					resolve(res);
  				}

  				resolveList = [];
  			}, wait);

  			if (runImmediately) {
  				leadingVal = fn.apply(ctx, args);
  				resolve(leadingVal);
  			} else {
  				resolveList.push(resolve);
  			}
  		});
  	};
  };

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

  function isPlainObject(value) {
    return typeof value === 'object' && value && Object.prototype.toString(value) === '[object Object]';
  }
  function mergeExistingKeys(...obj) {
    let o = Object.assign({}, ...obj);
    return Object.keys(obj[0]).reduce((carry, item) => {
      carry[item] = o[item];
      return carry;
    }, {});
  }
  const hasKey = (obj, key) => key in (obj || {});
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
  function warn(arg, ...args) {
    // eslint-disable-next-line no-console
    console.warn('[Chimera]: ' + arg, ...args);
  }

  function createAxios(config) {
    if (typeof config === 'function') {
      if (typeof config.request === 'function') return config;
      return config();
    }

    if (isPlainObject(config)) {
      return Axios__default.create(config);
    }

    return Axios__default;
  }

  var axiosAdapter = {
    request(request, endpoint) {
      const axios = endpoint.axios ? createAxios(endpoint.axios) : Axios__default;
      return axios.request(_objectSpread({}, request, {
        cancelToken: new Axios.CancelToken(c => {
          endpoint._canceler = c;
        })
      }));
    },

    cancel(endpoint) {
      if (typeof endpoint._canceler === 'function') endpoint._canceler();
      endpoint._canceler = null;
    },

    isCancelError(err) {
      return Axios__default.isCancel(err);
    }

  };

  const INITIAL_RESPONSE = {
    status: null,
    data: null,
    headers: null,
    error: null,
    lastLoaded: null
  };
  const INITIAL_REQUEST = {
    url: null,
    baseURL: null,
    method: 'get',
    params: null,
    timeout: 0,
    headers: null
  };
  class Endpoint {
    constructor(opts, initial) {
      if (typeof opts === 'string') opts = {
        url: opts,
        key: opts
      };

      if (!opts) {
        warn('Invalid options', opts);
        throw new Error('[Chimera]: invalid options');
      }

      let {
        debounce,
        transformer,
        interval,
        on: listeners
      } = opts,
          options = _objectWithoutProperties(opts, ["debounce", "transformer", "interval", "on"]);

      options.method = (options.method || 'get').toLowerCase();
      this.fetchDebounced = debounce !== false ? pDebounce(this.fetch.bind(this), debounce || 50, {
        leading: true
      }) : this.fetch; // Set Transformers

      this.setTransformer(transformer);
      this.prefetched = false;
      this.loading = false; // Set Events

      this.listeners = {};

      if (isPlainObject(listeners)) {
        for (const key in listeners) {
          this.on(key, listeners[key]);
        }
      }

      Object.assign(this, options); // Handle type on auto

      if (typeof this.auto === 'string') {
        this.auto = this.auto.toLowerCase() === this.method;
      } else {
        this.auto = Boolean(this.auto);
      }

      this.prefetch = this.prefetch != null ? this.prefetch : this.auto;
      Object.assign(this, INITIAL_RESPONSE, initial || {});
      this.http = axiosAdapter;
      interval && this.startInterval(interval);
    }

    setTransformer(transformer) {
      if (typeof transformer === 'function') {
        this.responseTransformer = transformer;
        this.errorTransformer = transformer;
      } else if (isPlainObject(transformer)) {
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
      let listeners = this.listeners[event] || [];
      listeners.push(handler);
      this.listeners[event] = listeners;
      return this;
    }

    emit(event) {
      (this.listeners[event] || []).forEach(handler => {
        handler(this, event);
      });
    }

    fetch(force, extraOptions) {
      return new Promise((resolve, reject) => {
        if (this.cache && !force) {
          let cacheValue = this.getCache();

          if (cacheValue) {
            this.setResponse(cacheValue);
            return resolve(cacheValue);
          }
        }

        this.loading = true;
        this.emit(LOADING);
        let {
          request
        } = this;

        if (isPlainObject(extraOptions)) {
          // Merge extra options
          if (extraOptions.params) {
            extraOptions.params = Object.assign({}, request.params, extraOptions.params);
          }

          request = Object.assign({}, request, extraOptions);
        } // Finally make request


        this.http.request(request, this).then(res => {
          this.loading = false;
          this.setResponse(res);
          this.setCache(res);
          this.emit(SUCCESS);
          resolve(res);
        }).catch(err => {
          this.loading = false;
          this.setResponse(err.response);

          if (this.http.isCancelError(err)) {
            this.emit(CANCEL);
          } else {
            if (err.message && !err.response && err.message.indexOf('timeout') !== -1) {
              this.emit(TIMEOUT);
            }

            this.emit(ERROR);
          }

          reject(err);
        });
      });
    }

    reload(force) {
      return this.fetchDebounced(force);
    }

    send(params) {
      return this.fetchDebounced(true, {
        params
      });
    }

    cancel() {
      this.http.cancel(this);
    }

    getCacheKey() {
      if (this.key) return this.key;
      return (typeof window !== 'undefined' && typeof btoa !== 'undefined' ? window.btoa : x => x)(Object.values(this.request).join(':'));
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

    setResponse(res) {
      res = res || {};
      const isSuccessful = String(res.status).charAt(0) === '2';
      this.status = res.status;
      this.headers = res.headers || {};
      this.lastLoaded = new Date();
      this.data = isSuccessful ? this.responseTransformer(res.data, this) : null;
      this.error = !isSuccessful ? this.errorTransformer(res.data, this) : null;
    }

    startInterval(ms) {
      /* istanbul ignore if */
      if (typeof ms !== 'number') throw new Error('[Chimera]: interval should be number');
      /* istanbul ignore if */

      if (typeof process !== 'undefined' && process.server) return;
      this._interval = ms;
      this.stopInterval();
      this._interval_id = setInterval(() => this.reload(true), this._interval);
    }

    stopInterval() {
      if (this._interval_id) {
        clearInterval(this._interval_id);
        this._interval_id = null;
        this._interval = false;
      }
    }

    get looping() {
      return !!this._interval;
    }

    get request() {
      return mergeExistingKeys(INITIAL_REQUEST, this, {
        baseURL: this.baseURL,
        timeout: this.timeout,
        headers: this.headers
      });
    }

    get response() {
      return mergeExistingKeys(INITIAL_RESPONSE, this);
    }

    toString() {
      return JSON.stringify(this.response);
    }

  }

  class NullEndpoint extends Endpoint {
    constructor() {
      super({});
    }

    fetch(force) {
      return Promise.reject(new Error('[Chimera]: Fetching null endpoint'));
    }

    cancel() {}

  }

  const shouldAutoFetch = r => r.auto && (!r.prefetched || r.prefetch === 'override');

  class VueChimera {
    constructor(vm, _ref2, _ref) {
      let endpoints = _extends({}, _ref2);

      let {
        deep,
        ssrContext
      } = _ref,
          options = _objectWithoutProperties(_ref, ["deep", "ssrContext"]);

      this._vm = vm;
      this._watchers = [];
      this.LocalEndpoint = class extends Endpoint {};
      Object.assign(this.LocalEndpoint.prototype, options);
      this._deep = deep;
      this._ssrContext = getServerContext(ssrContext);
      this._server = vm.$isServer;
      const watchOption = {
        immediate: true,
        deep: this._deep,
        sync: true
      };

      for (let key in endpoints) {
        if (key.charAt(0) === '$') {
          delete endpoints[key];
          continue;
        }

        let r = endpoints[key];

        if (typeof r === 'function') {
          this._watchers.push([() => r.call(this._vm), (t, f) => this.updateEndpoint(key, t, f), watchOption]);
        } else {
          r = endpoints[key] = this.endpointFrom(r);

          if (!this._server) {
            shouldAutoFetch(r) && r.reload();
          }
        }
      }

      Object.defineProperty(endpoints, '$cancelAll', {
        value: () => this.cancelAll()
      });
      Object.defineProperty(endpoints, '$loading', {
        get() {
          return !!Object.values(this).find(el => !!el.loading);
        }

      });
      this.endpoints = endpoints; // Init computeds

      const vmOptions = this._vm.$options;
      const computeds = vmOptions.computed = vmOptions.computed || {};
      Object.keys(endpoints).forEach(key => {
        if (hasKey(computeds, key) || hasKey(vmOptions.props, key) || hasKey(vmOptions.methods, key)) return;

        computeds[key] = () => this.endpoints[key];
      });
    }

    init() {
      this._watchers = this._watchers.map(w => this._vm.$watch(...w));
    }

    initServer() {
      this._vm.$_chimeraPromises = [];
      Object.values(this.endpoints).forEach(endpoint => {
        if (endpoint.prefetch) {
          if (!endpoint.key) {
            warn('used prefetch with no key associated with endpoint!');
            return;
          }

          this._vm.$_chimeraPromises.push(endpoint.fetch(true, {
            timeout: endpoint.prefetchTimeout
          }).then(() => endpoint).catch(() => null));
        }
      });
    }

    updateEndpoint(key, newValue, oldValue) {
      const oldEndpoint = this.endpoints[key];
      const newEndpoint = this.endpointFrom(newValue, oldValue && oldValue.keepData ? oldEndpoint.toObj() : null);

      if (oldValue && oldEndpoint) {
        oldEndpoint.stopInterval();
        newEndpoint.lastLoaded = oldEndpoint.lastLoaded;
      }

      if (!this._server) {
        if (shouldAutoFetch(newEndpoint)) newEndpoint.reload();
      }

      this._vm.$set(this.endpoints, key, newEndpoint);
    }

    endpointFrom(value, initial) {
      if (value == null) return new NullEndpoint();
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

      const endpoint = new this.LocalEndpoint(value, initial);

      if (!this._server && !initial && endpoint.key && endpoint.prefetch && this._ssrContext) {
        initial = this._ssrContext[value.key];
        if (initial) initial.prefetched = true;
        Object.assign(endpoint, initial);
      }

      return endpoint;
    }

    cancelAll() {
      Object.values(this.endpoints).forEach(r => {
        r.cancel();
      });
    }

    destroy() {
      const vm = this._vm;
      this.cancelAll();
      Object.values(this.endpoints).forEach(r => {
        r.stopInterval();
      });
      delete vm._chimera;
    }

  }

  var mixin = ((options = {}) => ({
    beforeCreate() {
      const vmOptions = this.$options;
      let chimera; // Stop if instance doesn't have chimera or already initialized

      /* istanbul ignore if */

      if (!vmOptions.chimera || vmOptions._chimera) return;

      if (typeof vmOptions.chimera === 'function') {
        // Initialize with function
        vmOptions.chimera = vmOptions.chimera.call(this);
      }
      /* istanbul ignore else */


      if (isPlainObject(vmOptions.chimera)) {
        const _vmOptions$chimera = vmOptions.chimera,
              {
          $options
        } = _vmOptions$chimera,
              endpoints = _objectWithoutProperties(_vmOptions$chimera, ["$options"]);

        chimera = new VueChimera(this, endpoints, _objectSpread({}, options, $options));
      } else {
        throw new Error('[Chimera]: chimera options should be an object or a function that returns object');
      }

      this._chimera = chimera;

      if (!Object.prototype.hasOwnProperty.call(this, '$chimera')) {
        Object.defineProperty(this, '$chimera', {
          get: () => chimera.endpoints
        });
      }
    },

    data() {
      /* istanbul ignore if */
      if (!this._chimera) return {};
      return {
        $chimera: this._chimera.endpoints
      };
    },

    created() {
      /* istanbul ignore if */
      if (!this._chimera) return;

      this._chimera.init();

      this.$isServer && this._chimera.initServer();
    },

    beforeDestroy() {
      /* istanbul ignore if */
      if (!this._chimera) return;

      this._chimera.destroy();
    },

    serverPrefetch(...args) {
      /* istanbul ignore if */
      if (!this.$_chimeraPromises) return;

      const ChimeraSSR = require('../ssr/index');

      return Promise.all(this.$_chimeraPromises).then(results => {
        results.forEach(endpoint => {
          endpoint && ChimeraSSR.addEndpoint(endpoint);
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
        endpoint: this.getEndpoint()
      };
    },

    beforeCreate() {
      this._ssrContext = getServerContext(this.$chimeraOptions.ssrContext);
    },

    render(h) {
      let result = this.$scopedSlots.default(this.endpoint);

      if (Array.isArray(result)) {
        result = result.concat(this.$slots.default);
      } else {
        result = [result].concat(this.$slots.default);
      }

      return this.tag ? h(this.tag, result) : result[0];
    },

    created() {
      const ep = this.endpoint;

      if (this.$isServer && ep.key) {
        this.$_chimeraPromises = [ep.fetch(true).then(() => ep).catch(() => null)];
      }
    },

    mounted() {
      const ep = this.endpoint;

      if (ep.auto && (!ep.data || ep.prefetch === 'override')) {
        ep.reload();
      }
    },

    methods: {
      getEndpoint() {
        let value = this.options;
        if (value == null) return new NullEndpoint();
        if (typeof value === 'string') value = {
          url: value
        };
        const endpoint = new Endpoint(_objectSpread({}, this.$chimeraOptions, value));
        Object.values(events).forEach(ev => {
          endpoint.on(ev, () => this.$emit(ev, endpoint));
        });

        if (!this._server && endpoint.key && endpoint.prefetch && this._ssrContext) {
          const initial = this._ssrContext[endpoint.key];
          if (initial) initial.prefetched = true;
          Object.assign(endpoint, initial);
        }

        return endpoint;
      }

    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }
  //# sourceMappingURL=normalize-component.mjs.map

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

  const __vue_component__ = normalizeComponent({}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

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
        obj[str] = this._store[str];
        return obj;
      }, {});
    }

    length() {
      return this.keys().length;
    }

    clear() {
      this._store = {};
    }

  }

  class StorageCache extends MemoryCache {
    constructor(key, expiration, sessionStorage = false) {
      super(expiration);
      this.key = key;
      const storage = sessionStorage ? 'sessionStorage' : 'localStorage';
      /* istanbul ignore if */

      if (typeof window === 'undefined' || !window[storage]) {
        throw Error(`StorageCache: ${storage} is not available.`);
      } else {
        this.storage = window[storage];
      }

      try {
        this._store = JSON.parse(this.storage.getItem(key)) || {};
      } catch (e) {
        this.clear();
        this._store = {};
      }
    }

    setItem(key, value, expiration) {
      super.setItem(key, value, expiration);
      this.storage.setItem(this.key, JSON.stringify(this._store));
    }

    clear() {
      this.storage.removeItem(this.key);
    }

  }

  const plugin = {
    options: {
      baseURL: null,
      cache: null,
      debounce: 50,
      deep: true,
      keepData: true,
      auto: 'get',
      // false, true, '%METHOD%',
      prefetch: null,
      prefetchTimeout: 4000,
      transformer: null,
      ssrContext: null
    },

    install(Vue, options = {}) {
      options = mergeExistingKeys(this.options, options);
      Vue.mixin(mixin(options));
      Vue.component('chimera-endpoint', __vue_component__);
      Vue.prototype.$chimeraOptions = options;

      const endpointOptions = _objectWithoutProperties(options, ["deep", "ssrContext"]);

      Object.assign(Endpoint.prototype, endpointOptions);
    }

  }; // Auto-install

  let GlobalVue = null;
  /* istanbul ignore if */

  /* istanbul ignore else */

  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }
  /* istanbul ignore if */


  if (GlobalVue) {
    GlobalVue.use(plugin, plugin.options);
  }

  exports.CANCEL = CANCEL;
  exports.ERROR = ERROR;
  exports.LOADING = LOADING;
  exports.MemoryCache = MemoryCache;
  exports.SUCCESS = SUCCESS;
  exports.StorageCache = StorageCache;
  exports.TIMEOUT = TIMEOUT;
  exports.default = plugin;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
