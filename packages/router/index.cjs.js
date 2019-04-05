"use strict";

var pathToRegexp = require('path-to-regexp');

module.exports = {
  resolve: function resolve(routes, rawPath) {
    var params = {};
    var path = normalize(rawPath);
    var key = Object.keys(routes).find(function (pattern) {
      return pathToRegexp(pattern).test(path);
    });

    if (key) {
      var paramKeys = [];
      var values = pathToRegexp(key, paramKeys).exec(path).slice(1);
      paramKeys.forEach(function (key, i) {
        params[key.name] = values[i];
      });
    }

    return {
      key: key,
      params: params
    };
  },
  listen: function listen(handler) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$initial = _ref.initial,
        initial = _ref$initial === void 0 ? true : _ref$initial,
        _ref$pop = _ref.pop,
        pop = _ref$pop === void 0 ? true : _ref$pop,
        _ref$click = _ref.click,
        click = _ref$click === void 0 ? true : _ref$click,
        _ref$scroll = _ref.scroll,
        scroll = _ref$scroll === void 0 ? true : _ref$scroll;

    function navigate(path) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var fn = options.replace ? 'replaceState' : 'pushState';
      window.history[fn](options.state || null, null, path);
      var render = handler(window.location.pathname, navigate);
      Promise.resolve(render).then(function () {
        if ('scroll' in options ? options.scroll : scroll) {
          window.scrollTo(0, 0);
        }
      });
      return render;
    }

    if (initial) {
      handler(window.location.pathname, navigate);
    }

    if (pop) {
      window.addEventListener('popstate', function () {
        handler(window.location.pathname, navigate);
      });
    }

    if (click) {
      window.addEventListener('click', function (e) {
        var link = e.target.closest('a');
        var ignore = e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;

        if (!ignore && link) {
          e.preventDefault();

          var domain = function domain(url) {
            return url.replace('http://', '').replace('https://', '').split('/')[0];
          };

          var external = domain(window.location.href) !== domain(link.href);
          var blank = link.target === '_blank';

          if (blank || external) {
            window.open(link.href);
          } else {
            var pathname = link.pathname;
            var search = link.search || '';
            var hash = link.hash || '';
            var replace = link.hasAttribute('data-replace');

            var _scroll = link.getAttribute('data-scroll') !== 'false';

            var options = {
              replace: replace,
              scroll: _scroll
            };
            navigate([pathname, search, hash].join(''), options);
          }
        }
      });
    }
  }
};

function normalize(path) {
  return '/' + path.split('/').filter(function (value) {
    return value;
  }).join('/');
}
