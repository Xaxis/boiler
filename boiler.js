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
    for (var i = 0; i < arguments.length; i++) { push(arguments[i]); }
    (l)._global = args;
    (l)._wrapped = obj;
    if (obj instanceof (l)) return obj;
    if (!(this instanceof (l))) return new (l)(arguments);
  };

  // Library version
  (l)._version = "0.5.3";

  // Documentation: https://github.com/Xaxis/js/blob/master/args/args.js
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

  /* ARRAY METHODS */

  (l).at = function (arr, index) {
    return (l).filter(arr, function (value, key) {
      if ((l).isArray(index)) {
        for (var i = 0; i < index.length; i++) { if (index[i] === key) return true; }
      } else if ((l).isNumber(index)) { if (key === index) return true; }
      return false;
    });
  };

  (l).compact = function (arr, all) {
    return (l).filter(arr, function (value) {
      if (!all) {
        if (!(l).isFalsy(value) || ( ( (l).isPlainObject(value) || (l).isArray(value) ) && (l).len(value) === 0 )) return value;
      } else if (!(l).isFalsy(value) && !(l).isEmpty(value)) {
        return value;
      }
    });
  };

  (l).difference = function () {
    var arrs = [], rest;
    (l).each(arguments, function (index, value) { if ((l).isArray(value)) arrs.push(value); });
    rest = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arrs, 1));
    return (l).filter((l).uniq(arrs[0]), function (value) {
      return !(l).inArray(rest, value);
    });
  };

  (l).first = function (arr, n) {
    var n = n ? n : 1, i = 0, ret = [];
    for (; i < n; i++) { ret.push(arr[i]); }
    return ret;
  };

  (l).indexOf = (l).firstIndexOf = function (arr, value, from) {
    var i = from || 0;
    for (; i < arr.length; i++) {
      if ((l).isEqual(arr[i], value)) return i;
    }
  };

  (l).initial = function (arr, n) {
    var n = n ? arr.length - n : arr.length - 1, i = 0, ret = [];
    for (; i < n; i++) { ret.push(arr[i]); }
    return ret;
  };

  (l).intersection = function () {
    var arrs, rest;
    arrs = (l).filter((l).toArray(arguments), function (value) { if ((l).isArray(value)) return true; });
    rest = Array.prototype.slice.call(arrs, 1);
    return (l).filter((l).uniq(arrs[0]), function (item) {
      return (l).every(rest, function (other) {
        return (l).indexOf(other, item) >= 0;
      });
    });
  };

  (l).last = function (arr, n) {
    var n = n ? arr.length - n : arr.length - 1, i = arr.length, ret = [];
    for (; n < i; n++) { ret.push(arr[n]); }
    return ret;
  };

  (l).lastIndexOf = function (arr, value, from) {
    var i = from ? (arr.length - from) : arr.length;
    while (i--) { if ((l).isEqual(arr[i], value)) return i; }
    return -1;
  };

  (l).object = (l).toObject = function () {
    var arrs = [], keys = [], ret = {}, allArrays = true, i;
    (l).each(arguments, function (index, value) {
      if ((l).isArray(value)) arrs.push(value);
      else allArrays = false;
    });
    if (arrs.length === 2) {
      keys = arrs[1];
      (l).each(arrs[0], function (index, value) { ret[ value ] = keys[index]; });
    } else if ( allArrays && arrs.length > 1 ) {
      for (i = 0; i < arrs.length; i ++) {
        var key = arrs[i][0];
        ret[key] = arrs[i][1];
      }
    } else {
      for (i = 0; i < arrs[0].length; i += 2) {
        ret[arrs[0][i]] = arrs[0][i + 1];
      }
    }
    return ret;
  };

  (l).rest = (l).tail = function (arr, n) {
    var n = n ? n : 1, i = arr.length, ret = [];
    for (; n < i; n++) { ret.push(arr[n]); }
    return ret;
  };

  (l).union = function () {
    return (l).uniq((l).flatten((l).toArray(arguments)));
  };

  (l).uniq = (l).unique = function (arr, fn, scope) {
    var ret = [], seen = [], target;
    target = fn ? (l).map(arr, fn, scope) : arr;
    (l).each(target, function (index, value) {
      if (!(l).contains(seen, value)) {
        seen.push(value);
        ret.push(value);
      }
    });
    return ret;
  };

  (l).without = (l).exclude = function (arr, values) {
    return (l).filter(arr, function (value) {
      for (var i = 0; i < values.length; i++) { if ((l).isEqual(values[i], value)) return false; }
      return true;
    });
  };

  (l).zip = function () {
    var i = 0, ret = [], arrs;
    arrs = (l).filter((l).toArray(arguments), function (value) { if ((l).isArray(value)) return true; });
    for (; i < arrs[0].length; i++) { ret[i] = (l).pluck(arrs, "" + i); }
    return ret;
  };

  /* COLLECTION METHODS */

  (l).add = function (col, key, value) {
    if (!(key in col)) col[key] = value;
    return col;
  };

  (l).all = (l).every = function (col, fn, scope, deep) {
    var ret = true, deep = (l).isBool(scope) ? scope : deep;
    if (deep) {
      (l).deep(col, function(depth, index, value) {
        if ( !(l).isArray(value) && !(l).isPlainObject(value) ) {
          if (!fn.call(!(l).isBool(scope) ? (scope || this) : this, value, index)) ret = false;
        }
      });
    } else {
      (l).each(col, function(index, value) {
        if (!fn.call(!(l).isBool(scope) ? (scope || this) : this, value, index)) ret = false;
      });
    }
    return ret;
  };

  (l).any = (l).some = function (col, fn, scope, deep) {
    var ret = false, deep = (l).isBool(scope) ? scope : deep;
    if (deep) {
      (l).deep(col, function(depth, index, value) {
        if (fn.call(!(l).isBool(scope) ? (scope || this) : this, value, index) ) {
          ret = true;
          return false;
        }
      });
    } else {
      (l).each(col, function(index, value) {
        if (fn.call(!(l).isBool(scope) ? (scope || this) : this, value, index) ) {
          ret = true;
          return false;
        }
      });
    }
    return ret;
  };

  (l).average = function (col, deep) {
    var sumTotal = 0;
    (l).deep(col, function (depth, index, value) {
      if ((l).isNumber(value)) sumTotal += value;
    }, deep ? "*" : 1);
    return sumTotal / (l).len(col, deep);
  };

  (l).clear = function (col) {
    if ((l).isPlainObject(col)) (l).each(col, function (index) { delete col[index]; });
    else col.length = 0;
    return col;
  };

  (l).clone = function (col) {
    var ret = (l).isArray(col) ? [] : {};
    for (var i in col) {
      if ((l).isPlainObject(col[i]) || (l).isArray(col[i])) ret[i] = (l).clone(col[i]);
      else ret[i] = col[i];
    }
    return ret;
  };

  (l).contains = (l).inArray = function (col, value) {
    return (l).find(col, function (v) {
      return (l).isEqual(v, value) ? true : false;
    }) ? true : false;
  };

  (l).count = function (col, fn, scope, deep) {
    var ret = 0, deep = (l).isBool(scope) ? scope : deep;
    if (deep) {
      (l).deep(col, function(depth, index, value) {
        if (!(l).isArray(value) && !(l).isPlainObject(value) ) {
          if (fn.call(!(l).isBool(scope) ? (scope || this) : this, value, index)) ret++;
        }
      });
    } else {
      (l).each(col, function (index, value) {
        if (fn.call(!(l).isBool(scope) ? (scope || this) : this, value, index)) ret++;
      });
    }
    return ret;
  };

  (l).countBy = function (col, map, scope) {
    return (l).groupBy(col, map, scope || this, true);
  };

  (l).deep = function (col, fn, depth, args, noArrays) {
    noArrays = noArrays ? noArrays : (l).isBool(depth) ? depth : (l).isBool(args) ? args : false;
    args = (l).isArray(args) ? args : (l).isArray(depth) ? depth : [];
    depth = (l).isString(depth) || (l).isNumber(depth) ? depth : '*';
    for (var o in col) {
      args.unshift(depth, o, col[o], col);
      if (fn.apply(this, args) === false) break;
      if ((l).isPlainObject(col[o]) || ((l).isArray(col[o]) && !noArrays)) {
        depth = depth === '*' ? '*' : depth - 1;
        args = (l).tail(args, 4);
        if (depth) (l).deep(col[o], fn, depth, args, noArrays);
      }
      args = (l).tail(args, 4);
    }
    return col;
  };

  (l).each = (l).forEach = function (col, fn, scope) {
    if (col === null) return;
    if ((l).isArray(col)) {
      for (var i = 0; i < col.length; i++) {
        if (fn.call(scope || col[i], i, col[i], col) === false) break;
      }
    } else {
      for (var key in col) {
        if (col.hasOwnProperty(key)) {
          if (fn.call(scope || col[key], key, col[key], col) === false) break;
        }
      }
    }
    return col;
  };

  (l).empty = function (col) {
    if ((l).isPlainObject(col) || (l).isArray(col)) {
      (l).each(col, function (index) { col[index] = undefined; });
    }
    return col;
  };

  (l).filter = function (col, fn, scope, reject) {
    var ret = [];
    (l).each(col, function (index, value) {
      if (reject) {
        if (!fn.call(scope ? scope : this, value, index)) ret.push(value);
      } else {
        if (fn.call(scope ? scope : this, value, index)) ret.push(value);
      }
    });
    return ret;
  };

  (l).find = (l).findValue = function (col, fn, scope, mode) {
    for (var o in col) {
      if (fn.call(scope ? scope : this, mode === "key" ? o : col[o])) return col[o];
    }
  };

  (l).findKey = function (col, fn, scope) {
    return (l).find(col, fn, scope || this, "key");
  };

  (l).flatten = function (col, n) {
    var ret = [], n = n || '*';
    (l).deep(col, function (depth, index, elm) {
      if ((l).isArray(col)) {
          if (n === '*') {
            if (!(l).isArray(elm)) ret.push(elm);
          } else if (depth > 1) {
            if (!(l).isArray(elm)) ret.push(elm);
          } else {
            ret.push(elm);
          }
      } else {
          if (n === '*') {
            if (!(l).isPlainObject(elm)) ret[index] = elm;
          } else if (depth > 1) {
            if (!(l).isPlainObject(elm)) ret[index] = elm;
          } else {
            ret[index] = elm;
          }
      }
    }, n);
    return ret;
  };

  (l).groupBy = function (col, map, scope, count) {
    count = count || (l).isBool(scope) ? scope : false;
    var res = {};
    (l).each(col, function (index, value) {
      var key = (l).isString(map) ? value[map] : map.call(scope || this, value, index, col);
      if ((l).has(res, key)) res[key].push(value);
      else res[key] = [value];
    });
    if (count) { (l).each(res, function (index, value) { res[index] = value.length; }); }
    return res;
  };

  (l).groupsOf = function (col, n, pad) {
    var res = [], i = 1, key;
    (l).each(col, function (index, value) {
      if ( (key in res) && i < n ) {
        res[key].push(value);
        i += 1;
      } else {
        key = (l).len(res);
        res[key] = [value];
        i = 1;
      }
    });
    if (pad) {
      (l).each(res, function (index, value) {
        if (value.length < n) for (i = value.length; i < n; i++) { res[index].push(pad); }
      });
    }
    return res;
  };

  (l).has = (l).keyExists = function (col, key) {
    return (l).findKey(col, function (index) {
      return !!(key === index);
    }) ? true : false;
  };

  (l).invert = function (col) {
    var invertedObj = {};
    (l).each(col, function (index, value) {
      invertedObj[value] = index;
    });
    return invertedObj;
  };

  (l).invoke = function (col, fn, args) {
    var args = args || [], ret;
    return (l).map(col, function (value) {
      args.unshift(value);
      ret = ((l).isFunction(fn) ? fn : value[fn]).apply(value, args);
      args.shift();
      return ret;
    });
  };

  (l).isEmpty = function (col) {
    return (((l).isPlainObject(col) && (l).len(col) === 0) || ((l).isArray(col) && col.length === 0 ));
  };

  (l).isUnique = function (col, key) {
    var target;
    if (key in col) {
      target = col[key];
      key = key.toString();
      for (var o in col) { if ((l).isEqual(target, col[o]) && o !== key) return false; }
    }
    return true;
  };

  (l).keys = function (col) {
    var keys = [];
    for (var o in col) { keys.push(o); }
    return keys;
  };

  (l).least = function (col, fn, most) {
    var comparator, result, ret, leastValue;
    if ((l).isString(fn)) {
      result = (l).countBy(col, function (p) { return p[fn]; });
      comparator = (l).countBy(col, function (p) { return p[fn]; }, this, true);
    }
    else {
      result = (l).countBy(col, fn || function (num) { return num; });
      comparator = (l).countBy(col, fn || function (num) { return num; }, this, true);
    }
    leastValue = (most) ? [(l).max(result)] : [(l).min(result)];
    (l).each(result, function (index, value) {
      if (leastValue[0] == value) {
        ret = comparator[index].val[0];
        return false;
      }
    });
    return ret;
  };

  (l).len = function (col, deep, count) {
    var count = count ? (count += (l).keys(col).length) : (l).keys(col).length;
    if (deep) {
      for (var o in col) {
        if ((l).isPlainObject(col[o]) || (l).isArray(col[o])) {
          var ret = (l).len(col[o], deep, count);
          if ((l).type(col[o]) === "array") {
            return ret - 1;
          } else if ((l).type(col[o]) === "object") {
            return ret;
          }
        }
      }
    }
    return count;
  };

  (l).map = (l).collect = function (col, fn, scope, deep) {
    deep = deep || (l).isBool(scope) ? scope : false;
    var list = (l).isArray(col) ? col : (l).toArray(col),
        ret = [];
    if ( col === null ) return ret;
    if ( deep ) {
      (l).deep(list, function(depth, index, value, ref) {
        if ( !(l).isArray(value) && !(l).isPlainObject(value) ) {
          if ((l).isArray(col)) {
            ret.push(fn.call(scope || this, value, index, ref));
          } else {
            ret[index] = fn.call(scope || this, value, index, ref);
          }
        }
      }, deep ? "*" : 1);
    } else {
      (l).each(list, function(index, value, ref) {
        ret.push(fn.call(scope || this, value, index, ref));
      });
    }
    return ret;
  };

  (l).max  = function (col, deep) {
    var maxVals = [];
    (l).deep(col, function (depth, index, value) {
      if ((l).isNumber(value)) maxVals.push(value);
    }, deep ? "*" : 1);
    return Math.max.apply(this, maxVals);
  };

  (l).min  = function (col, deep) {
    var minVals = [];
    (l).deep(col, function(depth, index, value) {
      if ( (l).isNumber(value) ) minVals.push(value);
    }, deep ? "*" : 1);
    return Math.min.apply(this, minVals);
  };

  (l).most = function (obj, fn) {
    return (l).least(obj, fn, true);
  };

  (l).none = function (col, fn, scope, deep) {
    deep = deep || (l).isBool(scope) ? scope : false;
    var ret = true;
    if (deep) {
      (l).deep(col, function(depth, index, value) { if (fn.call(scope ? scope : this, value, index)) ret = false; });
    } else {
      (l).each(col, function (index, value) { if (fn.call(scope ? scope : this, value, index)) ret = false; });
    }
    return ret;
  };

  (l).omit = (l).blacklist = function (col, list) {
    var props = (l).isArray(list) ? list : [list];
    return (l).filter(col, function(value, index) {
      if (!(index in props) && !((l).inArray(props, index))) return value;
    });
  };

  (l).only = (l).whitelist = function (col, list) {
    var list = (l).isString(list) ? list.split(" ") : list;
    return (l).filter(list, function (index, value) {
      if ((l).keyExists(col, value)) return true;
    });
  };

  (l).reduce = (l).foldl = function (col, fn, scope, right) {
    var copy = col, i = 0, base, keys, vals;
    if (right) {
      if ((l).isPlainObject(copy)) {
        keys = (l).keys(copy).reverse();
        vals = (l).values(copy).reverse();
        copy = (l).object(keys, vals);
      } else if ((l).isArray(copy)) {
        copy = copy.reverse();
      }
    }
    base = (l).find(copy, function (value) { return value; });
    (l).each(copy, function (index, value) {
      if (i !== 0) base = fn.call(scope || this, base, value, index);
      i++;
    });
    return (l).isArray(base) ? base[0] : base;
  };

  (l).reduceRight = (l).foldr = function (col, fn, scope) {
    return (l).reduce(col, fn, scope || this, true);
  };

  (l).reject = function (col, fn, scope) {
    return (l).filter(col, fn, scope || this, true);
  };

  (l).remove = function (col, key) {
    var rest, from;
    if ((l).isPlainObject(col)) {
      if ((l).isArray(key)) {
        for (var i = 0; i < key.length; i++) { if (key[i] in col) delete col[key[i]]; }
      } else {
        if (key in col) delete col[key];
      }
    } else if ((l).isArray(col)) {
      from = parseInt(key);
      rest = col.slice((from) + 1);
      col.length = (from < 0) ? col.length + from : from;
      col.push.apply(col, rest);
    }
    return col;
  };

  (l).replace = function (col, fn, scope) {
    return (l).each(col, function (index, value, ref) { ref[index] = fn.call(scope || this, value); });
  };

  (l).sample = function (col, n) {
    var ret = [], i;
    for (i = n || 1; i > 0; i--) { ret.push((l).shuffle(col)[0]); }
    return ret;
  };

  (l).set = function (col, key, value) {
    return col[key] = value;
  };

  (l).setUndef = function (col, value) {
    return (l).each(col, function (index, v, ref) { if ((l).isUndefined(v)) ref[index] = value; });
  };

  (l).shuffle  = function (col) {
    var ret, i, n, copy;
    ret = (l).isPlainObject(col) ? (l).toArray(col) : col;
    for (i = ret.length - 1; i > 0; i--) {
      n = Math.floor(Math.random() * (i + 1));
      copy = ret[i];
      ret[i] = ret[n];
      ret[n] = copy;
    }
    return ret;
  };

  (l).size = function (col, deep, count) {
    count = count ? count : 0;
    (l).each((l).values(col), function (index, value) { if (!(l).isFalsy(value)) count += 1; });
    if (deep) {
      for (var o in col) {
        if ((l).isPlainObject(col[o]) || (l).isArray(col[o])) {
          var ret = (l).size(col[o], deep, count);
          if ((l).type(col[o]) === "array") return ret - 1;
          else if ((l).type(col[o]) === "object") return ret;
        }
      }
    }
    return count;
  };

  (l).sortBy = function (col, fn, scope) {
    return (l).pluck((l).map(col, function (value, index, list) {
      return {
        value : value,
        index : index,
        criteria : fn.call(scope || this, value, index, list)
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

  (l).sum = function (col, deep) {
    var ret = 0;
    (l).deep(col, function (depth, index, value) {
      if ((l).isNumber(value)) ret += value;
    }, deep ? "*" : 1);
    return ret;
  };

  (l).tap = function (col, fn) {
    return fn.call(this, col);
  };

  (l).where = function (col, matches, find) {
    return (l)[find ? 'find' : 'filter'](col, function (value) {
      for (var key in matches) { if (matches[key] !== value[key]) return false; }
      return true;
    });
  };

  (l).whereFirst = function (col, matches) {
    return (l).where(col, matches, true);
  };

  (l).values = function (col) {
    var o, vals = [];
    for (o in col) { vals.push(col[o]); }
    return vals;
  };

  /* FUNCTION METHODS */

  (l).after = function (fn, n) {
    fn.n = fn.after = n;
    return function () {
      if (fn.n > 1) {
        fn.n--;
      } else {
        fn.apply(this, arguments);
        fn.n = fn.after;
      }
    };
  };

  (l).bind = function (obj, fn, scope, args) {
    args = args || (l).isArray(scope) ? scope : [];
    return function () {
      for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }
      return fn.apply(scope, args);
    };
  };

  (l).bindAll = function (obj, methods) {
    if (arguments.length === 1 && obj) {
      (l).each(obj, function (f) { if ((l).isFunction(obj[f])) obj[f] = (l).bind(obj[f], obj); });
    } else if (arguments.length === 2) { (l).each(args.methods, function (f) { obj[f] = (l).bind(obj[f], obj); }); }
    return obj;
  };

  (l).compose = function () {
    var fns = (l).filter((l).toArray(arguments), function(value) { if ((l).isFunction(value)) return true; });
    return function () {
      var args = arguments;
      for (var i = fns.length - 1; i >= 0; i--) { args = [fns[i].apply(this, args)]; }
      return args[0];
    };
  };

  (l).debounce = function (fn, n, edge) {
    var res, timeout;
    return function () {
      var scope = this, fargs = arguments;
      var next = function () {
        timeout = null;
        if (!edge) res = fn.apply(scope, fargs);
      };
      var ready = edge && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(next, args.n);
      if (ready) res = fn.apply(scope, fargs);
      return res;
    };
  };

  (l).defer = function (fn) {
    return (l).delay.call(this, fn, 0);
  };

  (l).delay = function (fn, ms) {
    return function () {
      var fargs = arguments;
      setTimeout(function () {
        return fn.apply(null, fargs);
      }, ms);
    }
  };

  (l).fill = (l).partial = function (fn, args) {
    return function () {
      for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }
      return fn.apply(this, args);
    };
  };

  (l).memoize = function (fn, hash) {
    var memo = {};
    hash = hash || (l).identity;
    return function () {
      var key = hash.apply(this, arguments);
      return (l).has(memo, key) ? memo[key] : (memo[key] = fn.apply(this, arguments));
    };
  };

  (l).once = function (fn) {
    fn.n = fn.once = 1;
    return function () {
      if (fn.n) {
        fn.n--;
        return fn.apply(this, arguments);
      }
    };
  };

  (l).throttle = function (fn, ms) {
    var scope, last, timeout, fargs, ret, res, later;
    later = function () {
      last = new Date;
      timeout = null;
      ret = fn.apply(scope, fargs);
    };
    return function () {
      var now = new Date();
      var left = ms - (now - last);
      scope = this;
      fargs = arguments;
      if (left <= 0) {
        clearTimeout(timeout);
        timeout = null;
        last = now;
        res = fn.apply(scope, fargs);
      } else if (!timeout) {
        timeout = setTimeout(later, left);
      }
      return res;
    }
  };

  (l).times = function (fn, n) {
    fn.n = n;
    return function () { for (var i = 0; i < fn.n; i++) { fn.apply(this, arguments); } };
  };

  (l).wrap = function (fn, wrapper) {
    return function () {
      var args = [fn];
      args.push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  /* NUMBER METHODS */

  (l).range = function (start, stop, step) {
    var i = 0, ret = [];
    var len = Math.max(Math.ceil((stop - start) / step), 0);
    while (i < len) {
      ret[ i++ ] = start;
      start += step;
    }
    return ret;
  };

  (l).uniqueId = function(prefix) {
    var prefix = prefix || "", self = (l).uniqueId;
    if (!('uuids' in self)) self.uuids = [];
    var newId = prefix + Math.floor((1 + Math.random()) * 0x10000).toString(10).substring(1);
    if (!(l).inArray(self.uuids, newId)) {
      self.uuids.push(newId);
      return newId;
    } else {
      (l).uniqueId();
    }
  };

  /* OBJECT METHODS */

  (l).array = (l).toArray = function () {
    var ret = [];
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        (l).each(arguments[i], function (index, value) { ret.push(value); });
      }
    } else {
      (l).each(arguments[0], function (index, value) { ret.push(value); });
    }
    return ret;
  };

  (l).call = function (opts) {
    var only = (l).isString(opts.only) ? opts.only.split(" ") : opts.only,
        fns = (l).functions(opts.obj, opts.key, opts.deep);
    return (l).filter(fns, function (value, index) {
      var key = (l).keys(value)[0];
      if (only) {
        if ((l).inArray(only, index)) {
          value[key].apply(this, opts.args);
          return true;
        }
      } else {
        value[key].apply(this, opts.args);
        return true;
      }
    });
  };

  (l).defaults = function (obj, defaults) {
    (l).each(defaults, function (index, value) {
      if (!(index in obj)) { obj[ index ] = value;
      } else if (index in obj) { if ((l).isNull(obj[index]) || (l).isUndefined(obj[index])) obj[ index ] = value; }
    });
    return obj;
  };

  (l).extend = (l).merge = function () {
    var keys = [], objs = [],
        target, obj, copy, key, i, deep;

    // Collect potential objects to merge
    objs = (l).filter((l).toArray(arguments), function (value) {
      if ((l).isBool(value)) deep = value;
      if ((l).isPlainObject(value) && !(l).isEqual(target, value)) return value;
    });

    // Shift target off of the `objs` array
    target = objs.shift();

    // When TRUE is passed perform deep iteration on target
    if (deep) {

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
          target[key] = copy;
        }
      }
    }
    return target;
  };

  (l).get = function (obj, key) {
    var ns = ( (l).type(key) !== "string" ) ? false : key.split("."), ret;
    if (!key) return obj;
    if (ns.length > 1) {
      obj = (l).get(obj, ns.shift());
      key = ns.pop();
    }
    if ((l).isPlainObject(obj)) {
      if (key in obj) {
        return obj[key];
      } else {
        for (var o in obj) {
          if ((l).isPlainObject(obj[o])) {
            if (ret = (l).get(obj[o], key)) return ret;
          }
        }
      }
    }
  };

  (l).getByType = function (obj, type, key, deep) {
    var stack = [];
    deep = deep || (l).isBool(key) ? key : (l).isBool(type) ? type : false;
    type = type || '*';

    // Start search starting at key when given
    if (key && key !== "*") {
      if (!(l).isPlainObject(obj = (l).get(obj, key))) {
        if (type === (l).type(obj) || type === "*") {
          var objWrapper = {};
          key = key.split(".");
          objWrapper[key[key.length - 1]] = obj;
          stack.push(objWrapper);
          return stack;
        }
      }
    }

    // Perform deep search for objects of type
    (l).deep(obj, function (depth, index, elm) {
      if (type === (l).type(elm) || type === "*") {
        var objWrapper = {};
        objWrapper[index] = elm;
        stack.push(objWrapper);
      }
    }, (deep ? "*" : 1), true);
    return stack;
  };

  (l).howDeep = function (obj, key) {
    var paths = (l).paths(obj),
        objs = (l).getByType(obj, true);
    if (key) {
      if (key in paths) return paths[key].split(".").length;
    } else {
      for (var o in objs) { if ((l).isEqual(obj, objs[o])) return (l).howDeep(o); }
    }
  };

  (l).isArguments = function (obj) {
    return {}.toString.call(obj) === "[object Arguments]";
  };

  (l).isArray = function (obj) {
    return {}.toString.call(obj) === "[object Array]";
  };

  (l).isBool = function (obj) {
    return {}.toString.call(obj) === "[object Boolean]";
  };

  (l).isDate = function (obj) {
    return {}.toString.call(obj) === "[object Date]" || obj instanceof Date;
  };

  (l).isElement = function (obj) {
    return typeof obj === "object" ? obj instanceof HTMLElement :
        obj && typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string";
  };

  (l).isEqual = function (obj1, obj2) {

    // Quick compare of objects that don't have nested objects or arrays
    if ((l).type(obj1) === (l).type(obj2) && !(l).isPlainObject(obj1) && !(l).isArray(obj1)) {
      switch ((l).type(obj1)) {
        case "function" :
          if (obj1.toString() !== obj2.toString()) return false;
          break;
        case "nan" :
          if (obj1 === obj2) return false;
          break;
        default:
          if (obj1 !== obj2) return false;
      }

      // Compare objects that do have nested objects
    } else {

      // When target or comparison is falsy we compare them directly
      if ((l).isFalsy(obj1) || (l).isFalsy(obj2)) {
        if (obj1 !== obj2) return false;
      }
      for (var o in obj1) {
        switch (true) {

          // Catch comparison of element first to prevent infinite loop when caught as objects
          case ( (l).isElement(obj1[o]) ) :
            if (obj1[o] !== obj2[o]) return false;
            break;
          case ( (l).isNaN(obj1[o]) ) :
            if (!(l).isNaN(obj2[o])) return false;
            break;
          case ( typeof obj1[o] === "object" ) :
            if (!(l).isEqual(obj1[o], obj2[o])) return false;
            break;
          case ( typeof obj1[o] === "function" ) :
            if (!(l).isFunction(obj2[o])) return false;
            if (obj1[o].toString() !== obj2[o].toString()) return false;
            break;
          default :
            if (obj1[o] !== obj2[o]) return false;
        }
      }

      // Reverse comparison of `obj2`
      for (var o in obj2) {
        if (typeof obj1 === "undefined") return false;
        if (obj1 === null || obj1 === undefined) return false;
        if ((l).isFalsy(obj1[o])) {
          if ((l).isNaN(obj1[o])) {
            if (!(l).isNaN(obj2[o])) return false;
          } else if (obj1[o] !== obj2[o]) return false;
        }
      }
    }
    return true;
  };

  (l).isFalsy = function (obj) {
    return ((l).isUndefined(obj) ||
            (l).isNull(obj) ||
            (l).isNaN(obj) ||
            obj === "" ||
            obj === 0 ||
            ((l).isBool(obj) && Boolean(obj) === false));
  };

  (l).isFinite = function (obj) {
    return obj === Infinity || obj === -Infinity;
  };

  (l).isFunction = function (obj) {
    return {}.toString.call(obj) === "[object Function]";
  };

  (l).isNaN = function (obj) {
    return typeof obj === "number" && obj !== obj;
  };

  (l).isNull = function (obj) {
    return {}.toString.call(obj) === "[object Null]";
  };

  (l).isNumber = function (obj) {
    return {}.toString.call(obj) === "[object Number]";
  };

  (l).isObject = function (obj) {
    return typeof obj === "object";
  };

  (l).isPlainObject = function (obj) {
    return typeof obj === "object" && {}.toString.call(obj) === "[object Object]";
  };

  (l).isRegExp = function (obj) {
    return {}.toString.call(obj) === "[object RegExp]" || obj instanceof RegExp;
  };

  (l).isString = function (obj) {
    return typeof obj === "string" && {}.toString.call(obj) === "[object String]";
  };

  (l).isUndefined = function (obj) {
    return typeof obj === "undefined";
  };

  (l).module = (l).build = function ( opts ) {
    if (!opts.ns) throw Error('_.build(): Argument `ns` is missing or not a string.');
    var members, o, list = opts.ns ? opts.ns.split(".") : [];
    var ns = list ? list.shift() : (opts.ns || "");
    obj = opts.obj || {};

    // Build namespace object attaching it to the previous object recursively
    obj[ns] = obj[ns] || {};
    if (list.length) (l).module(obj[ns], list.join('.'), opts.members, opts.deep);

    // Merge `members` object and its constructs onto namespace object `obj`
    if (opts.ns.split(opts.ns.length - 1)[0] === ns && (l).isPlainObject(opts.members)) {

      // Merge newly created object with members object
      obj[ns] = (l).extend(obj[ns], opts.members, opts.deep);

      // When members contains the `_extends` property
      if ('_extends' in obj[ns]) {
        if ((l).isArray(obj[ns]['_extends'])) {
          var extensions = obj[ns]['_extends'];
          delete obj[ns]['_extends'];
          extensions.push(opts.deep);

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
        var propsArray = (l).getByType(obj[ns], "*", opts.deep);
        for (var o in propsArray) {
          members[o] = propsArray[o];
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
        members = (l).objects(obj[ns], opts.deep);

        // Retract all children members referenced in the array
        if ((l).isArray(obj[ns]['_retract'])) {
          delete obj[ns]['_retract'];

          // Get the children object members
          (l).each(members, function (index, elm) {
            for (o in elm) {

              // If we encounter a retraction, parent "inherits" from children
              if ((l).inArray(retractions, o)) (l).extend(obj[ns], elm[o], opts.deep);
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
          targets.unshift(obj[ns], opts.deep);
          (l).extend.apply(obj[ns], targets);
        }
      }
    }
    return obj;
  };

  (l).nest = function (obj, prefix) {
    prefix = prefix || "";
    return (l).each(obj, function (index, value) {
      var newObj = {};
      newObj[prefix + index] = value;
      obj[index] = newObj;
    });
  };

  (l).pairs = function (obj) {
    var pairs = [];
    if ((l).isPlainObject(obj)) { (l).each(obj, function (index, value) { pairs.push([index, value]); }); }
    return pairs;
  };

  (l).parent = function (obj, key) {
    var target = key ? (l).get(obj, key) : obj,
        objs = (l).getByType(obj, true);
    for (var o in objs) {
      if ((l).isPlainObject(objs[o])) {
        for (var p in objs[o]) {
          if ((l).isEqual(objs[o][p], target)) return objs[o];
        }
      }
    }
    return obj;
  };

  (l).paths = function (obj, pathObj, lastKey, nextKey) {
    var o, key, subPath,
        pathObj = pathObj ? pathObj : {},
        lastKey = lastKey ? lastKey : "",
        nextKey = nextKey ? nextKey : "";
    for (o in obj) {
      pathObj[o] = (nextKey + "." + lastKey + "." + o).replace(/^[.]+/g, "");
      key = nextKey + "." + lastKey;
      if ((l).isPlainObject(obj[o])) (l).paths(obj[o], pathObj, o, key);
    }
    return pathObj;
  };

  (l).pluck = (l).fetch = function (obj, key) {
    return (l).map(obj, function (value) { return value[key]; });
  };

  (l).resolve = function (obj, key) {
    if (!key) key = (l).keys(obj)[0];
    return (l).paths(obj)[key];
  };

  (l).toQueryString = function (obj, prefix) {
    var ret = "";
    (l).deep(obj, function (depth, index, value) {
      index = index.toString();
      if (!(l).isPlainObject(value)) {
        if ((l).isArray(value)) {
          (l).deep(value, function (arrDepth, arrIndex, arrValue) {
            arrIndex = arrIndex.toString();
            ret += (prefix ? prefix + index + "[]" : index + "[]") + "=" + arrValue + "&";
          }, "*");
        } else {
          ret += (prefix ? prefix + index : index) + "=" + value + "&";
        }
      }
    }, "*", true);
    ret = encodeURIComponent(ret.replace(/&$/g, ''));
    return ret;
  };

  (l).type = function (obj) {
    var types = "Date RegExp Element Arguments PlainObject Array Function String Bool NaN Finite Number Null Undefined Object".split(" "), i;
    for (i = 0; i < types.length; i++) {
      if ((l)["is" + types[i]].call(this, obj)) {
        return types[i]
            .toLowerCase()
            .replace(/plainobject/g, "object")
            .replace(/finite/g, "infinity");
      }
    }
    return false;
  };

  /* STRING METHODS */

  (l).fromQueryString = function (str, deep) {
    var ret = {}, parts;
    (l).each(decodeURIComponent(str).split("&"), function (index, value) {
      parts = value.split("=");
      if (parts[0].match(/\[\]/g) && deep) {
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

  (l).htmlEncode = function (str) {
    var entities = {
      '\u0026':['amp'], '\u0022':['quot'], '\u0027':['apos'], '\u003C':['lt'],
      '\u003E':['gt'], '\u00A0':['nbsp'], '/':['#x2F']
    };
    for (var e in entities) {
      var entity = new RegExp(e, 'g');
      str = str.replace(entity, '&' + entities[e][0] + ';');
    }
    return str;
  };

  (l).htmlDecode = function (str) {
    var entities = {
      '&quot;':['\"'], '&amp;':['&'], '&apos;':["'"], '&lt;':['<'],
      '&gt;':['>'], '&nbsp;':[' '], '&#x2F;':['/']
    };
    for (var e in entities) {
      var entity = new RegExp(e, 'g');
      str = str.replace(entity, entities[e][0]);
    }
    return str;
  };

  /* UTILITY METHODS */

  (l).chain = function () {
    return (l).apply(this, arguments).chain();
  };

  (l).end = (l).result = function (obj) {
    return this._chain ? (l)(obj).chain() : obj;
  };

  (l).identity = function (value) {
    return value;
  };

  (l).noConflict = function () {
    root['_'] = previousLib;
    return (l);
  };

  (l).value = function (value) {
    return (l).isFunction(value) ? value() : value;
  };

  // Generate [type]s() methods
  (l).each(['array', 'object', 'function', 'string', 'bool', 'number', 'null', 'undefined', 'date', 'regexp', 'element', 'nan'],
      function (index, type) {
        (l)[ type + 's' ] = function (obj, key, deep) {
          return (l).getByType(obj, type, key, deep);
        };
      });

  // Generate no[Type]s() methods
  (l).each(['array', 'object', 'function', 'string', 'bool', 'number', 'null', 'undefined', 'date', 'regexp', 'element', 'nan'],
      function (index, name) {
        (l)[ 'no' + name.charAt(0).toUpperCase() + name.slice(1) + 's' ] = function (obj, key, deep) {
          return (l).filter((l).getByType(obj, "*", key, deep),
              function (index, value) { if (!((l).type(value) === name)) return value; });
        };
      });

  // Generate [type]Names methods
  (l).each(['array', 'object', 'function', 'string', 'bool', 'number', 'null', 'undefined', 'date', 'regexp', 'element', 'nan'],
      function (index, name) {
        (l)[ name + 'Names' ] = function (obj, key, deep) {
          var names = [];
          (l).filter((l).getByType(obj, name, key, deep), function (value) { names.push((l).keys(value)[0]); });
          return names;
        };
      });

  // Add native sort method to library
  (l).each(['sort'], function (index, name) {
    if (Array.prototype[name]) { (l)[name] = !(l)[name] ? Array.prototype[name] : (l)[name]; }
  });

  // Attach library's methods to its prototype
  (l).each((l).filter((l).keys((l)), function (value) {
    if (!(l).inArray(['_version'], value)) return true;
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