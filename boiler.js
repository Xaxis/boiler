/**
 * boiler.js v0.5.3
 * https://github.com/Xaxis/boiler.js
 * http://www.boilerjs.com
 * (c) 2012-2013 Wil Neeley, Trestle Media, LLC.
 * boiler.js may be freely distributed under the MIT license.
 **/
(function () {
  var

  // Library reference
  l = "_",

  // Global root object (window or global)
  root = this,

  // Save conflict reference
  previousLib = root[l];

  // Library definition
  (l) = window[l] = function (obj) {
    var args = [];
    for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }
    (l)._global = args;
    (l)._wrapped = obj;
    if (obj instanceof (l)) return obj;
    if (!(this instanceof (l))) return new (l)(arguments);
  };

  // Library version
  (l)._version = "0.5.3";

  // Documentation: https://github.com/Xaxis/args.js/blob/master/args/args.js
  (l).__args = function (args, types, rules) {

    // The arguments object
    var oargs = { __set__ : [] };

    // Stores definition rules
    var defs = [];

    /*
     * Method returns a string representative of `obj`'s type.
     */
    var typeTest = function (obj) {
      var toString = Object.prototype.toString;
      switch (true) {
        case (toString.call(obj) === "[object Date]" || obj instanceof Date) :
          return 'date';
        case (toString.call(obj) === "[object RegExp]" || obj instanceof RegExp) :
          return 'regexp';
        case (typeof obj === "object" ? obj instanceof HTMLElement :
            typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string") :
          return 'element';
        case (typeof obj === "object" && toString.call(obj) === "[object Object]") :
          return 'object';
        case (toString.call(obj) === "[object Array]") :
          return 'array';
        case (typeof obj === "string" && toString.call(obj) === "[object String]") :
          return 'string';
        case (toString.call(obj) === "[object Boolean]") :
          return 'bool';
        case (toString.call(obj) === "[object Null]") :
          return 'null';
        case (toString.call(obj) === "[object Number]") :
          return 'number';
        case (toString.call(obj) === "[object Function]") :
          return 'function';
        case (typeof obj === "object") :
          return 'defaultobject';
        case (typeof obj === "undefined") :
          return 'undefined';
      }
      return 'notype';
    };

    /*
     * Method returns TRUE when a numeric value is in `arr`.
     */
    var inArray = function (arr, val) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) return true;
      }
      return false;
    };

    /*
     * Method returns the number of properties in an object.
     */
    var len = function (obj) {
      var length = 0;
      for (var i in obj) { length++; }
      return length;
    };

    // Build definitions object from types ARRAY
    if (typeTest(types) === "array") {
      for (var t = 0; t < types.length; t++) {
        for (var d in types[t]) {
          if (types[t].hasOwnProperty(d)) {
            var typeValue = "";
            if (typeTest(types[t][d]) === "array") {
              if (types[t][d].length === 2) {
                typeValue = types[t][d][1];
              } else {
                typeValue = typeTest(types[t][d][0]);
              }
            } else {
              typeValue = types[t][d];
            }
            defs.push({
              name : d,
              type : typeValue,
              order : [],
              set : false
            });
          }
        }
      }

      // Build definitions object from types OBJECT
    } else if (typeTest(types) === "object") {
      for (var d in types) {
        if (types.hasOwnProperty(d)) {
          var typeValue = "";
          if (typeTest(types[d]) === "array") {
            if (types[d].length === 2) {
              typeValue = types[d][1];
            } else {
              typeValue = typeTest(types[d][0]);
            }
          } else {
            typeValue = types[d];
          }
          defs.push({
            name : d,
            type : typeValue,
            order : [],
            set : false
          });
        }
      }
    }

    // Get ORDER data from `args` when an object literal
    if (typeTest(args) === "object") {
      var clone = [];
      for (var d in args) {
        if (args.hasOwnProperty(d)) {
          clone.push(args[d][0]);
          defs[d].order = args[d][1];
        }
      }
      args = clone;
    }

    // Convert array-like `args` object to array
    if (typeTest(args) === "defaultobject") {
      var clone = [];
      for (var a = 0; a < args.length; a++) {
        clone.push(args[a]);
      }
      args = clone;
    }

    // Remove all UNDEFINED values from `args` array
    var clone = [];
    for (var a in args) {
      if (args.hasOwnProperty(a)) {
        if (typeTest(args[a]) !== 'undefined') clone.push(args[a]);
      }
    }
    args = clone;

    // Boiler.js hack - Merge globally passed arguments
    if (typeTest((l)._global) === "array") {
      var clone = [];
      for (var a in (l)._global[0]) { clone.push((l)._global[0][a]); }
      args = clone.concat(args);
      (l)._global = false;
    }

    // Detect DEFAULT values in `args` array
    if (typeTest(types) === "array") {
      for (var t = 0; t < types.length; t++) {
        for (var d in types[t]) {
          if (typeTest(types[t][d]) === "array" && !(args.length >= types.length)) {
            args.push(types[t][d][0]);
            types[t][d] = typeTest(types[t][d][0]);
          }
        }
      }
    } else if (typeTest(types) === "object") {
      for (var d in types) {
        if (typeTest(types[d]) === "array" && !(args.length >= len(types))) {
          args.push(types[d][0]);
          types[d] = typeTest(types[d][0]);
        }
      }
    }

    // Build the `oargs` arguments object
    for (var a = 0; a < args.length; a++) {
      for (var d = 0; d < defs.length; d++) {
        var mtypes = [];
        var name = defs[d].name;
        var type = defs[d].type;
        if (name === "*") {
          var mtype = type.split(":");
          name = mtype[0] + a;
          type = mtype[1];
          if (( mtypes = type.split("|")).length > 1) {
            for (var n = 0; n < mtypes.length; n++) {
              type = mtypes[n];
              if (type === typeTest(args[a]) || type === "*") {
                oargs[ name ] = args[a];
                break;
              }
            }
          } else {
            if (type === typeTest(args[a]) || type === "*") {
              oargs[ name ] = args[a];
            }
          }
        } else if (( mtypes = type.split("|")).length > 1) {
          for (var n = 0; n < mtypes.length; n++) {
            type = mtypes[n];
            if (defs[d].order.length >= 1) {
              if ((type === typeTest(args[a]) || type === "*" )
                  && inArray(defs[d].order, parseInt(a))
                  && !(name in oargs)
                  && !inArray(oargs.__set__, a)) {
                oargs[ name ] = args[a];
                oargs.__set__.push(a);
                break;
              }
            } else {
              if (type === typeTest(args[a]) || type === "*") {
                oargs[ name ] = args[a];
                break;
              }
            }
          }
        } else {
          if (defs[d].order.length >= 1) {
            if ((type === typeTest(args[a]) || type === "*" )
                && inArray(defs[d].order, parseInt(a))
                && !(name in oargs)
                && !inArray(oargs.__set__, a)) {
              oargs[ name ] = args[a];
              oargs.__set__.push(a);
              break;
            }
          } else {
            if (type === typeTest(args[a]) || type === "*") {
              oargs[ name ] = args[a];
              break;
            }
          }
        }
      }
    }

    // Remove the __set__ property
    delete oargs.__set__;

    // Set the length property
    Object.defineProperty(oargs, "length", {
      enumerable : false,
      configurable : true,
      writable : true,
      value : len(oargs)
    });

    // Configure arguments object with rules
    if (typeTest(rules) === "object") {

      // Remove the `length` property
      if ('length' in rules) {
        if (!rules.length) {
          Object.defineProperty(oargs, "length", {
            enumerable : true,
            configurable : true,
            writable : true,
            value : false
          });
          delete oargs.length;
        }
      }

      // Convert `oargs` to an array
      if ('array' in rules) {
        oargs = [];
        for (var a in args) { oargs.push(args[a]); }
      }
    }
    return oargs;
  };

  (l).each = (l).forEach = function (obj, fn, scope) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]]}, {obj : 'object|array|defaultobject', fn : 'function', scope : 'object|function|defaultobject'});
    if (args.obj === null) return;
    if ((l).isArray(args.obj)) {
      for (var i = 0; i < args.obj.length; i++) {
        if (args.fn.call(args.scope || args.obj[i], i, args.obj[i], args.obj) === false) break;
      }
    } else {
      for (var key in args.obj) {
        if (args.fn.call(args.scope || args.obj[key], key, args.obj[key], args.obj) === false) break;
      }
    }
    return args.obj;
  };

  (l).map = (l).collect = function (obj, fn, scope, deep) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]], 3 : [deep, [0,1,2,3]]}, [
          {obj : 'object|array'},
          {fn : 'function'},
          {scope : 'object|function|defaultobject'},
          {deep : 'bool'}
        ]),
        list = (l).isArray(args.obj) ? args.obj : (l).toArray(obj),
        ret = [];
    if ( args.deep ) {
      return (l).deep(list, function(depth, index, value, ref) {
        if ( !(l).isArray(value) && !(l).isPlainObject(value) ) {
          ref[index] = args.fn.call(args.scope || this, value, index, ref);
        }
      }, !args.deep ? 1 : "*");
    } else {
      (l).each(list, function(index, value, ref) {
        ret.push(args.fn.call(args.scope || this, value, index, ref));
      });
      return ret;
    }
  };

  (l).pluck = (l).fetch = function () {
    var args = (l).__args(arguments, {obj : 'object|array', key : 'string|number', deep : 'bool'});
    return (l).map(args.obj, function (value) {
      return value[args.key];
    });
  };

  (l).filter = function (obj, fn, scope, reject) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]], 3 : [reject, [1, 2, 3]]}, [
          {obj : 'object|array'},
          {fn : 'function'},
          {scope : 'object|function|defaultobject'},
          {reject : 'bool'}
        ]),
        ret = [];
    (l).each(args.obj, function (index, value) {
      if (args.reject) {
        if (!args.fn.call(args.scope ? args.scope : this, value, index)) ret.push(value);
      } else {
        if (args.fn.call(args.scope ? args.scope : this, value, index)) ret.push(value);
      }
    });
    return ret;
  };

  (l).reject = function (obj, fn, scope) {
    return (l).filter(obj, fn, scope, true);
  };

  (l).any = (l).some = function (obj, fn, scope, deep) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]], 3 : [deep, [0, 1, 2, 3]]}, [
          {obj : 'object|array'},
          {fn : 'function'},
          {scope : 'object|function|defaultobject'},
          {deep : 'bool'}
        ]),
        ret = false;
    if ( args.deep ) {
      (l).deep(args.obj, function(depth, index, value) {
        if ( args.fn.call(args.scope ? args.scope : this, value, index) ) {
          ret = true;
          return false;
        }
      });
    } else {
      (l).each(args.obj, function(index, value) {
        if ( args.fn.call(args.scope ? args.scope : this, value, index) ) {
          ret = true;
          return false;
        }
      });
    }
    return ret;
  };

  (l).all = (l).every = function (obj, fn, scope, deep) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]], 3: [deep, [0,1,2,3]]}, [
      {obj : 'object|array'},
      {fn : 'function'},
      {scope : 'function|object|defaultobject'},
      {deep : 'bool'}
    ]), ret = true;
    if ( args.deep ) {
      (l).deep(args.obj, function(depth, index, value) {
        if ( !(l).isArray(value) && !(l).isPlainObject(value) ) {
          if (!args.fn.call(args.scope ? args.scope : this, value, index)) ret = false;
        }
      });
    } else {
      (l).each(args.obj, function(index, value) {
        if (!args.fn.call(args.scope ? args.scope : this, value, index)) ret = false;
      });
    }
    return ret;
  };

  (l).none = function (obj, fn, scope, deep) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]], 3 : [deep, [0,1,2,3]]}, [
          {obj : 'object|array'},
          {fn : 'function'},
          {scope : 'function|object|defaultobject'},
          {deep : 'bool'}
        ]),
        ret = true;
    if ( args.deep ) {
      (l).deep(args.obj, function(depth, index, value) {
        if (args.fn.call(args.scope ? args.scope : this, value, index)) ret = false;
      });
    } else {
      (l).each(args.obj, function (index, value) {
        if (args.fn.call(args.scope ? args.scope : this, value, index)) ret = false;
      });
    }
    return ret;
  };

  (l).count = function (obj, fn, scope, deep) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]], 3 : [deep, [0,1,2,3]]}, [
          {obj : 'object|array'},
          {fn : 'function'},
          {scope : 'function|object|defaultobject'},
          {deep : 'bool'}
        ]),
        ret = 0;
    if ( args.deep ) {
      (l).deep(args.obj, function(depth, index, value) {
        if ( !(l).isArray(value) && !(l).isPlainObject(value) ) {
          if (args.fn.call(args.scope ? args.scope : this, value, index)) ret++;
        }
      });
    } else {
      (l).each(args.obj, function (index, value) {
        if (args.fn.call(args.scope ? args.scope : this, value, index)) ret++;
      });
    }
    return ret;
  };

  (l).find = (l).findValue = function (obj, fn, scope, mode) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]], 3 : [mode, [1, 2, 3]]}, [
      {obj : 'object|array'},
      {fn : 'function'},
      {scope : 'object|function|defaultobject'},
      {mode : ['value']}
    ]),ret;
    (l).each(args.obj, function (index, value) {
      if (args.fn.call(args.scope ? args.scope : this, args.mode === "value" ? value : index, index)) {
        ret = value;
        return false;
      }
    });
    return ret;
  };

  (l).findKey = function (obj, fn, scope) {
    return (l).find(obj, fn, scope, "key");
  };

  (l).only = (l).whitelist = function (obj, list) {
    var args = (l).__args({0 : [obj, [0]], 1 : [list, [0, 1]]}, [
          {obj : 'object|array'},
          {list : 'array'}
        ]),
        ret = [];
    if (arguments.length === 1) {
      args.list = args.obj;
      args.obj = (l)._global;
    }
    var list = (l).isString(args.list) ? args.list.split(" ") : args.list;
    (l).each(list, function (index, value) {
      if ((l).keyExists(args.obj, value)) ret.push(args.obj[value]);
    });
    return ret;
  };

  (l).omit = (l).blacklist = function (obj, list) {
    var args = (l).__args({0 : [obj, [0]], 1 : [list, [0, 1]]}, [
      {obj : 'object|array'},
      {list : 'string|array|number'}
    ]);
    var props = (l).isArray(args.list) ? args.list : [args.list];
    return (l).filter(args.obj, function(value, index) {
      if (!(index in props) && !((l).inArray(props, index))) return value;
    });
  };

  (l).min  = function () {
    var args = (l).__args(arguments, {obj : 'object|array', deep: 'bool'}),
        minVals = [];
    (l).deep(args.obj, function(depth, index, value) {
      if ( (l).isNumber(value) ) minVals.push(value);
    }, args.deep ? "*" : 1);
    return Math.min.apply(this, minVals);
  };

  (l).max  = function () {
    var args = (l).__args(arguments, {obj : 'object|array', deep: 'bool'}),
        maxVals = [];
    (l).deep(args.obj, function (depth, index, value) {
      if ((l).isNumber(value)) maxVals.push(value);
    }, args.deep ? "*" : 1);
    return Math.max.apply(this, maxVals);
  };

  (l).average = function () {
    var args = (l).__args(arguments, {obj : 'object|array', deep : 'bool'}),
        sumTotal = 0;
    (l).deep(args.obj, function (depth, index, value) {
      if ((l).isNumber(value)) sumTotal += value;
    }, args.deep ? "*" : 1);
    return sumTotal / (l).len(args.obj, args.deep);
  };

  (l).sum = function () {
    var args = (l).__args(arguments, {obj : 'object|array', deep : 'bool'}), ret = 0;
    (l).deep(args.obj, function (depth, index, value) {
      if ((l).isNumber(value)) ret += value;
    }, args.deep ? "*" : 1);
    return ret;
  };

  (l).reduce = (l).foldl = function (obj, fn, scope, right) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]], 3 : [right, [1, 2, 3]]}, [
          {obj : 'object|array'},
          {fn : 'function'},
          {scope : 'object|function|defaultobject'},
          {right : 'bool'}
        ]),
        copy = args.obj, i = 0, base, keys, vals;

    // When reducing from right, flip the list
    if (args.right) {
      if ((l).isPlainObject(copy)) {
        keys = (l).keys(copy).reverse();
        vals = (l).values(copy).reverse();
        copy = (l).object(keys, vals);
      } else if ((l).isArray(copy)) {
        copy = copy.reverse();
      }
    }
    base = (l).find(copy, function (value) {
      return value;
    });
    (l).each(copy, function (index, value) {
      if (i !== 0) base = args.fn.call(args.scope || this, base, value, index);
      i++;
    });
    return (l).isArray(base) ? base[0] : base;
  };

  (l).reduceRight = (l).foldr = function (obj, fn, scope) {
    return (l).reduce(obj, fn, scope, true);
  };

  (l).least = function () {
    var args = (l).__args(arguments, {obj : 'object|array', fn : 'function|string', most : 'bool'}),
        comparator, result, ret, leastValue;
    if ((l).isString(args.fn)) {
      result = (l).countBy(args.obj, function (p) {
        return p[args.fn];
      });
      comparator = (l).countBy(args.obj, function (p) {
        return p[args.fn];
      }, this, true);
    }
    else {
      result = (l).countBy(args.obj, args.fn || function (num) {
        return num;
      });
      comparator = (l).countBy(args.obj, args.fn || function (num) {
        return num;
      }, this, true);
    }
    leastValue = (args.most) ? [(l).max(result)] : [(l).min(result)];
    (l).each(result, function (index, value) {
      if (leastValue[0] == value) {
        ret = comparator[index].val[0];
        return false;
      }
    });
    return ret;
  };

  (l).most = function (obj, fn) {
    return (l).least(obj, fn, true);
  };

  (l).shuffle  = function () {
    var args = (l).__args(arguments, {obj : 'object|array'}),
        ret, i, n, copy;
    ret = (l).isPlainObject(args.obj) ? (l).toArray(args.obj) : args.obj;
    for (i = ret.length - 1; i > 0; i--) {
      n = Math.floor(Math.random() * (i + 1));
      copy = ret[i];
      ret[ i ] = ret[n];
      ret[ n ] = copy;
    }
    return ret;
  };

  (l).sample = function () {
    var args = (l).__args(arguments, {obj : 'object|array', n : 'number'}),
        ret = [], i;
    for (i = args.n || 1; i > 0; i--) { ret.push((l).shuffle(args.obj)[0]); }
    return ret;
  };

  (l).has = (l).keyExists = function (obj, key) {
    var args = (l).__args(arguments, {obj : 'object|array', key : 'string|number'});
    return (l).findKey(args.obj, function (index) {
      return !!(args.key === index);
    }) ? true : false;
  };

  (l).contains = (l).inArray = function (obj, value) {
    var args = (l).__args({0 : [obj, [0]], 1 : [value, [0, 1]]}, [
      {obj : 'object|array'},
      {value : '*'}
    ]);
    return (l).findValue(args.obj, function (value) {
      return (l).isEqual(args.value, value) ? true : false;
    }) ? true : false;
  };

  (l).isString = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return typeof args.obj === "string" && {}.toString.call(args.obj) === "[object String]";
  };

  (l).isArray = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return {}.toString.call(args.obj) === "[object Array]";
  };

  (l).isBool = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return {}.toString.call(args.obj) === "[object Boolean]";
  };

  (l).isNull = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return {}.toString.call(args.obj) === "[object Null]";
  };

  (l).isNumber = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return {}.toString.call(args.obj) === "[object Number]";
  };

  (l).isFunction = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return {}.toString.call(args.obj) === "[object Function]";
  };

  (l).isArguments = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return {}.toString.call(args.obj) === "[object Arguments]";
  };

  (l).isUndefined = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return typeof args.obj === "undefined";
  };

  (l).isDate = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return {}.toString.call(args.obj) === "[object Date]" || args.obj instanceof Date;
  };

  (l).isRegExp = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return {}.toString.call(args.obj) === "[object RegExp]" || args.obj instanceof RegExp;
  };

  (l).isPlainObject = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return typeof args.obj === "object" && {}.toString.call(args.obj) === "[object Object]";
  };

  (l).isObject = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return typeof args.obj === "object";
  };

  (l).isElement = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return typeof args.obj === "object" ? args.obj instanceof HTMLElement :
        args.obj && typeof args.obj === "object" && args.obj.nodeType === 1 && typeof args.obj.nodeName === "string";
  };

  (l).isNaN = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return typeof args.obj === "number" && args.obj !== args.obj;
  };

  (l).isFinite = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return args.obj === Infinity || args.obj === -Infinity;
  };

  (l).isEmpty = function () {
    var args = (l).__args(arguments, {obj : 'object|array'});
    return (
        ( (l).isPlainObject(args.obj) && (l).len(args.obj) === 0) ||
            ( (l).isArray(args.obj) && args.obj.length === 0 )
        );
  };

  (l).isFalsy = function () {
    var args = (l).__args(arguments, {obj : '*'});
    return (
        (l).isUndefined(args.obj) ||
            (l).isNull(args.obj) ||
            (l).isNaN(args.obj) ||
            args.obj === "" ||
            args.obj === 0 ||
            ( (l).isBool(args.obj) && Boolean(args.obj) === false )
        );
  };

  (l).isUnique = function () {
    var args = (l).__args(arguments, {obj : 'object|array', key : 'string|number'}),
        target, o;
    if (args.key in args.obj) {
      target = args.obj[args.key];
      args.key = args.key.toString();
      for (o in args.obj) {
        if ((l).isEqual(target, args.obj[o]) && o !== args.key) return false;
      }
    } else {
      throw Error('isUnique(): Target `key` not in collection.');
    }
    return true;
  };

  (l).isEqual = function (obj1, obj2) {
    var args = (l).__args({0 : [obj1, [0]], 1 : [obj2, [1]]}, [
      {obj1 : '*'},
      {obj2 : '*'}
    ]);

    // Quick compare of objects that don't have nested objects or arrays
    if ((l).type(args.obj1) === (l).type(args.obj2) && !(l).isPlainObject(args.obj1) && !(l).isArray(args.obj1)) {
      switch ((l).type(args.obj1)) {
        case "function" :
          if (args.obj1.toString() !== args.obj2.toString()) return false;
          break;
        case "nan" :
          if (args.obj1 === args.obj2) return false;
          break;
        default:
          if (args.obj1 !== args.obj2) return false;
      }

      // Compare objects that do have nested objects
    } else {

      // When target or comparison is falsy we compare them directly
      if ((l).isFalsy(args.obj1) || (l).isFalsy(args.obj2)) {
        if (args.obj1 !== args.obj2) return false;
      }
      for (var o in args.obj1) {
        switch (true) {

          // Catch comparison of element first to prevent infinite loop when caught as objects
          case ( (l).isElement(args.obj1[o]) ) :
            if (args.obj1[o] !== args.obj2[o]) return false;
            break;
          case ( (l).isNaN(args.obj1[o]) ) :
            if (!(l).isNaN(args.obj2[o])) return false;
            break;
          case ( typeof args.obj1[o] === "object" ) :
            if (!(l).isEqual(args.obj1[o], args.obj2[o])) return false;
            break;
          case ( typeof args.obj1[o] === "function" ) :
            if (!(l).isFunction(args.obj2[o])) return false;
            if (args.obj1[o].toString() !== args.obj2[o].toString()) return false;
            break;
          default :
            if (args.obj1[o] !== args.obj2[o]) return false;
        }
      }

      // Reverse comparison of `obj2`
      for (var o in args.obj2) {
        if (typeof args.obj1 === "undefined") return false;
        if (args.obj1 === null || args.obj1 === undefined) return false;
        if ((l).isFalsy(args.obj1[o])) {
          if ((l).isNaN(args.obj1[o])) {
            if (!(l).isNaN(args.obj2[o])) return false;
          } else if (args.obj1[o] !== args.obj2[o]) return false;
        }
      }
    }
    return true;
  };

  (l).type = function () {
    var args = (l).__args(arguments, {obj : '*'}),
        types = "Date RegExp Element Arguments PlainObject Array Function String Bool NaN Finite Number Null Undefined Object".split(" "), i;
    for (i = 0; i < types.length; i++) {
      if ((l)["is" + types[i]].call(this, args.obj)) {
        return types[i]
            .toLowerCase()
            .replace(/plainobject/g, "object")
            .replace(/finite/g, "infinity");
      }
    }
    return false;
  };

  (l).get = function () {
    var args = (l).__args(arguments, {obj : 'object', key : 'string|number'}),
        ns = ( (l).type(args.key) !== "string" ) ? false : args.key.split("."),
        ret;
    if (!args.key) return args.obj;
    if (ns.length > 1) {
      args.obj = (l).get(args.obj, ns.shift());
      args.key = ns.pop();
    }
    if ((l).isPlainObject(args.obj)) {
      if (args.key in args.obj) {
        return args.obj[args.key];
      } else {
        for (var o in args.obj) {
          if ((l).isPlainObject(args.obj[o])) {
            if (ret = (l).get(args.obj[o], args.key)) return ret;
          }
        }
      }
    }
    return false;
  };

  (l).getByType = function (obj, type, key, deep) {
    var args = (l).__args({0 : [obj, [0]], 1 : [type, [1, 2, 3]], 2 : [key, [0, 1, 2, 3]], 3 : [deep, [0, 1, 2, 3]]}, [
          {obj : 'object'},
          {type : ["*"]},
          {key : 'string|number'},
          {deep : 'bool'}
        ]),
        stack = [];

    // Start search starting at key when given
    if (args.key && args.key !== "*") {
      if (!(l).isPlainObject(args.obj = (l).get(args.obj, args.key))) {
        if (args.type === (l).type(args.obj) || args.type === "*") {
          var objWrapper = {};
          args.key = args.key.split(".");
          objWrapper[args.key[args.key.length - 1]] = args.obj;
          stack.push(objWrapper);
          return stack;
        }
      }
    }

    // Perform deep search for objects of type
    (l).deep(args.obj, function (depth, index, elm) {
      if (args.type === (l).type(elm) || args.type === "*") {
        var objWrapper = {};
        objWrapper[index] = elm;
        stack.push(objWrapper);
      }
    }, (args.deep ? "*" : 1), true);
    return stack;
  };

  (l).extend = (l).merge = function () {
    var args = (l).__args(arguments, {deep : 'bool', '*' : 'obj:object'}),
        keys = [], objs = [],
        target, obj, copy, key, i;

    // Collect potential objects to merge
    objs = (l).filter(args, function (value) {
      if ((l).isPlainObject(value) && !(l).isEqual(target, value)) return value;
    });

    // Shift target off of the `objs` array
    target = objs.shift();

    // When TRUE is passed perform deep iteration on target
    if (args.deep) {

      // Build property reference used to prevent never ending loops
      (l).each(objs, function (index, value) {
        keys.push((l).keys(value));
        keys = (l).flatten(keys);
      });

      // Add properties to all nested objects
      (l).deep(target, function (depth, index, obj) {
        if ((l).indexOf(keys, index) === -1) {
          for (i = 0; i < objs.length; i++) {
            for (key in objs[i]) {
              if ((l).isPlainObject(obj)) {
                copy = objs[i][key];
                obj[key] = copy;
              }
            }
          }
        }
      }, "*");
    }

    // Merge first level properties after going deep
    for (i = 0; i < objs.length; i++) {
      if (( obj = objs[i] ) !== null) {
        for (key in obj) {
          copy = obj[key];
          if (target === copy) continue;
          target[ key ] = copy;
        }
      }
    }
    return target;
  };

  (l).call = function (obj, key, fargs, deep, only) {
    var args = (l).__args({0 : [obj, [0]], 1 : [key, [0, 1]], 2 : [fargs, [1, 2]], 3 : [deep, [0, 1, 2, 3]], 4 : [only, [1, 2, 3, 4]]}, [
          {obj : 'object'},
          {key : 'string|number'},
          {fargs : 'array'},
          {deep : 'bool'},
          {only : 'string'}
        ]),
        only = (l).isString(args.only) ? args.only.split(" ") : args.only,
        fns = (l).functions(args.obj, args.key, args.deep);
    return (l).filter(fns, function (value, index) {
      var key = (l).keys(value)[0];
      if (only) {
        if ((l).inArray(only, index)) {
          value[key].apply(this, args.fargs);
          return true;
        }
      } else {
        value[key].apply(this, args.fargs);
        return true;
      }
    });
  };

  (l).invoke = function (obj, fn, fargs) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [fargs, [1, 2]]}, [
          {obj : 'object|array'},
          {fn : 'function|string'},
          {fargs : 'array'}
        ]),
        fargs = args.fargs || [], ret;
    return (l).map(args.obj, function (value) {
      fargs.unshift(value);
      ret = ((l).isFunction(args.fn) ? args.fn : value[args.fn]).apply(value, fargs);
      fargs.shift();
      return ret;
    });
  };

  (l).parent = function () {
    var args = (l).__args(arguments, {obj : 'object', key : 'string|number'}),
        target = args.key ? (l).get(args.obj, args.key) : args.obj,
        objs = (l).getByType(args.obj, true);
    for (var o in objs) {
      if ((l).isPlainObject(objs[o])) {
        for (var p in objs[o]) {
          if ((l).isEqual(objs[o][p], target)) return objs[o];
        }
      }
    }
    return args.obj;
  };

  (l).invert = function () {
    var args = (l).__args(arguments, {obj : 'object|array'}), invertedObj = {};
    (l).each(args.obj, function (index, value) {
      invertedObj[value] = index;
    });
    return invertedObj;
  };

  (l).paths = function (obj, pathObj, lastKey, nextKey) {
    var args = (l).__args([obj], {obj : 'object'}),
        o, key, subPath,
        pathObj = pathObj ? pathObj : {},
        lastKey = lastKey ? lastKey : "",
        nextKey = nextKey ? nextKey : "";
    for (o in args.obj) {
      pathObj[o] = (nextKey + "." + lastKey + "." + o).replace(/^[.]+/g, "");
      key = nextKey + "." + lastKey;
      if ((l).isPlainObject(args.obj[o])) (l).paths(args.obj[o], pathObj, o, key);
    }
    return pathObj;
  };

  (l).resolve = function () {
    var args = (l).__args(arguments, {obj : 'object', key : 'string|number'});
    if (!args.key) args.key = (l).keys(args.obj)[0];
    return (l).paths(args.obj)[args.key];
  };

  (l).module = (l).build = function ( obj, ns, members, deep ) {
    var args = (l).__args({0 : [obj, [0]], 1 : [ns, [0, 1]], 2 : [members, [1, 2, 3, 4]], 3 : [deep, [2, 3, 4, 5]]}, [
      {obj : 'object|defaultobject|function'},
      {ns : 'string|number'},
      {members : 'object|function'},
      {deep : 'bool'}
    ]);
    if (!args.ns) throw Error('_.build(): Argument `ns` is missing or not a string.');
    var members, o, list = args.ns ? args.ns.split(".") : [];
    var ns = list ? list.shift() : (args.ns || "");
    obj = args.obj || {};

    // Build namespace object attaching it to the previous object recursively
    obj[ns] = obj[ns] || {};
    if (list.length) (l).module(obj[ns], list.join('.'), args.members, args.deep);

    // Merge `members` object and its constructs onto namespace object `obj`
    if (args.ns.split(args.ns.length - 1)[0] === ns && (l).isPlainObject(args.members)) {

      // Merge newly created object with members object
      obj[ns] = (l).extend(obj[ns], args.members, args.deep);

      // When members contains the `_extends` property
      if ('_extends' in obj[ns]) {
        if ((l).isArray(obj[ns]['_extends'])) {
          var extensions = obj[ns]['_extends'];
          delete obj[ns]['_extends'];
          extensions.push(args.deep);

          // Extend newly created object with objects in the extensions array
          extensions.unshift(obj[ns]);
          (l).extend.apply(this, extensions);
        }
      }

      // When members contains the `_retract` property
      if ('_exposed' in obj[ns]) {

        // Get the keys of objects to be exposed upon
        var exposures = obj[ns]['_exposed'];
        delete obj[ns]['_exposed'];

        // Get the objects to expose properties on
        var exposedObjects = [];
        for (var e in exposures) {
          var eObj = (l).get(obj[ns], exposures[e]);
          if ((l).isPlainObject(eObj)) exposedObjects.push(eObj);
        }

        // Get the properties to extend onto the exposures
        var members = {};
        var propsArray = (l).getByType(obj[ns], "*", args.deep);
        for (var o in propsArray) {
          members[ o ] = propsArray[o];
        }

        // Extend the exposed objects with properties
        for (var o in obj[ns]) {
          if ((l).isPlainObject(obj[ns][o]) && (l).inArray(exposures, o)) {
            for (var e in members) {
              var prop = members[e];

              if (!(o in prop)) (l).extend(obj[ns][o], prop);
            }
          }
        }
      }

      // When members contains the `_exposed` property
      if ('_retract' in obj[ns]) {
        var retractions = obj[ns]['_retract'];
        members = (l).objects(obj[ns], args.deep);

        // Retract all children members referenced in the array
        if ((l).isArray(obj[ns]['_retract'])) {
          delete obj[ns]['_retract'];

          // Get the children object members
          (l).each(members, function (index, elm) {
            for (o in elm) {

              // If we encounter a retraction, parent "inherits" from children
              if ((l).inArray(retractions, o)) (l).extend(obj[ns], elm[o], args.deep);
            }
          });

          // Retract only the children members targeted in the retraction object
        } else if ((l).isPlainObject(obj[ns]['_retract'])) {
          delete obj[ns]['_retract'];

          // Get members that exist at referenced targets
          var targets = [];
          (l).each(members, function (index, elm) {
            for (o in retractions) {
              if ((l).isArray(retractions[o])) targets.push((l).get(elm, o));
            }
          });

          // Selectively inherit from children
          targets.unshift(obj[ns], args.deep);
          (l).extend.apply(obj[ns], targets);
        }
      }
    }
    return obj;
  };

  (l).add = function (obj, key, value) {
    var args = (l).__args({0 : [obj, [0]], 1 : [key, [0, 1]], 2 : [value, [1, 2]]}, [
      {obj : 'object|array'},
      {key : 'string|number'},
      {value : '*'}
    ]);
    if (!(args.key in args.obj)) args.obj[args.key] = args.value;
    return args.obj;
  };

  (l).set = function (obj, key, value) {
    var args = (l).__args({0 : [obj, [0]], 1 : [key, [0, 1]], 2 : [value, [1, 2]]}, [
      {obj : 'object|array'},
      {key : 'string|number'},
      {value : '*'}
    ]);
    args.obj[args.key] = args.value;
    return args.obj;
  };

  (l).setUndef = function (obj, value) {
    var args = (l).__args({0 : [obj, [0]], 1 : [value, [0, 1]]}, [
      {obj : 'object|array'},
      {value : '*'}
    ]);
    (l).each(args.obj, function (index, value) {
      if ((l).isUndefined(value)) args.obj[index] = args.value;
    });
    return args.obj;
  };

  (l).defaults = function (obj, defaults) {
    var args = (l).__args({0 : [obj, [0]], 1 : [defaults, [0, 1]]}, [
      {obj : 'object'},
      {defaults : 'object'}
    ]);
    (l).each(args.defaults, function (index, value) {
      if (!(index in args.obj)) {
        args.obj[ index ] = value;
      } else if (index in args.obj) {
        if ((l).isNull(args.obj[index]) || (l).isUndefined(args.obj[index])) args.obj[ index ] = value;
      }
    });
    return args.obj;
  };

  (l).clone = function () {
    var args = (l).__args(arguments, {obj : 'object|array'}),
        ret = (l).isArray(args.obj) ? [] : {};
    for (var i in args.obj) {
      if ((l).isPlainObject(args.obj[i]) || (l).isArray(args.obj[i])) {
        ret[i] = (l).clone(args.obj[i]);
      } else {
        ret[i] = args.obj[i];
      }
    }
    return ret;
  };

  (l).nest = function () {
    var args = (l).__args(arguments, {obj : 'object', prefix : ["", 'string|number']});
    return (l).each(args.obj, function (index, value) {
      var newObj = {};
      newObj[args.prefix + index] = value;
      args.obj[index] = newObj;
    });
  };

  (l).remove = function (obj, key) {
    var args = (l).__args({0 : [obj, [0]], 1 : [key, [0, 1]]}, [
          {obj : 'object|array'},
          {key : 'string|number|array'}
        ]),
        rest, from;
    if ((l).isPlainObject(args.obj)) {
      if ((l).isArray(args.key)) {
        for (var i = 0; i < args.key.length; i++) {
          if (args.key[i] in args.obj) delete args.obj[args.key[i]];
        }
      } else {
        if (args.key in args.obj) delete args.obj[args.key];
      }
    } else if ((l).isArray(args.obj)) {
      from = parseInt(args.key);
      rest = args.obj.slice((from) + 1);
      args.obj.length = (from < 0) ? args.obj.length + from : from;
      args.obj.push.apply(args.obj, rest);
    }
    return args.obj;
  };

  (l).clear = function (obj) {
    var args = (l).__args(arguments, {obj : 'object|array'});
    if ((l).isPlainObject(args.obj)) {
      (l).each(args.obj, function (index) { delete args.obj[index]; });
    } else if ((l).isArray(args.obj)) {
      args.obj.length = 0;
    }
    return args.obj;
  };

  (l).empty = function (obj) {
    var args = (l).__args(arguments, {obj : 'object|array'});
    if ((l).isPlainObject(args.obj) || (l).isArray(args.obj)) {
      (l).each(args.obj, function (index) { args.obj[index] = undefined; });
    }
    return args.obj;
  };

  (l).replace = function (obj, fn, scope) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]]}, [
      {obj : 'object|array'},
      {fn : 'function'},
      {scope : 'object|function|defaultobject'}
    ]), ret;
    if ((l).isPlainObject(args.obj)) {
      ret = {};
      (l).each(args.obj, function (index, value) { ret[index] = args.fn.call(this, value); });
    } else if ((l).isArray(args.obj)) {
      ret = [];
      (l).each(args.obj, function (index, value) { ret.push(args.fn.call(this, value)); });
    }
    return ret;
  };

  (l).deep = function (obj, fn, fargs, depth, arrs) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [fargs, [1, 2, 3, 4]], 3 : [depth, [1, 2, 3]], 4 : [arrs, [2, 3, 4]]}, [
      {obj : 'object|array'},
      {fn : 'function'},
      {fargs : [[]]},
      {depth : ["*"]},
      {arrs : 'bool'}
    ]);
    for (var o in args.obj) {
      args.fargs.unshift(args.depth, o, args.obj[o], args.obj);
      var res = args.fn.apply(this, args.fargs);
      if (res === false) break;
      if ((l).isPlainObject(args.obj[o]) || ( (l).isArray(args.obj[o]) && !args.arrs )) {
        args.depth = (args.depth === "*") ? "*" : args.depth - 1;
        args.fargs = (l).tail(args.fargs, 4);
        if (args.depth) (l).deep(args.obj[o], args.fn, args.fargs, args.scope, args.depth, args.arrs);
      }
      args.fargs = (l).tail(args.fargs, 4);
    }
    return args.obj;
  };

  (l).tap = function () {
    var args = (l).__args(arguments, {obj : 'object|array', fn : 'function'});
    return args.fn.call(this, args.obj);
  };

  (l).where = function (obj, matches, find) {
    var args = (l).__args({0 : [obj, [0]], 1 : [matches, [0, 1]], 2 : [find, [1, 2]]}, [
      {obj : 'object|array'},
      {matches : 'array|object'},
      {find : 'bool'}
    ]);
    return (l)[find ? 'find' : 'filter'](args.obj, function (value) {
      for (var key in args.matches) {
        if (args.matches[key] !== value[key]) return false;
      }
      return true;
    });
  };

  (l).whereFirst = function (obj, matches) {
    var args = (l).__args({0 : [obj, [0]], 1 : [matches, [0, 1]]}, [
      {obj : 'object|array'},
      {matches : 'array|object'}
    ]);
    return (l).where(args.obj, args.matches, true);
  };

  (l).groupsOf = function (obj, n, pad) {
    var args = (l).__args({0 : [obj, [0]], 1 : [n, [0, 1]], 2 : [pad, [1, 2]]}, [
          {obj : 'array|object'},
          {n : 'number'},
          {pad : '*'}
        ]),
        res = [], i = 1, key;
    (l).each(args.obj, function (index, value) {
      if ( (key in res) && i < args.n ) {
        res[key].push(value);
        i += 1;
      } else {
        key = (l).len(res);
        res[key] = [value];
        i = 1;
      }
    });
    if (args.pad) {
      (l).each(res, function (index, value) {
        if (value.length < args.n) {
          for (i = value.length; i < args.n; i++) { res[index].push(args.pad); }
        }
      });
    }
    return res;
  };

  (l).groupBy = function (obj, map, scope, count, key) {
    var args = (l).__args({0 : [obj, [0]], 1 : [map, [0, 1]], 2 : [scope, [1, 2]], 3 : [count, [2, 3]], 4 : [key, [4]]}, [
          {obj : 'array|object'},
          {map : 'function|string'},
          {scope : 'function|object|defaultobject'},
          {count : 'bool'},
          {key : 'bool'}
        ]),
        res = {};
    (l).each(args.obj, function (index, value) {
      var key = (l).isString(args.map) ? value[args.map] : args.map.call(args.scope || this, value, index, args.obj);
      if ((l).has(res, key)) {
        res[key].push(value);
      } else {
        res[key] = [value];
      }
    });
    if (args.count) {
      (l).each(res, function (index, value) {
        if (args.key) {
          res[index] = {};
          res[index].len = value.length;
          res[index].val = value;
          res[index].key = index;
        } else {
          res[index] = value.length;
        }
      });
    }
    return res;
  };

  (l).countBy = function (obj, map, scope, index) {
    return (l).groupBy(obj, map, scope || this, true, index);
  };

  (l).keys = function () {
    var args = (l).__args(arguments, {obj : 'object|array|function|defaultobject'}),
        o, keys = [];
    for (o in args.obj) { keys.push(o); }
    return keys;
  };

  (l).values = function () {
    var args = (l).__args(arguments, {obj : 'object|array|function|defaultobject'}),
        o, vals = [];
    for (o in args.obj) { vals.push(args.obj[o]); }
    return vals;
  };

  (l).pairs = function () {
    var args = (l).__args(arguments, {obj : 'object'}),
        pairs = [];
    if ((l).isPlainObject(args.obj)) {
      (l).each(args.obj, function (index, value) { pairs.push([index, value]); });
    }
    return pairs;
  };

  (l).len = function (obj, deep, count) {
    var args = (l).__args([obj, deep], {obj : 'object|array', deep : 'bool'}),
        count = count ? (count += (l).keys(args.obj).length) : (l).keys(args.obj).length, o;
    if (args.deep) {
      for (o in args.obj) {
        if ((l).isPlainObject(args.obj[o]) || (l).isArray(args.obj[o])) {
          var ret = (l).len(args.obj[o], args.deep, count);
          if ((l).type(args.obj[o]) === "array") {
            return ret - 1;
          } else if ((l).type(args.obj[o]) === "object") {
            return ret;
          }
        }
      }
    }
    return count;
  };

  (l).size = function (obj, deep, count) {
    var args = (l).__args([obj, deep], {obj : 'object|array', deep : 'bool'}),
        count = count ? count : 0, o;
    (l).each((l).values(args.obj), function (index, value) {
      if (!(l).isFalsy(value)) count += 1;
    });
    if (args.deep) {
      for (o in args.obj) {
        if ((l).isPlainObject(args.obj[o]) || (l).isArray(args.obj[o])) {
          var ret = (l).size(args.obj[o], args.deep, count);
          if ((l).type(args.obj[o]) === "array") {
            return ret - 1;
          } else if ((l).type(args.obj[o]) === "object") {
            return ret;
          }
        }
      }
    }
    return count;
  };

  (l).howDeep = function () {
    var args = (l).__args(arguments, {obj : 'object', key : 'string|number'}),
        paths = (l).paths(args.obj),
        objs = (l).getByType(args.obj, true);
    if (args.key) {
      if (args.key in paths) return paths[args.key].split(".").length;
    } else {
      for (var o in objs) {
        if ((l).isEqual(args.obj, objs[o])) return (l).howDeep(o);
      }
    }
  };

  (l).toQueryString = function () {
    var args = (l).__args(arguments, {obj : 'object', prefix : 'string'}),
        ret = "";
    (l).deep(args.obj, function (depth, index, value) {
      index = index.toString();
      if (!(l).isPlainObject(value)) {
        if ((l).isArray(value)) {
          (l).deep(value, function (arrDepth, arrIndex, arrValue) {
            arrIndex = arrIndex.toString();
            ret += (args.prefix ? args.prefix + index + "[]" : index + "[]") + "=" + arrValue + "&";
          }, "*");
        } else {
          ret += (args.prefix ? args.prefix + index : index) + "=" + value + "&";
        }
      }
    }, "*", true);
    ret = encodeURIComponent(ret.replace(/&$/g, ''));
    return ret;
  };

  (l).fromQueryString = function () {
    var args = (l).__args(arguments, {obj : 'string', deep : 'bool'}),
        ret = {}, parts;
    (l).each(decodeURIComponent(args.obj).split("&"), function (index, value) {
      parts = value.split("=");
      if (parts[0].match(/\[\]/g) && args.deep) {
        parts[0] = parts[0].replace(/\[\]/g, '');
        if (parts[0] in ret) {
          ret[ parts[0] ].push(parts[1]);
        } else {
          ret[ parts[0] ] = [parts[1]];
        }
      } else {
        ret[ parts[0] ] = parts[1];
      }
    });
    return ret;
  };

  (l).htmlEncode = function () {
    var args = (l).__args(arguments, {str : 'string'});
    var entities = {
      '\u0026':['amp'], '\u0022':['quot'], '\u0027':['apos'], '\u003C':['lt'],
      '\u003E':['gt'], '\u00A0':['nbsp'], '/':['#x2F']
    };
    for (var e in entities) {
      var entity = new RegExp(e, 'g');
      args.str = args.str.replace(entity, '&' + entities[e][0] + ';');
    }
    return args.str;
  };

  (l).htmlDecode = function () {
    var args = (l).__args(arguments, {str : 'string'});
    var entities = {
      '&quot;':['\"'], '&amp;':['&'], '&apos;':["'"], '&lt;':['<'],
      '&gt;':['>'], '&nbsp;':[' '], '&#x2F;':['/']
    };
    for (var e in entities) {
      var entity = new RegExp(e, 'g');
      args.str = args.str.replace(entity, entities[e][0]);
    }
    return args.str;
  };

  (l).at = function (obj, index) {
    var args = (l).__args({0 : [obj, [0]], 1 : [index, [0, 1]]}, [
      {obj : 'array'},
      {index : 'array|number'}
    ]);
    return (l).filter(args.obj, function (value, index) {
      if ((l).isArray(args.index)) {
        for (var i = 0; i < args.index.length; i++) {
          if (args.index[i] === index) return true;
        }
      } else if ((l).isNumber(args.index)) {
        if (index === args.index) return true;
      }
      return false;
    });
  };

  (l).first = function () {
    var args = (l).__args(arguments, {obj : 'array', n : 'number'}),
        n = args.n ? args.n : 1, i = 0, ret = [];
    for (; i < n; i++) { ret.push(args.obj[i]); }
    return ret;
  };

  (l).initial = function () {
    var args = (l).__args(arguments, {obj : 'array', n : 'number'}),
        n = args.n ? args.obj.length - args.n : args.obj.length - 1, i = 0, ret = [];
    for (; i < n; i++) { ret.push(args.obj[i]); }
    return ret;
  };

  (l).last = function () {
    var args = (l).__args(arguments, {obj : 'array', n : 'number'}),
        n = args.n ? args.obj.length - args.n : args.obj.length - 1, i = args.obj.length, ret = [];
    for (; n < i; n++) { ret.push(args.obj[n]); }
    return ret;
  };

  (l).rest = (l).tail = function () {
    var args = (l).__args(arguments, {obj : 'array', n : 'number'}),
        n = args.n ? args.n : 1, i = args.obj.length, ret = [];
    for (; n < i; n++) { ret.push(args.obj[n]); }
    return ret;
  };

  (l).compact = function () {
    var args = (l).__args(arguments, {obj : 'array', all : 'bool'});
    return (l).filter(args.obj, function (value) {
      if (!args.all) {
        if (!(l).isFalsy(value) || ( ( (l).isPlainObject(value) || (l).isArray(value) ) && (l).len(value) === 0 )) return value;
      } else if (!(l).isFalsy(value) && !(l).isEmpty(value)) {
        return value;
      }
    });
  };

  (l).flatten = function () {
    var args = (l).__args(arguments, {obj : 'array|object', n : 'number|string'}),
        n = args.n ? args.n : "*", ret = [], type = (l).type(args.obj);
    (l).deep(args.obj, function (depth, index, elm) {
      switch (type) {
        case "array" :
          if (n === "*") {
            if (!(l).isArray(elm)) ret.push(elm);
          } else if (depth > 1) {
            if (!(l).isArray(elm)) ret.push(elm);
          } else {
            ret.push(elm);
          }
          break;
        case "object" :
          if (n === "*") {
            if (!(l).isPlainObject(elm)) ret[index] = elm;
          } else if (depth > 1) {
            if (!(l).isPlainObject(elm)) ret[index] = elm;
          } else {
            ret[index] = elm;
          }
          break;
      }
    }, n);
    return ret;
  };

  (l).without = (l).exclude = function (obj, values) {
    var args = (l).__args({0 : [obj, [0]], 1 : [values, [0, 1]]}, [
      {obj : 'array'},
      {values : 'array'}
    ]);
    return (l).filter(args.obj, function (value) {
      for (var i = 0; i < args.values.length; i++) {
        if ((l).isEqual(args.values[i], value)) return false;
      }
      return true;
    });
  };

  (l).uniq = (l).unique = function (obj, fn, scope) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]]}, [
          {obj : 'array'},
          {fn : 'function'},
          {scope : 'object|function|defaultobject'}
        ]),
        ret = [], seen = [], target;
    target = args.fn ? (l).map(args.obj, args.fn, args.scope) : args.obj;
    (l).each(target, function (index, value) {
      if (!(l).contains(seen, value)) {
        seen.push(value);
        ret.push(value);
      }
    });
    return ret;
  };

  (l).union = function () {
    var args = (l).__args(arguments, {'*' : ':*'});
    return (l).uniq((l).flatten((l).toArray(args)));
  };

  (l).intersection = function () {
    var args = (l).__args(arguments, {'*' : 'arr:array'}),
        arrs = [], rest;

    // Put passed arrays into arrs array
    (l).each(args, function (index, value) {
      if (index !== "obj" && index !== "length") arrs.push(value);
    });

    // Make sure target array is first element
    rest = Array.prototype.slice.call(arrs, 1);
    return (l).filter((l).uniq(arrs[0]), function (item) {
      return (l).every(rest, function (other) {
        return (l).indexOf(other, item) >= 0;
      });
    });
  };

  (l).difference = function () {
    var args = (l).__args(arguments, {'*' : 'arr:array'}),
        arrs = [], rest;
    (l).each(args, function (index, value) {
      if (index !== "obj" && index !== "length") arrs.push(value);
    });
    rest = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arrs, 1));
    return (l).filter((l).uniq(arrs[0]), function (value) {
      return !(l).inArray(rest, value);
    });
  };

  (l).zip = function () {
    var args = (l).__args(arguments, {'*' : 'arr:array'}),
        i = 0, arrs = [], ret = [];
    (l).each(args, function (index, value) {
      if (index !== "obj" && index !== "length") arrs.push(value);
    });
    for (; i < arrs[0].length; i++) { ret[i] = (l).pluck(arrs, "" + i); }
    return ret;
  };

  (l).range = function (start, stop, step) {
    var args = (l).__args({0 : [start, [0]], 1 : [stop, [0, 1]], 2 : [step, [1, 2]]}, [
          {start : 'number'},
          {stop : 'number'},
          {step : 'number'}
        ]),
        i = 0, ret = [];
    var len = Math.max(Math.ceil((args.stop - args.start) / args.step), 0);
    while (i < len) {
      ret[ i++ ] = args.start;
      args.start += args.step;
    }
    return ret;
  };

  (l).uniqueId = function() {
    var args = (l).__args(arguments, {prefix:["", 'number|string']}),
        self = (l).uniqueId;
    if ( !('uuids' in self) ) self.uuids = [];
    var newId = args.prefix + Math.floor((1 + Math.random()) * 0x10000).toString(10).substring(1);
    if ( !(l).inArray(self.uuids, newId) ) {
      self.uuids.push(newId);
      return newId;
    } else {
      (l).uniqueId();
    }
  };

  (l).array = (l).toArray = function () {
    var args = (l).__args(arguments, {'*' : ':object'}), ret = [];
    if (args.length > 1) {
      for (var i = 0; i < args.length; i++) {
        (l).each(args[i], function (index, value) { ret.push(value); });
      }
    } else {
      (l).each(args[0], function (index, value) { ret.push(value); });
    }
    return ret;
  };

  (l).object = (l).toObject = function () {
    var args = (l).__args(arguments, {'*' : ':*'}),
        arrs = [], keys = [], ret = {}, allArrays = true;
    (l).each(args, function (index, value) {
      if ((l).isArray(value)) {
        arrs.push(value);
      } else {
        allArrays = false;
      }
    });
    if (arrs.length === 2) {
      keys = arrs[1];
      (l).each(arrs[0], function (index, value) { ret[ value ] = keys[index]; });
    } else if ( allArrays ) {
      for (var i = 0; i < arrs.length; i ++) {
        var key = arrs[i][0];
        var val = arrs[i][1];
        ret[ key ] = val;
      }
    } else {
      for (var i = 0; i < args.length; i += 2) { ret[ args[i] ] = args[i + 1]; }
    }
    return ret;
  };

  (l).lastIndexOf = function (obj, value, from, first) {
    var args = (l).__args({0 : [obj, [0]], 1 : [value, [0, 1]], 2 : [from, [1, 2]], 3 : [first, [1, 2, 3]]}, [
      {obj : 'array'},
      {value : '*'},
      {from : 'number'},
      {first : 'bool'}
    ]);
    if (args.first) {
      var i = args.from || 0;
      for (; i < args.obj.length; i++) {
        if ((l).isEqual(args.obj[i], args.value)) return i;
      }
    } else {
      var i = (args.obj.length - args.from) || args.obj.length;
      while (i--) {
        if ((l).isEqual(args.obj[i], args.value)) return i;
      }
    }
    return -1;
  };

  (l).indexOf = (l).firstIndexOf = function (obj, value, from) {
    return (l).lastIndexOf(obj, value, from, true);
  };

  (l).sortBy = function (obj, fn, scope) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]]}, [
      {obj : 'array'},
      {fn : 'function'},
      {scope : 'object|function|defaultobject'}
    ]);
    return (l).pluck((l).map(args.obj,function (value, index, list) {
      return {
        value : value,
        index : index,
        criteria : args.fn.call(args.scope, value, index, list)
      };
    }).sort(function (left, right) {
          var a = left.criteria;
          var b = right.criteria;
          if (a !== b) {
            if (a > b || a === void 0) return 1;
            if (a < b || b === void 0) return -1;
          }
          return left.index < right.index ? -1 : 1;
        }), 'value');
  };

  (l).after = function () {
    var args = (l).__args(arguments, {fn : 'function', n : 'number'});
    args.fn.n = args.fn.after = args.n;
    return function () {
      if (args.fn.n > 1) {
        args.fn.n--;
      } else {
        args.fn.apply(this, arguments);
        args.fn.n = args.fn.after;
      }
    };
  };

  (l).once = function () {
    var args = (l).__args(arguments, {fn : 'function'});
    args.fn.n = args.fn.once = 1;
    return function () {
      if (args.fn.n) {
        args.fn.n--;
        return args.fn.apply(this, arguments);
      }
    };
  };

  (l).times = function () {
    var args = (l).__args(arguments, {fn : 'function', n : 'number'});
    args.fn.n = args.n;
    return function () {
      for (var i = 0; i < args.fn.n; i++) { args.fn.apply(this, arguments); }
    };
  };

  (l).wrap = function (fn, wrapper) {
    var args = (l).__args({0 : [fn, [0]], 1 : [wrapper, [1]]}, [
      {fn : 'function'},
      {wrapper : 'function'}
    ]);
    return function () {
      var fargs = [args.fn];
      fargs.push.apply(fargs, arguments);
      return args.wrapper.apply(this, fargs);
    };
  };

  (l).compose = function () {
    var fns = (l).toArray((l).__args(arguments, {'*' : 'fns:function'}));
    return function () {
      var args = arguments;
      for (var i = fns.length - 1; i >= 0; i--) { args = [fns[i].apply(this, args)]; }
      return args[0];
    };
  };

  (l).bind = function (obj, fn, scope, fargs) {
    var args = (l).__args({0 : [obj, [0]], 1 : [fn, [0, 1]], 2 : [scope, [1, 2]], 3 : [fargs, [2, 3]]}, [
      {obj : 'object'},
      {fn : '*'},
      {scope : 'object|function|defaultobject'},
      {fargs : 'array'}
    ]);
    if (!args.fargs) args.fargs = [];
    return function () {
      for (var i = 0; i < arguments.length; i++) { args.fargs.push(arguments[i]); }
      return args.fn.apply(args.scope, args.fargs);
    };
  };

  (l).bindAll = function (obj, methods) {
    var args = (l).__args({0 : [obj, [0]], 1 : [methods, [0, 1]]}, [
      {obj : 'object'},
      {methods : 'array|object'}
    ]);
    if (args.length === 1 && args.obj) {
      (l).each(args.obj, function (f) {
        if ((l).isFunction(args.obj[f])) args.obj[f] = (l).bind(args.obj[f], args.obj);
      });
    } else if (args.length === 2) {
      (l).each(args.methods, function (f) { args.obj[f] = (l).bind(args.obj[f], args.obj); });
    }
    return args.obj;
  };

  (l).fill = (l).partial = function () {
    var args = (l).__args(arguments, {fn : 'function', fargs : 'array'});
    return function () {
      for (var i = 0; i < arguments.length; i++) { args.fargs.push(arguments[i]); }
      return args.fn.apply(this, args.fargs);
    };
  };

  (l).memoize = function (fn, hash) {
    var args = (l).__args({0 : [fn, [0]], 1 : [hash, [1]]}, [
          {fn : 'function'},
          {hash : 'function'}
        ]),
        memo = {};
    args.hash || (args.hash = (l).identity);
    return function () {
      var key = args.hash.apply(this, arguments);
      return (l).has(memo, key) ? memo[key] : (memo[key] = args.fn.apply(this, arguments));
    };
  };

  (l).delay = function () {
    var args = (l).__args(arguments, {fn : 'function', ms : 'number'});
    return function () {
      var fargs = arguments;
      setTimeout(function () {
        return args.fn.apply(null, fargs);
      }, args.ms);
    }
  };

  (l).defer = function () {
    var args = (l).__args(arguments, {fn : 'function'});
    return (l).delay.call(this, args.fn, 0);
  };

  (l).throttle = function () {
    var args = (l).__args(arguments, {fn : 'function', ms : 'number'}),
        scope, last, timeout, fargs, ret, res, later;
    later = function () {
      last = new Date;
      timeout = null;
      ret = args.fn.apply(scope, fargs);
    };
    return function () {
      var now = new Date();
      var left = args.ms - (now - last);
      scope = this;
      fargs = arguments;
      if (left <= 0) {
        clearTimeout(timeout);
        timeout = null;
        last = now;
        res = args.fn.apply(scope, fargs);
      } else if (!timeout) {
        timeout = setTimeout(later, left);
      }
      return res;
    }
  };

  (l).debounce = function () {
    var args = (l).__args(arguments, {fn : 'function', n : 'number', edge : 'bool'}),
        res, timeout;
    return function () {
      var scope = this, fargs = arguments;
      var next = function () {
        timeout = null;
        if (!args.edge) res = args.fn.apply(scope, fargs);
      };
      var ready = args.edge && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(next, args.n);
      if (ready) res = args.fn.apply(scope, fargs);
      return res;
    };
  };

  (l).value = function (value) {
    return (l).isFunction(value) ? value() : value;
  };

  (l).result = (l).end = function (obj) {
    return this._chain ? (l)(obj).chain() : obj;
  };

  (l).noConflict = function () {
    root['_'] = previousLib;
    return (l);
  };

  (l).identity = function (value) {
    return value;
  };

  (l).chain = function () {
    return (l).apply(this, arguments).chain();
  };

  // Generate [type]s() methods
  (l).each(['array', 'object', 'function', 'string', 'bool', 'number', 'null', 'undefined', 'date', 'regexp', 'element', 'nan'],
      function (index, type) {
        (l)[ type + 's' ] = function () {
          var args = (l).__args(arguments, {obj : 'object', key : 'string|number', deep : 'bool'});
          return (l).getByType(args.obj, type, args.key, args.deep);
        };
      });

  // Generate no[Type]s() methods
  (l).each(['array', 'object', 'function', 'string', 'bool', 'number', 'null', 'undefined', 'date', 'regexp', 'element', 'nan'],
      function (index, name) {
        (l)[ 'no' + name.charAt(0).toUpperCase() + name.slice(1) + 's' ] = function () {
          var args = (l).__args(arguments, {obj : 'object', key : 'string|number', deep : 'bool'});
          return (l).filter((l).getByType(args.obj, "*", args.key, args.deep),
              function (index, value) {
                if (!((l).type(value) === name)) return value;
              });
        };
      });

  // Generate [type]Names methods
  (l).each(['array', 'object', 'function', 'string', 'bool', 'number', 'null', 'undefined', 'date', 'regexp', 'element', 'nan'],
      function (index, name) {
        (l)[ name + 'Names' ] = function () {
          var args = (l).__args(arguments, {obj : 'object', key : 'string|number', deep : 'bool'});
          var names = [];
          (l).filter((l).getByType(args.obj, name, args.key, args.deep), function (value) {
            names.push((l).keys(value)[0]);
          });
          return names;
        };
      });

  // Add native sort method to library
  (l).each(['sort'], function (index, name) {
    if (Array.prototype[name]) {
      (l)[name] = !(l)[name] ? Array.prototype[name] : (l)[name];
    }
  });

  // Attach library's methods to its prototype
  (l).each((l).filter((l).keys((l)), function (value) {
    if (!(l).inArray(['_version', '__args'], value)) return true;
  }), function (index, name) {
    var fn = (l)[name];
    (l).prototype[name] = function () {
      var args = [this._wrapped];
      Array.prototype.push.apply(args, arguments);
      return (l).result.call(this, fn.apply((l), args));
    };
  });

  // Add OOP methods to the library's prototype
  (l).extend((l).prototype, {
    chain : function () {
      this._chain = true;
      return this;
    },
    end : function () {
      this._chain = false;
      return (l)._wrapped[0];
    }
  });

})();