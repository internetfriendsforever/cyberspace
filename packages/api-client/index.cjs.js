"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var fetch = require('isomorphic-fetch');

var cache = {};

module.exports = function () {
  var endpoint = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return function (options) {
    var pool = {};
    return {
      invalidate: function invalidate(key) {
        delete cache[key];
      },
      flush: function flush() {
        for (var key in cache) {
          delete cache[key];
        }
      },
      get: function () {
        var _get = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(path) {
          var cacheOptions,
              key,
              miss,
              ignore,
              expires,
              result,
              _args = arguments;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  cacheOptions = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
                  key = cacheOptions.key || path;
                  miss = cache[key] === undefined || cache[key].expires < Date.now();
                  ignore = cacheOptions.cache === false;

                  if (!(miss || ignore)) {
                    _context.next = 15;
                    break;
                  }

                  expires = Date.now() + (cacheOptions.expires || 1000 * 60 * 60 * 24);
                  _context.next = 8;
                  return fetch("".concat(endpoint).concat(path), options).then(function (res) {
                    return res.json();
                  })["catch"](console.error);

                case 8:
                  result = _context.sent;
                  pool[key] = {
                    result: result,
                    expires: expires
                  };

                  if (!ignore) {
                    _context.next = 14;
                    break;
                  }

                  return _context.abrupt("return", result);

                case 14:
                  cache[key] = {
                    result: result,
                    expires: expires
                  };

                case 15:
                  pool[key] = cache[key];
                  return _context.abrupt("return", cache[key].result);

                case 17:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function get(_x) {
          return _get.apply(this, arguments);
        }

        return get;
      }(),
      dehydrate: function dehydrate() {
        return JSON.stringify(pool);
      },
      hydrate: function hydrate(dehydrated) {
        for (var key in dehydrated) {
          cache[key] = dehydrated[key];
        }
      }
    };
  };
};
