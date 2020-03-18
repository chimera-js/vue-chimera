import Axios, { CancelToken } from 'axios';

var SUCCESS = 'success';
var ERROR = 'error';
var CANCEL = 'cancel';
var LOADING = 'loading';
var TIMEOUT = 'timeout';

function _typeof(obj) {
  "@babel/helpers - typeof";

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

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
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

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var MemoryCache_1 = /*#__PURE__*/function () {
  function MemoryCache(expiration) {
    _classCallCheck(this, MemoryCache);

    this.expiration = expiration || 1000 * 60;
    this._store = {};
  }
  /**
     *
     * @param key         Key for the cache
     * @param value       Value for cache persistence
     * @param expiration  Expiration time in milliseconds
     */


  _createClass(MemoryCache, [{
    key: "setItem",
    value: function setItem(key, value, expiration) {
      this._store[key] = {
        expiration: Date.now() + (expiration || this.expiration),
        value: value
      };
    }
    /**
       * If Cache exists return the Parsed Value, If Not returns {null}
       *
       * @param key
       */

  }, {
    key: "getItem",
    value: function getItem(key) {
      var item = this._store[key];

      if (item && item.value && Date.now() <= item.expiration) {
        return item.value;
      }

      this.removeItem(key);
      return null;
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      delete this._store[key];
    }
  }, {
    key: "keys",
    value: function keys() {
      return Object.keys(this._store);
    }
  }, {
    key: "all",
    value: function all() {
      var _this = this;

      return this.keys().reduce(function (obj, str) {
        obj[str] = _this._store[str];
        return obj;
      }, {});
    }
  }, {
    key: "length",
    value: function length() {
      return this.keys().length;
    }
  }, {
    key: "clear",
    value: function clear() {
      this._store = {};
    }
  }]);

  return MemoryCache;
}();

var StorageCache_1 = /*#__PURE__*/function (_MemoryCache) {
  _inherits(StorageCache, _MemoryCache);

  function StorageCache(key, expiration) {
    var _this;

    var sessionStorage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, StorageCache);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(StorageCache).call(this, expiration));
    _this.key = key;
    var storage = sessionStorage ? 'sessionStorage' : 'localStorage';
    /* istanbul ignore if */

    if (typeof window === 'undefined' || !window[storage]) {
      throw Error("StorageCache: ".concat(storage, " is not available."));
    } else {
      _this.storage = window[storage];
    }

    try {
      _this._store = JSON.parse(_this.storage.getItem(key)) || {};
    } catch (e) {
      _this.clear();

      _this._store = {};
    }

    return _this;
  }

  _createClass(StorageCache, [{
    key: "setItem",
    value: function setItem(key, value, expiration) {
      _get(_getPrototypeOf(StorageCache.prototype), "setItem", this).call(this, key, value, expiration);

      this.storage.setItem(this.key, JSON.stringify(this._store));
    }
  }, {
    key: "clear",
    value: function clear() {
      this.storage.removeItem(this.key);
    }
  }]);

  return StorageCache;
}(MemoryCache_1);

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

function isPlainObject(value) {
  return _typeof(value) === 'object' && value && Object.prototype.toString(value) === '[object Object]';
}
function mergeExistingKeys() {
  for (var _len = arguments.length, obj = new Array(_len), _key = 0; _key < _len; _key++) {
    obj[_key] = arguments[_key];
  }

  var o = Object.assign.apply(Object, [{}].concat(obj));
  return Object.keys(obj[0]).reduce(function (carry, item) {
    carry[item] = o[item];
    return carry;
  }, {});
}
var hasKey = function hasKey(obj, key) {
  return key in (obj || {});
};
function getServerContext(contextString) {
  try {
    var context = window;
    var keys = contextString.split('.');
    keys.forEach(function (key) {
      context = context[key];
    });
    return context;
  } catch (e) {}

  return null;
}
function noopReturn(arg) {
  return arg;
}
function warn(arg) {
  var _console;

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  // eslint-disable-next-line no-console
  (_console = console).warn.apply(_console, ['[Chimera]: ' + arg].concat(args));
}

function createAxios(config) {
  if (typeof config === 'function') {
    if (typeof config.request === 'function') return config;
    return config();
  }

  if (isPlainObject(config)) {
    return Axios.create(config);
  }

  return Axios;
}

var axiosAdapter = {
  request: function request(endpoint) {
    var axios = createAxios(endpoint.axios);

    var request = function (_ref) {
      var url = _ref.url,
          method = _ref.method,
          baseURL = _ref.baseURL,
          headers = _ref.requestHeaders,
          timeout = _ref.timeout;
      return {
        url: url,
        method: method,
        baseURL: baseURL,
        headers: headers,
        timeout: timeout
      };
    }(endpoint);

    request[(endpoint.method || 'get') !== 'get' ? 'data' : 'params'] = endpoint.params;
    request.cancelToken = new CancelToken(function (c) {
      endpoint._canceler = c;
    });
    return axios.request(request)["catch"](function (err) {
      throw Object.assign(err, err.response);
    });
  },
  cancel: function cancel(endpoint) {
    if (typeof endpoint._canceler === 'function') endpoint._canceler();
    endpoint._canceler = null;
  },
  isCancelError: function isCancelError(err) {
    return Axios.isCancel(err);
  },
  isTimeoutError: function isTimeoutError(err) {
    return err.message && !err.response && err.message.indexOf('timeout') !== -1;
  }
};

var INITIAL_RESPONSE = {
  status: null,
  data: null,
  headers: undefined,
  error: null,
  lastLoaded: undefined
};

var Endpoint = /*#__PURE__*/function () {
  function Endpoint(opts, initial) {
    _classCallCheck(this, Endpoint);

    if (typeof opts === 'string') opts = {
      url: opts,
      key: opts
    };

    if (!opts) {
      warn('Invalid options', opts);
      throw new Error('[Chimera]: invalid options');
    }

    opts = this.options ? this.constructor.applyDefaults(this.options, opts) : opts;

    var _opts = opts,
        debounce = _opts.debounce,
        transformer = _opts.transformer,
        interval = _opts.interval,
        headers = _opts.headers,
        listeners = _opts.on,
        auto = _opts.auto,
        prefetch = _opts.prefetch,
        options = _objectWithoutProperties(_opts, ["debounce", "transformer", "interval", "headers", "on", "auto", "prefetch"]);

    options.method = (options.method || 'get').toLowerCase();
    this.fetchDebounced = debounce !== false ? pDebounce(this.fetch.bind(this), debounce || 50, {
      leading: true
    }) : this.fetch; // Set Transformers

    this.setTransformer(transformer);
    this.prefetched = false;
    this.loading = false; // Set Events

    this.listeners = Object.create(null);

    if (isPlainObject(listeners)) {
      for (var key in listeners) {
        this.on(key, listeners[key]);
      }
    }

    Object.assign(this, options);
    this.requestHeaders = headers; // Handle type on auto

    this.auto = typeof auto === 'string' ? auto.toLowerCase() === options.method : !!auto;
    this.prefetch = prefetch != null ? prefetch : this.auto;
    Object.assign(this, INITIAL_RESPONSE, initial || {});
    interval && this.startInterval(interval);
  }

  _createClass(Endpoint, [{
    key: "setTransformer",
    value: function setTransformer(transformer) {
      if (typeof transformer === 'function') {
        this.responseTransformer = transformer;
        this.errorTransformer = transformer;
      } else if (isPlainObject(transformer)) {
        var response = transformer.response,
            error = transformer.error;
        this.responseTransformer = response || noopReturn;
        this.errorTransformer = error || noopReturn;
      } else {
        this.responseTransformer = noopReturn;
        this.errorTransformer = noopReturn;
      }
    }
  }, {
    key: "on",
    value: function on(event, handler) {
      this.listeners[event] = (this.listeners[event] || []).concat(handler);
      return this;
    }
  }, {
    key: "emit",
    value: function emit(event) {
      var _this = this;

      (this.listeners[event] || []).forEach(function (handler) {
        handler(_this, event);
      });
    }
  }, {
    key: "fetch",
    value: function fetch(force, extraOptions) {
      var _this2 = this;

      if (this.cache && !force) {
        var cacheValue = this.getCache();

        if (cacheValue) {
          this.setResponse(cacheValue, true);
          return Promise.resolve(cacheValue);
        }
      }

      var request = this;

      if (isPlainObject(extraOptions)) {
        request = Object.create(this); // Merge extra options

        if (extraOptions.params) extraOptions.params = Object.assign({}, request.params, extraOptions.params);
        if (extraOptions.headers) extraOptions.requestHeaders = Object.assign({}, request.requestHeaders, extraOptions.headers);
        Object.assign(request, extraOptions);
      }

      this.loading = true;
      this.emit(LOADING);
      return this.http.request(request).then(function (res) {
        _this2.loading = false;

        _this2.setResponse(res, true);

        _this2.setCache(res);

        _this2.emit(SUCCESS);

        return res;
      })["catch"](function (err) {
        _this2.loading = false;

        _this2.setResponse(err, false);

        if (_this2.http.isCancelError(err)) {
          _this2.emit(CANCEL);
        } else {
          if (_this2.http.isTimeoutError) {
            _this2.emit(TIMEOUT);
          }

          _this2.emit(ERROR);
        }

        throw err;
      });
    }
  }, {
    key: "reload",
    value: function reload(force) {
      return this.fetchDebounced(force);
    }
  }, {
    key: "send",
    value: function send(params) {
      return this.fetch(true, {
        params: params
      });
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.http.cancel(this);
    }
  }, {
    key: "getCacheKey",
    value: function getCacheKey() {
      if (this.key) return this.key;
      /* istanbul ignore next */

      throw new Error('[Chimera]: cannot use cache without "key" property');
    }
  }, {
    key: "getCache",
    value: function getCache() {
      return this.cache ? this.cache.getItem(this.getCacheKey()) : undefined;
    }
  }, {
    key: "setCache",
    value: function setCache(value) {
      this.cache && this.cache.setItem(this.getCacheKey(), value);
    }
  }, {
    key: "deleteCache",
    value: function deleteCache() {
      this.cache && this.cache.removeItem(this.getCacheKey());
    }
  }, {
    key: "setResponse",
    value: function setResponse(res, success) {
      res = res || {};
      this.status = res.status;
      this.data = success ? this.responseTransformer(res.data, this) : null;
      this.error = !success ? this.errorTransformer(res.data, this) : null;
      this.headers = !this.light ? res.headers || {} : undefined;
      this.lastLoaded = !this.light ? new Date() : undefined;
    }
  }, {
    key: "startInterval",
    value: function startInterval(ms) {
      var _this3 = this;

      /* istanbul ignore if */
      if (typeof ms !== 'number') throw new Error('[Chimera]: interval should be number');
      /* istanbul ignore if */

      if (typeof process !== 'undefined' && process.server) return;
      this._interval = ms;
      this.stopInterval();
      this._interval_id = setInterval(function () {
        return _this3.reload(true);
      }, this._interval);
    }
  }, {
    key: "stopInterval",
    value: function stopInterval() {
      if (this._interval_id) {
        clearInterval(this._interval_id);
        this._interval_id = null;
        this._interval = false;
      }
    }
  }, {
    key: "toString",
    value: function toString() {
      return JSON.stringify(this.response);
    }
  }, {
    key: "looping",
    get: function get() {
      return !!this._interval;
    }
  }, {
    key: "response",
    get: function get() {
      return mergeExistingKeys(INITIAL_RESPONSE, this);
    }
  }], [{
    key: "applyDefaults",
    value: function applyDefaults(base, options) {
      if (!base) return options;
      options = _objectSpread2({}, options);
      var strats = this.optionMergeStrategies;
      Object.keys(base).forEach(function (key) {
        options[key] = key in options && strats[key] ? strats[key](base[key], options[key]) : key in options ? options[key] : base[key];
      });
      return options;
    }
  }]);

  return Endpoint;
}();
Endpoint.prototype.http = axiosAdapter;
var strats = Endpoint.optionMergeStrategies = {};

strats.headers = strats.params = strats.transformers = function (base, opts) {
  if (isPlainObject(base) && isPlainObject(opts)) {
    return _objectSpread2({}, base, {}, opts);
  }

  return opts === undefined ? base : opts;
};

strats.on = function (fromVal, toVal) {
  var value = _objectSpread2({}, fromVal || {});

  Object.entries(toVal || {}).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        event = _ref2[0],
        handlers = _ref2[1];

    var h = value[event];
    value[event] = h ? [].concat(h).concat(handlers) : handlers;
  });
  return value;
};

var NullEndpoint = /*#__PURE__*/function (_Endpoint) {
  _inherits(NullEndpoint, _Endpoint);

  function NullEndpoint() {
    _classCallCheck(this, NullEndpoint);

    return _possibleConstructorReturn(this, _getPrototypeOf(NullEndpoint).call(this, {}));
  }

  _createClass(NullEndpoint, [{
    key: "fetch",
    value: function fetch(force) {
      return Promise.reject(new Error('[Chimera]: Fetching null endpoint'));
    }
  }, {
    key: "cancel",
    value: function cancel() {}
  }]);

  return NullEndpoint;
}(Endpoint);

var shouldAutoFetch = function shouldAutoFetch(r) {
  return r.auto && (!r.prefetched || r.prefetch === 'override');
};

var VueChimera = /*#__PURE__*/function () {
  function VueChimera(vm, _ref, options) {
    var _this = this;

    var endpoints = _extends({}, _ref);

    _classCallCheck(this, VueChimera);

    this._vm = vm;
    this._watchers = [];

    if (options) {
      var deep = options.deep,
          ssrContext = options.ssrContext,
          endpointOptions = _objectWithoutProperties(options, ["deep", "ssrContext"]);

      var LocalEndpoint = this.LocalEndpoint = /*#__PURE__*/function (_BaseEndpoint) {
        _inherits(Endpoint, _BaseEndpoint);

        function Endpoint() {
          _classCallCheck(this, Endpoint);

          return _possibleConstructorReturn(this, _getPrototypeOf(Endpoint).apply(this, arguments));
        }

        return Endpoint;
      }(Endpoint);

      LocalEndpoint.prototype.options = LocalEndpoint.applyDefaults(LocalEndpoint.prototype.options, endpointOptions);
      Object.assign(this, JSON.parse(JSON.stringify({
        deep: deep,
        ssrContext: ssrContext
      })));
    }

    this._ssrContext = getServerContext(this.ssrContext);
    this._server = vm.$isServer;
    var watchOption = {
      immediate: true,
      deep: this._deep,
      sync: true
    };

    var _loop = function _loop(key) {
      if (key.charAt(0) === '$') {
        delete endpoints[key];
        return "continue";
      }

      var r = endpoints[key];

      if (typeof r === 'function') {
        _this._watchers.push([function () {
          return r.call(_this._vm);
        }, function (t, f) {
          return _this.updateEndpoint(key, t, f);
        }, watchOption]);
      } else {
        r = endpoints[key] = _this.endpointFrom(r);

        if (!_this._server) {
          shouldAutoFetch(r) && r.reload();
        }
      }
    };

    for (var key in endpoints) {
      var _ret = _loop(key);

      if (_ret === "continue") continue;
    }

    Object.defineProperty(endpoints, '$cancelAll', {
      value: function value() {
        return _this.cancelAll();
      }
    });
    Object.defineProperty(endpoints, '$loading', {
      get: function get() {
        return !!Object.values(this).find(function (el) {
          return !!el.loading;
        });
      }
    });
    this.endpoints = endpoints;
  }

  _createClass(VueChimera, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      this._watchers = this._watchers.map(function (w) {
        var _this2$_vm;

        return (_this2$_vm = _this2._vm).$watch.apply(_this2$_vm, _toConsumableArray(w));
      });
    }
  }, {
    key: "initServer",
    value: function initServer() {
      var _this3 = this;

      this._vm.$_chimeraPromises = [];
      Object.values(this.endpoints).forEach(function (endpoint) {
        if (endpoint.auto && endpoint.prefetch) {
          /* istanbul ignore if */
          if (!endpoint.key) {
            warn('used prefetch with no key associated with endpoint!');
            return;
          }

          _this3._vm.$_chimeraPromises.push(endpoint.fetch(true, {
            timeout: endpoint.prefetchTimeout
          }).then(function () {
            return endpoint;
          })["catch"](function () {
            return null;
          }));
        }
      });
    }
  }, {
    key: "updateEndpoint",
    value: function updateEndpoint(key, newValue, oldValue) {
      var oldEndpoint = this.endpoints[key];
      var newEndpoint = this.endpointFrom(newValue, oldValue && oldValue.keepData ? oldEndpoint.response : null);

      if (oldValue && oldEndpoint) {
        oldEndpoint.stopInterval();
        newEndpoint.lastLoaded = oldEndpoint.lastLoaded;
      }

      if (!this._server) {
        if (shouldAutoFetch(newEndpoint)) newEndpoint.reload();
      }

      this._vm.$set(this.endpoints, key, newEndpoint);
    }
  }, {
    key: "endpointFrom",
    value: function endpointFrom(value, initial) {
      var _this4 = this;

      if (value == null) return new NullEndpoint();
      if (typeof value === 'string') value = {
        url: value
      };

      if (isPlainObject(value.on)) {
        var bindVm = function bindVm(handler) {
          if (typeof handler === 'function') {
            handler = handler.bind(_this4._vm);
          }

          if (typeof handler === 'string') handler = _this4._vm[handler];
          return handler;
        };

        Object.entries(value.on).forEach(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 2),
              event = _ref3[0],
              handlers = _ref3[1];

          value.on[event] = Array.isArray(handlers) ? handlers.map(bindVm) : bindVm(handlers);
        });
      }

      var endpoint = new (this.LocalEndpoint || Endpoint)(value, initial);

      if (!this._server && !initial && endpoint.key && endpoint.prefetch && this._ssrContext) {
        initial = this._ssrContext[value.key];
        if (initial) initial.prefetched = true;
        Object.assign(endpoint, initial);
      }

      return endpoint;
    }
  }, {
    key: "cancelAll",
    value: function cancelAll() {
      Object.values(this.endpoints).forEach(function (r) {
        r.cancel();
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var vm = this._vm;
      this.cancelAll();
      Object.values(this.endpoints).forEach(function (r) {
        r.stopInterval();
      });
      delete vm._chimera;
    }
  }]);

  return VueChimera;
}();

var mixin = {
  beforeCreate: function beforeCreate() {
    var _this = this;

    var vmOptions = this.$options;
    var chimera; // Stop if instance doesn't have chimera or already initialized

    /* istanbul ignore if */

    if (!vmOptions.chimera || vmOptions._chimera) return;

    if (typeof vmOptions.chimera === 'function') {
      // Initialize with function
      vmOptions.chimera = vmOptions.chimera.call(this);
    }
    /* istanbul ignore else */


    if (isPlainObject(vmOptions.chimera)) {
      var _vmOptions$chimera = vmOptions.chimera,
          $options = _vmOptions$chimera.$options,
          endpoints = _objectWithoutProperties(_vmOptions$chimera, ["$options"]);

      chimera = new VueChimera(this, endpoints, $options);
    } else {
      throw new Error('[Chimera]: chimera options should be an object or a function that returns object');
    }

    if (!Object.prototype.hasOwnProperty.call(this, '$chimera')) {
      Object.defineProperty(this, '$chimera', {
        get: function get() {
          return chimera.endpoints;
        }
      });
    }

    Object.keys(chimera.endpoints).forEach(function (key) {
      if (!(hasKey(vmOptions.computeds, key) || hasKey(vmOptions.props, key) || hasKey(vmOptions.methods, key))) {
        Object.defineProperty(_this, key, {
          get: function get() {
            return _this.$chimera[key];
          },
          enumerable: true,
          configurable: true
        });
      }
    });
    this._chimera = chimera;
  },
  data: function data() {
    /* istanbul ignore if */
    if (!this._chimera) return {};
    return {
      $chimera: this._chimera.endpoints
    };
  },
  created: function created() {
    /* istanbul ignore if */
    if (!this._chimera) return;

    this._chimera.init();

    this.$isServer && this._chimera.initServer();
  },
  beforeDestroy: function beforeDestroy() {
    /* istanbul ignore if */
    if (!this._chimera) return;

    this._chimera.destroy();
  },
  serverPrefetch: function serverPrefetch() {
    /* istanbul ignore if */
    if (!this.$_chimeraPromises) return;

    var ChimeraSSR = require('../ssr/index');

    return Promise.all(this.$_chimeraPromises).then(function (results) {
      results.forEach(function (endpoint) {
        endpoint && ChimeraSSR.addEndpoint(endpoint);
      });
    });
  }
};

var ChimeraEndpoint = {
  inheritAttrs: false,
  props: {
    options: {
      type: [Object, String]
    },
    tag: {
      type: String,
      "default": null
    },
    ssrContext: {
      type: String,
      "default": null
    }
  },
  data: function data() {
    return {
      endpoint: this.getEndpoint()
    };
  },
  render: function render(h) {
    var result = this.$scopedSlots["default"](this.endpoint);

    if (Array.isArray(result)) {
      result = result.concat(this.$slots["default"]);
    } else {
      result = [result].concat(this.$slots["default"]);
    }

    return this.tag ? h(this.tag, result) : result[0];
  },
  created: function created() {
    var ep = this.endpoint;

    if (this.$isServer && ep.key) {
      this.$_chimeraPromises = [ep.fetch(true).then(function () {
        return ep;
      })["catch"](function () {
        return null;
      })];
    }
  },
  mounted: function mounted() {
    var ep = this.endpoint;

    if (ep.auto && (!ep.data || ep.prefetch === 'override')) {
      ep.reload();
    }
  },
  methods: {
    getEndpoint: function getEndpoint() {
      var _this = this;

      var value = this.options;
      if (value == null) return new NullEndpoint();
      if (typeof value === 'string') value = {
        url: value
      };
      var endpoint = new Endpoint(value);

      endpoint.emit = function (ev) {
        Endpoint.prototype.emit.call(endpoint, ev);

        _this.$emit(ev, endpoint);
      };

      this._ssrContext = getServerContext(this.ssrContext || VueChimera.prototype.ssrContext);

      if (!this._server && endpoint.key && endpoint.prefetch && this._ssrContext) {
        var initial = this._ssrContext[endpoint.key];
        if (initial) initial.prefetched = true;
        Object.assign(endpoint, initial);
      }

      return endpoint;
    }
  }
};

var DEFAULT_OPTIONS = {
  baseURL: null,
  cache: null,
  debounce: 50,
  deep: true,
  keepData: true,
  auto: 'get',
  // false, true, '%METHOD%',
  prefetch: true,
  prefetchTimeout: 4000,
  transformer: null,
  ssrContext: null
};
function install(Vue) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  options = Object.assign({}, DEFAULT_OPTIONS, options);
  Vue.mixin(mixin);
  Vue.component('chimera-endpoint', ChimeraEndpoint);

  var _options = options,
      deep = _options.deep,
      ssrContext = _options.ssrContext,
      endpointOptions = _objectWithoutProperties(_options, ["deep", "ssrContext"]);

  Endpoint.prototype.options = endpointOptions;
  Object.assign(VueChimera.prototype, {
    deep: deep,
    ssrContext: ssrContext
  }); // const merge = Vue.config.optionMergeStrategies.methods

  Vue.config.optionMergeStrategies.chimera = function (toVal, fromVal, vm) {
    if (!toVal) return fromVal;
    if (!fromVal) return toVal;
    if (typeof fromVal === 'function') fromVal = fromVal.call(vm);
    if (typeof toVal === 'function') toVal = toVal.call(vm);
    return Object.assign({}, toVal, fromVal, toVal.$options && fromVal.$options ? {
      $options: Endpoint.applyDefaults(toVal.$options, fromVal.$options)
    } : {});
  };
}

export default install;
export { CANCEL, ERROR, LOADING, MemoryCache_1 as MemoryCache, SUCCESS, StorageCache_1 as StorageCache, TIMEOUT };
