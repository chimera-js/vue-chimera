import Axios from 'axios';
import Vue from 'vue';
import { debounce } from 'throttle-debounce';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function isPlainObject(value) {
  var OBJECT_STRING = '[object Object]';
  return Object.prototype.toString(value) === OBJECT_STRING;
}
function remove(arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);

    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}
function createAxios(config) {
  if (config instanceof Axios) {
    return config;
  }

  if (isPlainObject(config)) {
    return Axios.create(config);
  }

  return Axios.create();
}

var LocalStorageCache =
/*#__PURE__*/
function () {
  function LocalStorageCache(defaultExpiration) {
    _classCallCheck(this, LocalStorageCache);

    if (typeof window === 'undefined' || !window.localStorage) {
      throw 'LocalStorageCache: Local storage is not available.';
    } else this.storage = window.localStorage;

    this.defaultExpiration = defaultExpiration;
  }
  /**
     *
     * @param key         Key for the cache
     * @param value       Value for cache persistence
     * @param expiration  Expiration time in milliseconds
     */


  _createClass(LocalStorageCache, [{
    key: "setItem",
    value: function setItem(key, value, expiration) {
      this.storage.setItem(key, JSON.stringify({
        expiration: Date.now() + (expiration || this.defaultExpiration),
        value: value
      }));
    }
    /**
       * If Cache exists return the Parsed Value, If Not returns {null}
       *
       * @param key
       */

  }, {
    key: "getItem",
    value: function getItem(key) {
      var item = this.storage.getItem(key);
      item = JSON.parse(item);

      if (item && item.value && Date.now() <= item.expiration) {
        return item.value;
      }

      this.removeItem(key);
      return null;
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      this.storage.removeItem(key);
    }
  }, {
    key: "keys",
    value: function keys() {
      return Object.keys(this.storage);
    }
  }, {
    key: "all",
    value: function all() {
      var _this = this;

      return this.keys().reduce(function (obj, str) {
        obj[str] = _this.storage.getItem(str);
        return obj;
      }, {});
    }
  }, {
    key: "length",
    value: function length() {
      return this.keys().length;
    }
  }, {
    key: "clearCache",
    value: function clearCache() {
      this.storage.clear();
    }
  }]);

  return LocalStorageCache;
}();

var NullCache =
/*#__PURE__*/
function () {
  function NullCache() {
    _classCallCheck(this, NullCache);
  }

  _createClass(NullCache, [{
    key: "setItem",
    value: function setItem(key, value, expiration) {}
  }, {
    key: "getItem",
    value: function getItem(key) {
      return null;
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {}
  }, {
    key: "keys",
    value: function keys() {
      return [];
    }
  }, {
    key: "all",
    value: function all() {
      return {};
    }
  }, {
    key: "length",
    value: function length() {
      return 0;
    }
  }, {
    key: "clearCache",
    value: function clearCache() {}
  }]);

  return NullCache;
}();

var EVENT_SUCCESS = 'success';
var EVENT_ERROR = 'error';
var EVENT_LOADING = 'loading';

var Resource =
/*#__PURE__*/
function () {
  _createClass(Resource, null, [{
    key: "from",
    value: function from(value) {
      if (value instanceof Resource) {
        return value;
      }

      if (typeof value === 'string') {
        return new Resource(value, 'GET');
      }

      if (isPlainObject(value)) {
        var axiosClient = Resource.axios;

        if (value.axios) {
          axiosClient = isPlainObject(value.axios) ? Axios.create(value.axios) : value.axios;
        }

        var resource = new Resource(value.url, value.method, {
          params: value.params,
          headers: value.headers,
          client: axiosClient,
          cache: value.cache,
          prefetch: value.prefetch
        });

        if (value.interval) {
          resource.setInterval(value.interval);
        }

        if (typeof value.transformer === 'function') {
          resource.setTransformer(value.transformer);
        }

        if (_typeof(value.transformer) === 'object') {
          resource.setResponseTransformer(value.transformer.response);
          resource.setErrorTransformer(value.transformer.error);
        }

        if (_typeof(value.on) === 'object' && value.on) {
          for (var key in value.on) {
            resource.on(key, value.on[key]);
          }
        }

        return resource;
      }
    }
  }]);

  function Resource(url, method, options) {
    _classCallCheck(this, Resource);

    options = options || {};
    method = method ? method.toLowerCase() : 'get';

    if (method && ['get', 'post', 'put', 'patch', 'delete'].indexOf(method) === -1) {
      throw new Error('Bad Method requested: ' + method);
    }

    this.requestConfig = {
      url: url,
      method: method ? method.toUpperCase() : 'GET',
      headers: options.headers || {}
    };
    this.requestConfig[this.requestConfig.method === 'GET' ? 'params' : 'data'] = options.params;
    this.client = options.client || Axios;
    this._loading = false;
    this._status = null;
    this._data = null;
    this._error = null;
    this._lastLoaded = null;
    this._eventListeners = {};
    this.prefetch = options.prefetch !== undefined ? Boolean(options.prefetch) : true;
    this.ssrPrefetched = false;
    this.cache = this.getCache(options);

    this.errorTransformer = function (err) {
      return err;
    };

    this.responseTransformer = function (res) {
      return res;
    };
  }

  _createClass(Resource, [{
    key: "setResponseTransformer",
    value: function setResponseTransformer(transformer) {
      this.responseTransformer = transformer;
    }
  }, {
    key: "setErrorTransformer",
    value: function setErrorTransformer(transformer) {
      this.errorTransformer = transformer;
    }
  }, {
    key: "setTransformer",
    value: function setTransformer(transformer) {
      this.responseTransformer = transformer;
      this.errorTransformer = transformer;
    }
  }, {
    key: "setInterval",
    value: function (_setInterval) {
      function setInterval(_x) {
        return _setInterval.apply(this, arguments);
      }

      setInterval.toString = function () {
        return _setInterval.toString();
      };

      return setInterval;
    }(function (ms) {
      var _this = this;

      this._interval = ms;

      if (this._interval_id) {
        clearInterval(this._interval_id);
      }

      this._interval_id = setInterval(function () {
        return _this.reload(true);
      }, ms);
    })
  }, {
    key: "on",
    value: function on(event, handler) {
      var listeners = this._eventListeners[event] || [];
      listeners.push(handler);
      this._eventListeners[event] = listeners;
      return this;
    }
  }, {
    key: "emit",
    value: function emit(event) {
      var _this2 = this;

      (this._eventListeners[event] || []).forEach(function (handler) {
        handler(_this2);
      });
    }
  }, {
    key: "reload",
    value: function reload(force) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var setByResponse = function setByResponse(res) {
          _this3._error = null;
          _this3._loading = false;

          if (res) {
            _this3._status = res.status;
            _this3._data = _this3.responseTransformer(res.data);
            _this3._lastLoaded = new Date();
          }
        };

        if (_this3.cache && !force) {
          var cacheValue = _this3.cache.getItem(_this3.getCacheKey());

          if (cacheValue) {
            setByResponse(cacheValue);
            resolve();
            return;
          }
        }

        _this3._loading = true;

        _this3.emit(EVENT_LOADING);

        _this3.client.request(_this3.requestConfig).then(function (res) {
          setByResponse(res);

          _this3.setCache(res);

          _this3.emit(EVENT_SUCCESS);

          resolve(res);
        }).catch(function (err) {
          var errorResponse = err.response;
          _this3._data = null;
          _this3._loading = false;

          if (errorResponse) {
            _this3._status = errorResponse.status;
            _this3._error = _this3.errorTransformer(errorResponse.data);
          }

          _this3.emit(EVENT_ERROR);

          reject(err);
        });
      });
    }
  }, {
    key: "execute",
    value: function execute() {
      return this.reload(true);
    }
  }, {
    key: "send",
    value: function send() {
      return this.reload(true);
    }
  }, {
    key: "getCache",
    value: function getCache(options) {
      var key = options.cache || Resource.cache;
      var caches = {
        'no-cache': function noCache() {
          return new NullCache();
        },
        'localStorage': function localStorage() {
          return new LocalStorageCache(options.cacheExpiration || 10000);
        }
      };
      return caches[key] ? caches[key]() : null;
    }
  }, {
    key: "getCacheKey",
    value: function getCacheKey() {
      return (typeof window !== 'undefined' && typeof btoa !== 'undefined' ? window.btoa : function (x) {
        return x;
      })(this.requestConfig.url + this.requestConfig.params + this.requestConfig.data + this.requestConfig.method);
    }
  }, {
    key: "setCache",
    value: function setCache(value) {
      if (this.cache) {
        this.cache.setItem(this.getCacheKey(), value);
      }
    }
  }, {
    key: "loading",
    get: function get() {
      return this._loading;
    }
  }, {
    key: "status",
    get: function get() {
      return this._status;
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    }
  }, {
    key: "error",
    get: function get() {
      return this._error;
    }
  }, {
    key: "lastLoaded",
    get: function get() {
      return this._lastLoaded;
    }
  }]);

  return Resource;
}();

var NullResource =
/*#__PURE__*/
function (_Resource) {
  _inherits(NullResource, _Resource);

  function NullResource() {
    _classCallCheck(this, NullResource);

    return _possibleConstructorReturn(this, _getPrototypeOf(NullResource).apply(this, arguments));
  }

  _createClass(NullResource, [{
    key: "reload",
    value: function reload(force) {
      return null;
    }
  }, {
    key: "loading",
    get: function get() {
      return false;
    }
  }, {
    key: "status",
    get: function get() {
      return 0;
    }
  }, {
    key: "data",
    get: function get() {
      return null;
    }
  }, {
    key: "error",
    get: function get() {
      return null;
    }
  }, {
    key: "lastLoaded",
    get: function get() {
      return null;
    }
  }]);

  return NullResource;
}(Resource);

var VueChimera =
/*#__PURE__*/
function () {
  function VueChimera() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var context = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, VueChimera);

    this._vm = null;
    this._listeners = [];
    this._context = context;
    this._reactiveResources = {};
    var resources = options.resources;

    for (var key in resources) {
      var r = resources[key];

      if (typeof r === 'function') {
        resources[key] = new NullResource();
        this._reactiveResources[key] = r.bind(this._context);
      } else {
        resources[key] = Resource.from(r);
      }
    }

    this._initVM(resources);

    this._resources = resources;
  }

  _createClass(VueChimera, [{
    key: "_initVM",
    value: function _initVM(data) {
      var _this = this;

      this._vm = new Vue({
        data: data,
        computed: {
          $loading: function $loading() {
            for (var key in this.$data) {
              if (this.$data[key].loading) {
                return true;
              }
            }

            return false;
          }
        }
      });

      data.$loading = function () {
        return _this._vm.$loading;
      };

      data.$client = function () {
        return _this._axios;
      };
    }
  }, {
    key: "watch",
    value: function watch() {
      var _this2 = this;

      return this._vm.$watch('$data', function () {
        var i = _this2._listeners.length;

        var _loop = function _loop() {
          var vm = _this2._listeners[i];

          if (vm) {
            vm.$nextTick(function () {
              return vm.$forceUpdate();
            });
          }
        };

        while (i--) {
          _loop();
        }
      }, {
        deep: true
      });
    }
  }, {
    key: "subscribe",
    value: function subscribe(vm) {
      this._listeners.push(vm);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(vm) {
      remove(this._listeners, vm);
    }
  }, {
    key: "updateReactiveResources",
    value: function updateReactiveResources() {
      for (var key in this._reactiveResources) {
        this.updateReactiveResource(key);
      }
    }
  }, {
    key: "updateReactiveResource",
    value: function updateReactiveResource(key) {
      var r = this._resources[key] = Resource.from(this._reactiveResources[key](), this._axios);
      if (r.prefetch) r.reload();
    }
  }, {
    key: "resources",
    get: function get() {
      return this._resources;
    }
  }]);

  return VueChimera;
}();

function mixin (config) {
  return {
    beforeCreate: function beforeCreate() {
      var options = this.$options;

      var _chimera; // Stop if instance doesn't have chimera or already initialized


      if (!options.chimera || options._chimera) return;
      if (options.chimera instanceof VueChimera) _chimera = options.chimera;else if (isPlainObject(options.chimera)) _chimera = new VueChimera(options.chimera, this);
      this._chimeraWatcher = _chimera.watch();

      _chimera.subscribe(this);

      options.computed = options.computed || {};
      options.watch = options.watch || {};

      var _loop = function _loop(key) {
        options.computed['__' + key] = _chimera._reactiveResources[key];
        options.watch['__' + key] = debounce(config.debounce, true, function () {
          return _chimera.updateReactiveResource(key);
        });
      };

      for (var key in _chimera._reactiveResources) {
        _loop(key);
      } // Nuxtjs prefetch


      var NUXT = process.server && this.$ssrContext ? this.$ssrContext.nuxt : typeof window !== 'undefined' ? window.__NUXT__ : null;

      if (_chimera && NUXT && NUXT.chimera) {
        if (this.$router) {
          var matched = this.$router.match(this.$router.currentRoute.fullPath);
          (matched ? matched.matched : []).forEach(function (m, i) {
            var nuxtChimera = NUXT.chimera[i];

            if (nuxtChimera) {
              Object.keys(_chimera.resources).forEach(function (key) {
                var localResource = _chimera.resources[key];
                var ssrResource = nuxtChimera[key];

                if (localResource && ssrResource && ssrResource._data) {
                  _chimera.resources[key]._data = nuxtChimera[key]._data;
                  _chimera.resources[key].ssrPrefetched = nuxtChimera[key].ssrPrefetched;
                }
              });
            }
          });
        }
      }

      this.$chimera = _chimera.resources;
      this._chimera = _chimera;
    },
    mounted: function mounted() {
      if (this._chimera) {
        this._chimera.updateReactiveResources();

        for (var r in this._chimera._resources) {
          var resource = this._chimera._resources[r];

          if (resource.prefetch && !resource.ssrPrefetched) {
            resource.reload();
          }
        }
      }
    },
    beforeDestroy: function beforeDestroy() {
      if (!this._chimera) {
        return;
      }

      this._chimera.unsubscribe(this);

      if (this._chimeraWatcher) {
        this._chimeraWatcher();

        delete this._chimeraWatcher;
      }

      this._chimera = null;
    }
  };
}

function NuxtPlugin (_ref) {
  var beforeNuxtRender = _ref.beforeNuxtRender,
      isDev = _ref.isDev;

  if (!beforeNuxtRender) {
    return;
  }

  function prefetchAsyncData(_ref2) {
    return new Promise(function ($return, $error) {
      var Components, nuxtState, i, len, component, options, nuxtChimera, resource, response;
      Components = _ref2.Components, nuxtState = _ref2.nuxtState;
      nuxtState.chimera = nuxtState.chimera || {};
      i = 0, len = Components.length;
      var $Loop_2_trampoline;

      function $Loop_2_step() {
        i++;
        return $Loop_2;
      }

      function $Loop_2() {
        if (i < len) {
          component = Components[i];
          options = component.options;

          if (!options.chimera) {
            return $Loop_2_step;
          }

          nuxtChimera = {};
          var $idx_4,
              $in_5 = [];

          for ($idx_4 in options.chimera.resources) $in_5.push($idx_4);

          var key;
          var $Loop_6_trampoline;

          function $Loop_6() {
            if ($in_5.length) {
              key = $in_5.shift();

              if (key && key.charAt(0) === '$') {
                return $Loop_2_step;
              }

              resource = options.chimera.resources[key];

              if (resource.requestConfig && !resource.requestConfig.url) {
                return $Loop_2_step;
              }

              if (resource && typeof resource !== 'function' && resource.prefetch) {
                resource = resource && resource._data ? resource : Resource.from(resource);

                var $Try_1_Post = function () {
                  try {
                    resource.ssrPrefetched = true;
                    options.chimera.resources[key] = nuxtChimera[key] = resource;
                    return $If_8.call(this);
                  } catch ($boundEx) {
                    return $error($boundEx);
                  }
                }.bind(this);

                var $Try_1_Catch = function (e) {
                  try {
                    return $Try_1_Post();
                  } catch ($boundEx) {
                    return $error($boundEx);
                  }
                };

                try {
                  if (isDev) {
                    console.log('  Prefetching: ' + resource.requestConfig.url);
                  }

                  return Promise.resolve(resource.execute()).then(function ($await_9) {
                    try {
                      response = $await_9;
                      resource._data = response.data;
                      return $Try_1_Post();
                    } catch ($boundEx) {
                      return $Try_1_Catch($boundEx);
                    }
                  }, $Try_1_Catch);
                } catch (e) {
                  $Try_1_Catch(e);
                }
              }

              function $If_8() {
                return $Loop_6;
              }

              return $If_8.call(this);
            } else return [1];
          }

          return ($Loop_6_trampoline = function (q) {
            while (q) {
              if (q.then) return q.then($Loop_6_trampoline, $error);

              try {
                if (q.pop) {
                  if (q.length) return q.pop() ? $Loop_6_exit.call(this) : q;else q = $Loop_6;
                } else q = q.call(this);
              } catch (_exception) {
                return $error(_exception);
              }
            }
          }.bind(this))($Loop_6);

          function $Loop_6_exit() {
            nuxtState.chimera[i] = nuxtChimera;
            return $Loop_2_step;
          }
        } else return [1];
      }

      return ($Loop_2_trampoline = function (q) {
        while (q) {
          if (q.then) return void q.then($Loop_2_trampoline, $error);

          try {
            if (q.pop) {
              if (q.length) return q.pop() ? $Loop_2_exit.call(this) : q;else q = $Loop_2_step;
            } else q = q.call(this);
          } catch (_exception) {
            return $error(_exception);
          }
        }
      }.bind(this))($Loop_2);

      function $Loop_2_exit() {
        return $return();
      }
    });
  }

  beforeNuxtRender(prefetchAsyncData);
}

Vue.config.silent = true;
Vue.config.productionTip = false;
Vue.config.devtools = false;
var plugin = {
  options: {
    axios: null,
    cache: 'no-cache',
    debounce: 200,
    prefetch: 'GET' // false, true, '%METHOD%'

  },
  install: function install(Vue$$1) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    Object.assign(this.options, options);
    Resource.cache = this.options.cache;
    Resource.axios = createAxios(this.options.axios);
    Vue$$1.mixin(mixin(this.options));
  }
}; // Auto-install

var GlobalVue = null;

if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}

if (GlobalVue) {
  GlobalVue.use(plugin);
}

export default plugin;
export { NuxtPlugin };
