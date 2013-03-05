/**
 * boiler.js v0.1.0
 * https://github.com/Xaxis/boiler.js
 * http://www.boilerjs.com
 * (c) 2012-2013 Wil Neeley, Trestle Media, LLC.
 * boiler.js may be freely distributed under the MIT license.
 **/
(function() {
var

	// Library name
	l = "_",
	
	// Global root object (window or global)
	root = this,
	
	// Save any object previously referenced by the same library global variable
	previousLib = root[l];
	
	// Library Definition
	(l) = window[l] = function( obj, key ) {
		this._chainned = obj;
		return new (l).fn.__init( obj, key );
	};
	
	(l).fn = (l).prototype = {
		_version: "0.1.0",
		
		/**
		 * The init method essentially acts as a wrapper to the get method when the library
		 * object is called as a function and when the `chain` method is invoked. It sets the
		 * `_global` and `_object` properties on the library. These properties are used for 
		 * various internal referencing.
		 * @param {...*} obj
		 * @param {string|number} key
		 * @return {function}
		 */
		__init: function( obj, key ) {			
			if ( arguments.length >= 1 ) {
				var args = (l).fn.__args([obj, key], [{obj:'object|array'}, {key:'string|number'}]),
					target;

				// Retrieve targeted object
				target = (l).get( args.obj, args.key );
				
				// Set whatever is passed to the global object
				(l)._global = obj;
				
				// Attach targeted object to the library. Since 'false', 'null', and 'undefined' are
				// all valid found values we test that a value was found not if there is a value in 
				// the returned target.
				(l)._object = (l)._found ? target : (l)._global;
			}
			return (l);
		},
		
		/** 
		 * Helper method that allows functions to accept arguments in an unspecified order when
		 * those arguments are all of a different type. Creates a mechanism to enforce type 
		 * checking of passed arguments.
		 *
		 * Additionally the args method accepts an "options" object in place of the list argument. 
		 * When this object is provided the args argument is expected to contain an array of property
		 * names to match against. It then builds the arguments object with any arguments passed by
		 * the user.
		 *
		 * Additionally when the arguments object itself is passed as the args argument and the list
		 * argument is an object containing a property name "*" with a value of "prefix:type" we're
		 * telling the method we want to create an arguments object where an unknown number of arguments
		 * can be passed that are all of the same type.
		 *
		 * Additionally a definition can be provided that specifies the order arguments must be passed in. 
		 * Each argument can be allowed to exist at variable argument locations.
		 *
		 * When `rule` is passed with a true value an array of arguments is returned instead of the 
		 * constructed arguments object with the `_global` target object and `length` property removed.
		 * When `rule` is passed a null value a more comprehensive reassignment of the 'oargs.obj' property
		 * is performed.
		 * When `rule` is passed a number value of 0 the `length` and `obj` properties are removed from
		 * the arguments object.
		 *
		 * Since this method is used as the interface to most library methods we cannot depend on library 
		 * methods within. To avoid stack overflows some of the libraries methods are recreated as 
		 * private methods.
		 *
		 * @param {object|array} args
		 * @param {array|object} list
		 * @param {boolean|null} rule
		 * @return {object|array}
		 */
		__args: function( args, list, rule ) {
			var i, d, a, n, q, mtypes, name, type, chainOn,
			  types = list,
				snargs = [],
				oargs = {},
				defs = [],
				typeTest = null,
				inArray = null,
				toArray = null;

			// This private type testing method is needed as a quick way to perform type checking
			// within the __args method while preventing stack exceptions because the libraries
			// type testing method also uses the __args method to define its arguments object.
			typeTest = function( obj ) {
				switch ( true ) {
					case ({}.toString.call(obj) === "[object Date]" || obj instanceof Date) :
						return 'date';
					case ({}.toString.call(obj) === "[object RegExp]" || obj instanceof RegExp) :
						return 'regexp';
					case (typeof obj === "object" ? obj instanceof HTMLElement :
							typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string") :
						return 'element';
					case (typeof obj === "object" && {}.toString.call(obj) === "[object Object]") :
						return 'object';
					case (toString.call(obj) === "[object Array]") :
						return 'array';
					case (typeof obj === "string" && toString.call(obj) === "[object String]") :
						return 'string';
					case ({}.toString.call(obj) === "[object Boolean]") :
						return 'bool';
					case ({}.toString.call(obj) === "[object Null]") :
						return 'null';
					case ({}.toString.call(obj) === "[object Number]") :
						return 'number';
					case ({}.toString.call(obj) === "[object Function]") :
						return 'function';
					case (typeof obj === "object") :
						return 'defaultobject';
					case (typeof obj === "undefined") :
						return 'undefined';
				}
				return 'notype';
			};
			
			// This private method returns true if a value exists in an array. It is used for when
			// we are building an array object with order definitions in place.
			inArray = function( arr, val ) {
				for ( var i = 0; i < arr.length; i++ ) { if ( arr[i] === val ) { return true; } }
				return false;
			};
			
			// This private method converts an object to an array.
			toArray = function( obj ) {
				var o, ret = [];
				for ( o in obj ) { ret.push(obj[o]); }
				return ret;
			};
			
			// Build arguments object from "options" object when the list argument is a plain object.
			if ( typeTest(list) === "object" ) {
				for ( i = 0; i < args.length; i++ ) {
					if ( args[i] in list ) {
						oargs[args[i]] = list[args[i]];
					} else {
						oargs[args[i]] = undefined;
					}
				}	
				
			// Otherwise the arguments object is built from one of a few types of different definitions.
			} else {
				
				// Here we build a definitions object that contains objects with the properties
				// 'name', 'type', 'order' and 'set'. These definitions store a given arguments allowed
				// type, pass order, as well as the arguments name and whether or not the passed argument 
				// has been set as a value of the 'oargs' object.
				for ( n = 0; n < list.length; n++ ) {
					for ( a in list[n] ) {
						defs.push({name: a, type: list[n][a], order:[], set:false});
					}
				}
					
				// It is only when the first argument to the __args method is an object that a
				// specific passed order is to be used while building the arguments object.
				if ( typeTest(args) === "object") {
					
					// Create an array that stores indexes to all those arguments that have already been assigned
					oargs.__set__ = [];
					
					for ( n in list ) {
						
						// The actual arguments type testing iterates over an array that is the passed
						// passed arguments. Since the order definitions are defined when the args argument
						// is an object we must rebuild the args array from values passed in the args object.
						snargs.push(args[n][0]);
						
						// The allowed order of passed arguments is defined by an array of integers that is
						// 0 indexed where 0 denotes position 1, 1 denotes position 2, and so on.
						defs[n].order = args[n][1];
					}
					
					// Reassign the args variable to the newly created 'snargs' array which contains passed arguments.
					args = snargs;
				}				

				// For each argument iterate through rules definitions looking for match
				for ( a = 0; a < args.length; a++ ) {
					
					// Iterate through rule definitions on each passed argument
					for ( d = 0; d < defs.length; d++ ) {	

						// Retrieve the name and allowed type(s) of the current argument being validated
						name = defs[d].name;
						type = defs[d].type;
						
						// When name is set to "*" we're saying we want to build an arguments object that contains
						// an unknown number of arguments all of the same type. In this situation the type is a 
						// string delimited by ':' where the prefix is the argument name to use and the postfix is
						// the actual type to validate against.
						if ( name === "*" ) {
							mtype = type.split(":");
							name = mtype[0] + a;
							type = mtype[1];
							if ( type === typeTest(args[a]) ) {
								oargs[ name ] = args[a];
							}
						
						// When the 'type' variable isn't a string but instead is an array this implies the
						// user is instead trying to set a default value within the method/function definition.
						} else if ( typeTest(type) === "array" ) {
							
							// Now we set 'oargs' based on the definition rules provided but NOT a type test in
							// this instance because a default value is being provided.
							if ( defs[d].order.length >= 1 ) {
								if ( 
										 inArray(defs[d].order, parseInt(a) )
										 && !(name in oargs)
										 && !inArray(oargs.__set__, a)
									) {
											oargs[ name ] = args[a];
											oargs.__set__.push(a);
											break;
								}
								
							} else {
								oargs[ name ] = type[0];
								break;
							}		
						
						// Set MULTIPLE TYPES arguments (indicated by strings delimited by pipes)
						} else if ( (mtypes = type.split("|")).length > 1 ) {
							
							// Iterate through possible types
							for ( n = 0; n < mtypes.length; n++ ) {
							
								// Reference the currently targeted type
								type = mtypes[n];
							
								if ( defs[d].order.length >= 1 ) {
									if ( 
											 (type === typeTest(args[a]) || type === "*" ) 
											 && inArray(defs[d].order, parseInt(a) )
											 && !(name in oargs)
											 && !inArray(oargs.__set__, a)
											 
										) {
												oargs[ name ] = args[a];
												oargs.__set__.push(a);
												break;
									}
									
								} else {
									if ( type === typeTest(args[a]) || type === "*" ) {
										oargs[ name ] = args[a];
										break;
									}
								}					
							}
					
						// Set SINGLE TYPE definition OR ALL types
						} else {
							
							// When we have ORDER RULES to validate against
							if ( defs[d].order.length >= 1 ) {
								
								if (
								
								// When the type of a passed argument matches a defined type
								// OR when type is defined as ALL and type of argument IS defined
								( type === typeTest(args[a]) || type === "*" ) 
										 
								// AND when the passing order definition matches the order in which the argument was passed
								&& inArray(defs[d].order, parseInt(a) )
										 
								// AND when the property has not yet been set on the 'oargs' object
								&& !(name in oargs)
											 
								// AND when the argument has not been assigned yet
								&& !inArray(oargs.__set__, a)
										 
								) {
									
									// Set the oargs object with the current argument
									oargs[ name ] = args[a];
											
									// Push the argument index into the __set__ array so we don't assign it again
									oargs.__set__.push(a);
									break;
								}
								
							// When we don't have any validation rules to test
							}	else {
								if ( type === typeTest(args[a]) || type === "*" ) {
									oargs[ name ] = args[a];
									break;
								}
							}
						}
					}
				}
			}
			
			// Since nearly every method in the libary uses oargs.obj, we assume that if it
			// is undefined at this point it is because the object was selected with the library
			// function itself.
			if ( !oargs.obj && (l)._chain ) { 
				oargs.obj = (l)._object || (l)._global;
				
				// So long as `rule` is not equal to null, reassign `obj` with first array or 
				// object found in `oargs`.
				if ( !oargs.obj && typeTest(rule) !== "null" ) {
					for ( o in oargs ) {
						if ( typeTest(oargs[o]) === "object" || typeTest(oargs[o]) === "array" ) {
							oargs.obj = oargs[o];
							delete oargs[o];
							break;
						}
					}
				}
			}
			
			// Remove the __set__ object from arguments when defined
			if ( oargs.__set__ ) { delete oargs.__set__; }
			
			// Set the length of arguments object
			n = 0;
			for ( o in oargs ) { n++; }
			oargs.length = n;
			
			// When `rule` is true we convert the oargs object to an array
			if ( typeTest(rule) === "bool" && rule ) {
				delete oargs.obj;
				delete oargs.length;
				oargs = toArray(oargs);
			}
			
			// When `rule` is number equal to 0 remove the `length` and `obj` properties
			if ( typeTest(rule) === "number" && rule === 0 ) {
				delete oargs.obj;
				delete oargs.length;
			}
			return oargs;
		},
		
		__chain: function( obj ) {
			(l)._global = obj;
			(l)._object = obj;
			return (l)._chain ? (l) : obj;
		}
		
	};
	
	/** 
	 * Apply a callback function to every member in a collection. If the iterator 
	 * returns false the loop will break and the method will return.
	 * @param {object} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 * @return {object|array}
	 */
	(l).each = (l).forEach = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'object|function|defaultobject'}]),
			key, value, i;	
		if ( (l).type(args.obj) === "object" ) {	
			for ( key in args.obj ) {
				value = args.fn.call( args.scope || args.obj[key], key, args.obj[key], args.obj );
				if ( value === false ) { break; }
			}			
		} else if ( (l).type(args.obj) === "array" ) {
			for ( i = 0; i < args.obj.length; i++ ) {
				value = args.fn.call( args.scope || args.obj[i], i, args.obj[i], args.obj );
				if ( value === false ) { break; }
			}				
		}
		return (l).fn.__chain( args.obj );
	};
	
	/**
	 * Returns an array of values transformed by an iterator function.
	 * @param {object} obj
	 * @param {function} fn Function iterator
	 * @param {object|function} scope
	 * @return {array}
	 */
	(l).map = (l).collect = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'object|function|defaultobject'}]),
			list = (l).isArray(args.obj) ? args.obj : (l).toArray(obj), ret = [];	
		(l).each(list, function(index, value, list) {
			ret.push( args.fn.call( args.scope || this, value, index, list ) );
		});
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns an array containing extracted property values. This is a common usage of the `map` method
	 * where you return the value that exists at a property.
	 * @param {object} obj
	 * @param {string|number} key
	 * @return {array}
	 */
	(l).pluck = (l).fetch = function( obj, key ) {
		var args = (l).fn.__args([obj, key], [{obj:'object|array'}, {key:'string|number'}]);
		return (l).map(args.obj, function(value) { return value[args.key]; });
	};

	/**
	 * Searches through all values in a collection returning all values that passes
	 * a truth test established by the iterator function.
	 * @param {object|array} obj
	 * @param {function} callback
	 * @param {object|function} scope
	 * @return {array}
	 */
	(l).filter = function( obj, fn, scope, reject ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]], 3: [reject, [1,2,3]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'object|function|defaultobject'}, {reject:'bool'}]),
			ret = [];
		(l).each(args.obj, function(index, value) {
			if ( args.reject ) {
				if ( !args.fn.call( args.scope ? args.scope : this, value, index ) ) { ret.push(value); }
			} else {
				if ( args.fn.call( args.scope ? args.scope : this, value, index ) ) { ret.push(value); }
			}
		});
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Searches through all values in a collection returning all but the values that pass a 
	 * truth test established by the iterator function (the opposite of filter).
	 * @param {object|array} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 * @return {array}
	 */
	(l).reject = function( obj, fn, scope ) {
		return (l).filter.call(this, obj, fn, scope, true);		
	};
		
	/**
	 * Returns true if any member of a collection passes a test.
	 * @param {object} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 * @return {boolean}
	 */
	(l).any = (l).some = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'object|function|defaultobject'}]),
			ret = false;
		(l).each(args.obj, function(index, value) {
			if ( args.fn.call( args.scope ? args.scope : this, value, index ) ) {
				ret = true;
				return false;
			}
		});
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns true if all members of a collection pass `fn`.
	 * @param {object} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 * @return {boolean}
	 */
	(l).all = (l).every = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'function|object|defaultobject'}]),
			ret = true;
		(l).each(args.obj, function(index, value) {
			if ( !args.fn.call( args.scope ? args.scope : this, value, index ) ) { ret = false; }
		});
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns true if none of the values in a collection pass `fn`.
	 * @param {object|array} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 * @return {boolean}
	 */
	(l).none = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'function|object|defaultobject'}]),
			ret = true;
		(l).each(args.obj, function(index, value) {
			if ( args.fn.call( args.scope ? args.scope : this, value, index ) ) { ret = false; }
		});
		return (l).fn.__chain( ret );	
	};
	
	/**
	 * Returns the count of how many values in a collection pass `fn`.
	 * @param {object|array} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 * @return {number}
	 */
	(l).count = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'function|object|defaultobject'}]),
			ret = 0;
		(l).each(args.obj, function(index, value) {
			if ( args.fn.call( args.scope ? args.scope : this, value, index ) ) { ret++; }
		});
		return (l).fn.__chain( ret );		
	};

	/**
	 * Returns the first value in a collection that passes `fn'.
	 * @param {object|array} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 * @return {...*}
	 */
	(l).find = (l).findValue = function( obj, fn, scope, mode ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]], 3:[mode, [1,2,3]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'object|function|defaultobject'}, {mode:'string'}]),
			ret;
		(l).each(args.obj, function(index, value) {
			if ( !args.mode || args.mode === "value" ) {
				if ( args.fn.call( args.scope ? args.scope : this, value, index ) ) {
					ret = value;
					return false;
				}
			} else if ( args.mode === "key" ) {
				if ( args.fn.call( args.scope ? args.scope : this, index, index ) ) {
					ret = value;
					return false;
				}				
			}
		});
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns the first value at a property/index in a collection that passes `fn`.
	 * @param {object|array} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 * @return {number|string}
	 */
	(l).findKey = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'object|function|defaultobject'}]);
		return (l).find.call( args.scope ? args.scope : this, args.obj, args.fn, args.scope, "key" );
	};
	
	/**
	 * Returns only the values whos properties are matched in a list.
	 * @param {object|array} obj
	 * @param {array} list
	 * @return {array}
	 */
	(l).only = (l).whitelist = function( obj, list ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[list, [0,1]]}, [{obj:'object|array'}, {list:'array'}]),
			list = (l).isString(args.list) ? args.list.split(" ") : args.list, ret = [];
		(l).each(list, function(index, value) {
			if ( (l).keyExists(args.obj, value) ) { ret.push( args.obj[value] ); }
		});
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns all values whos properties are not matched in a list.
	 * @param {object} obj
	 * @param {array|string} list
	 * @return {array}
	 */	
	(l).omit = (l).blacklist = function( obj, list ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[list, [0,1]]}, [{obj:'object|array'}, {list:'string|array'}]),
			list = (l).isString(args.list) ? args.list.split(" ") : args.list, ret = [];
		(l).each(args.obj, function(index, value) {
			if ( !(l).exists(list, index) ) { ret.push(value); }
		});
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns an array containing the minimum value in a collection.
	 * @param {object|array} obj
	 * @return {array}
	 */
	(l).min = (l).minValue = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array'}]),
			vals = (l).isPlainObject(args.obj) ? (l).values(args.obj) : args.obj, minVals = [];
		(l).each(vals, function(index, value) { if ( (l).isNumber(value) ) { minVals.push(value); } });
		return (l).fn.__chain( [ Math.min.apply( this, minVals ) ] );
	};
	
	/**
	 * Returns an array containing the maximum value in a collection.
	 * @param {object} obj
	 * @return {array}
	 */
	(l).max = (l).maxValue = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array'}]),
			vals = (l).isPlainObject(args.obj) ? (l).values(args.obj) : args.obj, maxVals = [];
		(l).each(vals, function(index, value) { if ( (l).isNumber(value) ) { maxVals.push(value); } });
		return (l).fn.__chain( [ Math.max.apply( this, maxVals ) ] );
	};
	
	/**
	 * Returns an array containing the average of all the values of a collection.
	 * @param {object|array} obj
	 * @return {array}
	 */
	(l).average = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array'}]),
			sumTotal = 0, len = (l).isArray(args.obj) ? args.obj.length : (l).len(args.obj);
		(l).each(args.obj, function(index, value) { sumTotal += value; });
		return (l).fn.__chain( [ sumTotal / len ] );
	};
	
	/**
	 * Returns the summed value of all the values in a collection.
	 * @param {object} obj
	 * @return {array}
	 */
	(l).sum = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array'}]), ret = 0;
		(l).each(args.obj, function(index, value) { ret += value; });
		return (l).fn.__chain( [ ret ] );
	};
		
	/**
	 * Returns an array containing the reduced value from a list of values based on an 
	 * iterator function where`base` is the initial value of the reduction.
	 * @param {object|array} obj
	 * @param {function} fn
	 * @return {array}
	 */
	(l).reduce = (l).foldl = function( obj, fn, scope, right ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [fn, [0,1]], 2:[scope, [1,2]], 3: [right, [1,2,3]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'object|function|defaultobject'}, {right:'bool'}]), 
			copy = args.obj, i = 0, base, keys, vals;
		
		// When reducing from right, flip the list 
		if ( args.right ) {
			if ( (l).isPlainObject(copy) ) {
				keys = (l).keys(copy).reverse();
				vals = (l).values(copy).reverse();
				copy = (l).create(keys, vals);
			} else if ( (l).isArray(copy) ) {
				copy = copy.reverse();
			}
		}
		base = (l).find(copy, function(value) { return value; });
		(l).each(copy, function(index, value) {
			if ( i !== 0 ) { base = args.fn.call(args.scope || this, base, value, index); }
			i++;
		});
		return (l).isArray(base) ? (l).fn.__chain( base ) : (l).fn.__chain( [ base ] );
	};
	
	/**
	 * Returns an array containing the result from the right associative version of the reduce method.
	 * @param {object} obj
	 * @param {function} fn
	 * @return {array}
	 */
	(l).reduceRight = (l).foldr = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'object|function|defaultobject'}]);
		return (l).reduce.call(this, args.obj, args.fn, args.scope, true);
	};
	
	/**
	 * Returns the value in a collection with the least occurences. 'fn' should be a function mapping
	 * the value to be tested or a string representing the property name to test.
	 * @param {object} obj
	 * @param {function} fn
	 * @return {...*}
	 */
	(l).least = function( obj, fn, most ) {
		var args = (l).fn.__args([obj, fn, most], [{obj:'object|array'}, {fn:'function|string'}, {most:'bool'}]),
			copy = args.obj, comparator, result, ret, leastValue;
		if ( (l).isString(args.fn) ) { 
			result = (l).countBy(args.obj, function(p){ return p[args.fn]; }); 
			comparator = (l).countBy(args.obj, function(p){ return p[args.fn]; }, this, true); 
		} 
		else { 
			result = (l).countBy(args.obj, args.fn || function(num){ return num; }); 
			comparator = (l).countBy(args.obj, args.fn || function(num){ return num; }, this, true); 
		}
		leastValue = (args.most) ? (l).max(result) : (l).min(result);
		(l).each(result, function(index, value) {
			if ( leastValue[0] == value ) {
				ret = comparator[index].val[0];
				return false;
			}
		});
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns the value in a collection with the most occurences. 'fn' should be a function mapping
	 * the value to be tested or a string representing the property name to test.
	 * @param {obj}
	 * @return {...*}
	 */
	(l).most = function( obj, fn ) {
		return (l).least.call(this, obj, fn, true);
	};
	
	/**
	 * Returns an array that contains a copy of all values in a collection randomized. Implements
	 * Fischer-Yates shuffle algorithm.
	 * @param {object|array} obj
	 * @return {array}
	 */
	(l).shuffle = (l).randomized = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array'}], null),
			ret, i, n, copy;
		ret = (l).isPlainObject(args.obj) ? (l).toArray(args.obj) : args.obj;
   	for ( i = ret.length - 1; i > 0; i-- ) {
			n = Math.floor(Math.random() * (i + 1));
			copy = ret[i];  
			ret[ i ] = ret[n];
			ret[ n ] = copy;
		}
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns a random sample of values from a collection. When `n` is passed returns `n` number 
	 * of random samples.
	 * @param {object|array} obj
	 * @param {number} n
	 * @return {array}
	 */
	(l).sample = function( obj, n ) {
		var args = (l).fn.__args([obj, n], [{obj:'object|array'}, {n:'number'}]),
			arr = (l).isPlainObject(args.obj) ? (l).toArray(args.obj) : args.obj, ret = [], i;
		for ( i = args.n || 1; i > 0;  i-- ) { ret.push( (l).shuffle(args.obj)[0] ); }
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns a boolean indicating if a property/index is in a collection.
	 * @param {object|array} obj
	 * @param {string} key
	 * @return {boolean}
	 */
	(l).has = function( obj, key ) {
		var args = (l).fn.__args([obj, key], [{obj:'object|array'}, {key:'string|number'}]),
			o, keys;
		keys = (l).keys( args.obj );
		for ( o in args.obj ) { 
			if ( args.key == o ) { 
				return true; 
			}
		}
		return false;
	};

	/**
	 * Returns true if a member value in a collection exists.
	 * @param {object} obj
	 * @param {...*} value
	 * @return {boolean}
	 */
	(l).contains = (l).exists = (l).valueExists = (l).inArray = function( obj, value ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[value, [0,1]]}, [{obj:'object|array'}, {value:'*'}]);
		return (l).findValue(args.obj, function(value) {
			return (l).isEqual(args.value, value) ? true : false;
		}) ? true : false;
	};
	
	/**
	 * Returns true if a property/index in a collection exists.
	 * @param {object|array} obj
	 * @param {string|number} key
	 * @return {boolean}
	 */
	(l).keyExists = function( obj, key ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[key, [0,1]]}, [{obj:'object|array'}, {key:'string|number'}]);
		return (l).findKey(args.obj, function(index) {
			return args.key === index ? true : false;
		}) ? true : false;
	};
	
	/** 
	 * Returns true when an object type is falsy (null, false, undefined, NaN, 0, "")
	 * @param {object} obj
	 * @return {bool}
	 */
	(l).isFalsy = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		if ( arguments.length === 1 ) { args.obj = obj; }
		return ( (l).isUndefined(args.obj) || (l).isBool(args.obj) && Boolean(args.obj) === false 
			|| (l).isNull(args.obj) || (l).isNaN(args.obj) || args.obj === "" || args.obj === 0 );
	},
	
	/**
	 * Tests objects to be of type [type].
	 * @param {object} obj
	 * @return {bool}
	 */
	(l).isArray = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return {}.toString.call(obj) === "[object Array]";
	};
	
	(l).isString = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return typeof obj === "string" && {}.toString.call(obj) === "[object String]";
	};
	
	(l).isBool = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return {}.toString.call(obj) === "[object Boolean]";
	};
	
	(l).isNull = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return {}.toString.call(obj) === "[object Null]";
	};
	
	(l).isNumber = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return {}.toString.call(obj) === "[object Number]";
	};
		
	(l).isFunction = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return {}.toString.call(obj) === "[object Function]";
	};
	
	(l).isArguments = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return {}.toString.call(obj) === "[object Arguments]";
	};
	
	(l).isUndefined = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return typeof obj === "undefined";
	};
	
	(l).isDate = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return {}.toString.call(obj) === "[object Date]" || obj instanceof Date;
	};
	
	(l).isRegExp = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return {}.toString.call(obj) === "[object RegExp]" || obj instanceof RegExp;
	};
		
	(l).isPlainObject = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return typeof obj === "object" && {}.toString.call(obj) === "[object Object]";
	};
	
	(l).isObject = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return typeof obj === "object";
	};
	
	(l).isElement = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return typeof obj === "object" ? obj instanceof HTMLElement :
			obj && typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string";
	};
	
	(l).isNaN = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return typeof obj === "number" && obj !== obj;
	};

	(l).isFinite = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return obj === Infinity || obj === -Infinity;
	};

	/** 
	 * Returns true when a collection has no properties/indices.
	 * @param {object|array} obj
	 * @return {boolean}
	 */			
	(l).isEmpty = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array'}]);
		obj = arguments.length === 0 ? args.obj : obj;
		return (l).keys(obj).length ? false : true;
	};
	
	/** 
	 * Returns true when a targeted value in an object is unique.
	 * @param {object} obj
	 * @param {string|number} key
	 * @return {boolean}
	 */
	(l).isUnique = function( obj, key ) {
		var args = (l).fn.__args([obj, key], [{obj:'object|array'}, {key:'string|number'}]),
			target, o;
		if ( args.key in args.obj ) {
			target = args.obj[args.key];
			args.key = args.key.toString();
			for ( o in args.obj ) {
				if ( (l).isEqual(target, args.obj[o]) && o !== args.key ) { 
					return false; 
				}
			}
		}	else {
			throw Error('isUnique(): Target `key` not in collection.');
		}
		return true;
	};
	
	/**
	 * Performs a comparison between two values of any type testing for equality and returns
	 * true when both values are equal. Performs a deep equality test on objects such as arrays
	 * an object literals that can contain nested values.
	 * @param {object} obj
	 * @param {object} objN
	 * @return {boolean}
	 */
	(l).isEqual = function( obj, objN ) {
		var o;

		// When not called as stand alone method use globally targeted object
		if ( (l).isUndefined((l).isEqual.__count) && arguments.length === 1 ) {
			var args = (l).fn.__args([], [{obj:'object'}]);
			objN = args.obj;
			(l).isEqual.__count = 1;
		} else {
			(l).isEqual.__count++;
		}

		// Compare objects that don't have nested objects
		if ( (l).type(obj) === (l).type(objN) && !(l).isPlainObject(obj) && !(l).isArray(obj) ) {
			switch ( (l).type(obj) ) {
				case "function" : if ( obj.toString() !== objN.toString() ) {	return false; }						
					break;
				case "nan" : if ( obj === objN ) { return false; }
					break;
				default:
					if ( obj !== objN ) {	return false; }					
			}
		
		// Compare objects that do have nested objects
		} else {
		
			// When target or comparison is falsy we compare them directly
			if ( (l).isFalsy(obj) || (l).isFalsy(objN) ) {
				if ( obj !== objN ) { return false; }
			}
			for ( o in obj ) {
				switch ( true ) {
					
					// Catch comparison of element first to prevent infinite loop when caught as objects
					case ( (l).isElement(obj[o]) ) : if ( obj[o] !== objN[o] ) { return false; }
						break;
					case ( typeof obj[o] === "object" ) : if ( !(l).isEqual(obj[o], objN[o]) ) { return false; }
						break;
					case ( typeof obj[o] === "function" ) :
						if ( !(l).isFunction(objN[o]) ) {	return false; }
						if ( obj[o].toString() !== objN[o].toString() ) {	return false; }
						break;
					default :
						if ( obj[o] !== objN[o] ) { return false; }
				}
			}
			
			// Make sure member is in both objects
			for ( o in objN ) {
				if ( typeof obj === "undefined" ) { return false; }
				if ( obj === null || obj === undefined ) { return false; }
				if ( (l).isFalsy(obj[o]) ) {
					if ( obj[o] !== objN[o] ) { return false; }	
				} 
			}
		}
		return true;
	};
	
	/**
	 * Returns a string representative of the object type.
	 * @param {object} obj
	 * @return {string|boolean}
	 */		
	(l).type = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'*'}]),
			types = "Date RegExp Element PlainObject Array Function String Bool NaN Number Null Undefined Object".split(" "), i;
		obj = arguments.length === 0 ? (l)._global : obj;
		for ( i = 0; i < types.length; i++ ) {
			if ( (l)["is"+types[i]].call(this, obj) ) {
				return ( types[i].toLowerCase() === "plainobject" ) ? "object" : types[i].toLowerCase();
			}
		}
		return false;
	};
	
	/**
	 * Returns the value located at the `key` target property in an object. Performs a deep
	 * search through all nested objects to find `key` of which can be a dot delimited "namespace"
	 * string.
	 * @param {object} obj
	 * @param {string} key
	 * @return {...*}
	 */
	(l).get = (l).getByKey = function( obj, key ) {
		var args = (l).fn.__args(arguments, [{obj:'object'}, {key:'string|number'}]),
			o, ns, ret;
		
		// Split property key into namespace		
		ns = ( (l).type(args.key) !== "string" ) ? false : args.key.split(".");
		
		// When no key just return the target object
		if ( args.length === 1 ) {
			(l)._found = false;
			return args.obj;
		}
		
		// Search starting with namespace if given
		if ( ns.length > 1 ) {
			args.obj = (l).get( args.obj, ns.shift() );
			args.key = ns.pop();
		} 
		
		// Look for a property in the object
		if ( (l).isPlainObject( args.obj ) ) {
			if ( args.key in args.obj ) {
				(l)._found = true;
				return args.obj[args.key];
			} else { 
				for ( o in args.obj ) {
					if ( (l).isPlainObject( args.obj[o] ) ) {
						if ( ret = (l).get( args.obj[o], args.key ) ) { return ret; }
					}
				}
			}
		}
		
		// Set the global _found property to false for init method
		(l)._found = false;
		return false;
	};
	
	/**
	 * Performs a deep search and returns objects of a given type. When `type` is "*", returns
	 * all members in the object.
	 * @param {object} obj
	 * @param {string} type 
	 * @param {string} key
	 * @param {boolean} deep
	 * @return {object}
	 */
	(l).getByType = function( obj, type, key, deep ) {
		var args = (l).fn.__args({0:[obj,[0]], 1:[type,[0,1]], 2:[key,[1,2]], 3:[deep,[1,2,3]]}, [{obj:'object'}, {type:'string'}, {key:'string|number'}, {deep:'bool'}]),
			stack = {}, type = args.type || "*";
			
		// Start search starting at key when given
		if ( args.key ) {
			if ( !(l).isPlainObject(args.obj = (l).get( args.obj, args.key)) ) {
				if ( args.type === (l).type(args.obj) || type === "*") {
					args.key = args.key.split(".");
					stack[args.key[args.key.length-1]] = args.obj; 
					return stack;
				}
			}
		}
		
		// Perform deep search for objects of type			
		(l).deep(args.obj, function(depth, index, elm) {
			if ( args.type === (l).type(elm) || type === "*") { stack[index] = elm; }
		}, (args.deep ? "*" : 1), true );
		return (l).fn.__chain( stack );
	};
	
	/**
	 * - Merges two or more objects together into the first. Properties with the same name will be 
	 * 	 overriden by merged objects. 
	 * - When called as a standalone method the first object passed will be the object that is 
	 *   extended. 
	 * - All passed objects will be merged into the target object when it is selected through the 
	 *   library constructor or through the chain method.
	 * - When a single object is passed and no target object has been selected the properties of the
	 *   passed object will be merged with the library object itself.
	 * @param {object} [obj1]
	 * @param {object} [...,objN]
	 * @param {boolean} deep
	 * @return {object}
	 */
	(l).extend = (l).merge = function() {
		var args = (l).fn.__args(arguments, [{deep:'bool'}, {'*':'obj:object'}]),
			target = (l)._object || args.obj, keys = [],
			obj, objs, copy, key, i, o;
		
		// Collect potential objects to merge
		objs = (l).filter(args, function(value, index) {
			if ( index !== "obj" && 
					 (l).isPlainObject(value) && 
					 !((l).isEqual(target, value))) { return value; }
		});
		
		// When target object is not selected globally
		if ( !args.obj ) {
			target = objs.shift();
		}
		
		// When target object is not selected globally and only a single object
		// is passed extend the library itself
		if ( !(l)._global && !objs.length ) {
			target = this;
			objs[0] = args.obj;
		}
		
		// When a boolean is passed go deep
		if ( args.deep ) {

			// Build property reference used to prevent never ending loops
			(l).each(objs, function(index, value) {
				keys.push((l).keys(value));
				keys = (l).flatten(keys);
			});
			
			// Add properties to all nested objects
			(l).deep(target, function( depth, index, obj, ref ) {
				if ( (l).indexOf(keys, index) === -1 ) {
					for ( i = 0; i < objs.length; i++ ) {
						for ( key in objs[i] ) {
							if ( (l).isPlainObject(obj) ) {
								copy = objs[i][key];
								obj[key] = copy;
							}
						}
					}
				}
			}, "*");
		}

		// Merge first level properties after going deep
		for ( i = 0; i < objs.length; i++ ) {
			if ( ( obj = objs[i] ) !== null ) {
				for ( key in obj ) {
					copy = obj[key];
					if ( target === copy ) { continue; }
					target[ key ] = copy;
				}
			}
		}
		return (l).fn.__chain( target );
	};
	
	/**
	 * Calls all functions in an object except those excluded in the `only` array. 
	 * @param {object} obj
	 * @param {string} key
	 * @param {array} fargs
	 * @param {boolean} deep
	 * @param {array} only
	 * @return {object}
	 */
	(l).call = function( obj, key, fargs, deep, only ) {
		var args = (l).fn.__args({0:[obj,[0]], 1:[key,[0,1]], 2:[fargs,[1,2]], 3:[deep,[1,2,3]], 4:[only,[1,2,3,4]]}, [{obj:'object'}, {key:'string|number'}, {fargs:'array'}, {deep:'bool'}, {only:'string'}]),
			stack = {}, only = (l).isString(args.only) ? args.only.split(" ") : args.only,
			fns = (l).functions(args.obj, args.key, args.deep), keys = [];		
		return (l).toObject( (l).filter(fns, function(value, index) {
			if ( only ) {
				if ( (l).inArray(only, index) ) {
					keys.push(index);
					value.apply(this, args.fargs);
					return true;
				}
			} else {
				keys.push(index);
				value.apply(this, args.fargs);
				return true;
			}
		}), keys);
	};
		
	/**
	 * [type]s(): 
	 * Returns an object containing all found values of [type].
	 * @param {object} obj
	 * @param {string} key
	 * @param {boolean} deep
	 * @return {object}
	 */
	(l).each(['array', 'object', 'function', 'string', 'bool', 'number', 'null', 'undefined', 'date', 'regexp', 'element', 'nan'],			 
		function(index, name) {
			(l)[ name + 's' ] = function( obj, key, deep ) {
				var args = (l).fn.__args([obj, key, deep], [{obj:'object'}, {key:'string|number'}, {deep:'bool'}]); 
				return (l).getByType(args.obj, name, args.key, args.deep);
			};
	});
	
	/**
	 * no[Type]s():
	 * Returns an object containing all found values except those of [type].
	 * @param {object} obj
	 * @param {string} key
	 * @param {boolean} deep
	 * @return {object}
	 */
	(l).each(['array', 'object', 'function', 'string', 'bool', 'number', 'null', 'undefined', 'date', 'regexp', 'element', 'nan'],			 
		function(index, name) {
			(l)[ 'no' + name.charAt(0).toUpperCase() + name.slice(1) + 's' ] = function( obj, key, deep ) {
				var args = (l).fn.__args([obj, key, deep], [{obj:'object'}, {key:'string|number'}, {deep:'bool'}]), stack = {};
				console.log((l).getByType(args.obj, "*", args.key, args.deep));  
				(l).each((l).getByType(args.obj, "*", args.key, args.deep), 
					function(index, value) { if ( !((l).type(value) === name) ) {
						stack[ index ] = value; } 
					});
				return (l).fn.__chain( stack ); 
			};
	});
	
	/**
	 * [type]Names():
	 * Returns a sorted list of the names of every property that references a
	 * value of a [type].
	 * @param {object} obj
	 * @param {string} key
	 * @param {boolean} deep
	 * @return {array}
	 */
	(l).each(['array', 'object', 'function', 'string', 'bool', 'number', 'null', 'undefined', 'date', 'regexp', 'element', 'nan'],			 
		function(index, name) {
			(l)[ name + 'Names' ] = function( obj, key, deep ) {
				var args = (l).fn.__args([obj, key, deep], [{obj:'object'}, {key:'string|number'}, {deep:'bool'}]);
				return (l).keys((l).getByType(args.obj, name, args.key, args.deep)).sort();
			};
	});

	/**
	 * Calls `fn` on each value in the target collection. All values in the `fargs` array are passed
	 * to `fn` when invoked.
	 * @param {object|array} obj
	 * @param {function|string} fn
	 * @param {array} fargs
	 * @return {array}
	 */
	(l).invoke = function( obj, fn, fargs ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[fargs, [1,2]]}, [{obj:'object|array'}, {fn:'function|string'}, {fargs:'array'}]), fargs = args.fargs || [], ret;
		return (l).map(args.obj, function(value) {
			fargs.unshift(value);
			ret = ((l).isFunction(args.fn) ? args.fn : value[args.fn]).apply(value, fargs);
			fargs.shift();
			return ret;
		}); 
	};
	
	/**
	 * Returns the parent object of value at `key`.
	 * @param {object} obj
	 * @param {string|number} key
	 * @return {object}
	 */
	(l).parent = function( obj, key ) {
		var args = (l).fn.__args([obj, key], [{obj:'object'}, {key:'string|number'}]),
			target = args.key ? (l).get(args.obj, args.key) : (l)._global, objs, o, p, ret;
		objs = (l).getByType(args.obj, true);	
		for ( o in objs ) {
			if ( (l).isPlainObject(objs[o]) ) {
				for ( p in objs[o] ) {
					if ( (l).isEqual(objs[o][p], target) ) {
						return objs[o];
					}
				}
			}
		}
		return (l).fn.__chain( args.obj );
	};
	
	/**
	 * Returns an object that is the result of flipping a collection's keys and values.
	 * @param {object} obj
	 * @return {object}
	 */
	(l).invert = (l).transpose = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array'}]), invertedObj = {};
		(l).each(args.obj, function(index, value) { invertedObj[value] = index; });
		return (l).fn.__chain( invertedObj );
	};
	
	/**
	 * Returns an object containing all of the property paths of an object. Each
	 * property path is referenced by the property name.
	 * @param {object} obj
	 * @return {object}
	 */
	(l).paths = function( obj, pathObj, lastKey, nextKey ) {
		var args = (l).fn.__args([obj], [{obj:'object'}]),
			o, key, subPath,
			pathObj = pathObj ? pathObj : {},
			lastKey = lastKey ? lastKey : "",
			nextKey = nextKey ? nextKey : "";
		
		for ( o in args.obj ) {		
			pathObj[o] = (nextKey + "." + lastKey + "." + o).replace(/^[.]+/g, "");
			key = nextKey + "." + lastKey;
			if ( (l).isPlainObject(args.obj[o]) ) { (l).paths(args.obj[o], pathObj, o, key); }
		}
		return (l).fn.__chain( pathObj );
	};
	
	/**
	 * Returns the full namespace path to any targeted `key` property in `obj` at any depth.
	 * @param {object} obj
	 * @param {string} key
	 * @return {string}
	 */
	(l).resolve = function( obj, key ) {	
		var args = (l).fn.__args([obj, key], [{obj:'object'}, {key:'string|number'}]), 
			o, ret;
		if ( !args.key ) {
			for ( o in args.obj ) {
				args.key = o;
				break;
			}
		}
		return (l).paths(args.obj)[args.key];
	};
	
	/**
	 * Returns the target object with a namespaced object built and attached to it.
	 * - At its core `builds` creates an object from a namespace string. If the `members` object is passed the deepest
	 *   object receives all members. 
	 * - When the `_extends` property is present in `members`, all objects in the array referenced at `_extends` will 
	 *   be inherited.
	 * - When the `_exposed` property is present in `members` and contains an array of property names of objects to expose, 
	 *   all objects that match a property name in the array will have `members` properties extended onto them.
	 * - When the `_retract` property is present in `members` and contains an array of property names of objects to retract,
	 *   all objects that match a property name in the array will extend their properties onto `members`.
	 * - Optionally passing true through `deep` will give all nested objects in `members` the properties of the objects
	 *   in `_extends`.
	 * @param {object} obj
	 * @param {string} ns
	 * @param {object} members
	 * @param {boolean} deep
	 * @return {object}
	 */
	(l).build = (l).module = function( obj, ns, members, deep ) {
		var args = (l).fn.__args({0:[obj,[0]], 1:[ns,[0,1]], 2:[members,[1,2]], 3:[deep,[2,3]]}, [{obj:'object'}, {ns:'string|number'}, {members:'object'}, {deep:'bool'}]),
			list = args.ns.split("."), ns = list.shift(), obj = args.obj || {}, members, o;

		// Build namespaced object
		obj[ns] = obj[ns] || {};
		if ( list.length ) {
			(l).build( obj[ns], list.join('.'), args.members, args.deep );
		}
		
		// Build namespace object with members
		if ( args.ns.split(args.ns.length-1)[0] === ns && (l).isPlainObject(args.members) ) {	
			obj[ns] = (l)(obj[ns]).extend(args.members);
			
			// When contains the `extends` property extend object with all objects at `extends`
			if ( '_extends' in obj[ns] ) {
				if ( (l).isArray(obj[ns]['_extends']) ) {
					
					// Inherit properties from extensions with `extend`
					var extensions = obj[ns]['_extends'];
					var retractions = obj[ns]['_retract'];
					var exposures = obj[ns]['_exposed'];
					extensions.unshift(obj[ns], args.deep);
					delete obj[ns]['_extends'];
					delete obj[ns]['_retract'];
					delete obj[ns]['_exposed'];
					obj[ns] = (l).extend.apply(this, extensions, args.deep);
					
					// Extend all children objects with their parent's properties if they are in the `exposures` list
					members = (l).noObjects(obj[ns]);
					for ( o in obj[ns] ) {
						if ( (l).isPlainObject(obj[ns][o]) && (l).inArray(exposures, o) ) {
							(l).bindAll(obj[ns][o], (l).chain(obj[ns]).functions().end());
							obj[ns][o] = (l).extend.call(this, obj[ns][o], (l).chain(obj[ns]).noObjects().end());
						}
					}
					
					// Extend parent with its children's properties if they are listed in the `retractions` list
					members = (l).objects(obj[ns]);
					for ( o in members ) {
						if ( (l).inArray(retractions, o) ) {
							obj[ns] = (l).extend.call(this, obj[ns], members[o]);
						}
					}
				}
			}
		}
		return (l).fn.__chain( obj );
	};
	
	/**
	 * Returns an object created from either two arrays, one containing the keys the other the values OR
	 * from a single array where odd values become keys and even values.
	 * @param {object} obj
	 * @param {array} pairs
	 * @param {string|number} key
	 * @return {object}
	 */
	(l).create = function( obj, pair, pairs, key ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [pair, [0,1]], 2: [pairs, [1,2]], 3: [key, [1,2,3]]}, [{obj:'object'}, {pair:'array'}, {pairs:'array'}, {key:'string|number'}]), ret = {}, i;
		if ( (l).isArray(args.pair) && (l).isArray(args.pairs) ) {
			for ( i = 0; i < args.pairs.length; i ++) {
				ret[args.pair[i]] = args.pairs[i];
			}		
		} else {		
			for ( i = 0; i < args.pair.length; i += 2) {
				ret[args.pair[i]] = args.pair[i+1];
			}
		}
		if ( args.key ) {
			args.obj[args.key] = ret;
			return (l).fn.__chain( args.obj );
		} else {
			return (l).fn.__chain( ret );
		}
	};
	
	/**
	 * Returns a collection with a value added if the `key` property/index doesn't exist.
	 * @param {object|array} obj
	 * @param {string|number} key
	 * @param {...*} value
	 * @return {object}
	 */	
	(l).add = function( obj, key, value ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[key, [0,1]], 2:[value, [1,2]]}, [{obj:'object|array'}, {key:'string|number'}, {value:'*'}]);
		if ( args.key in args.obj ) { throw new Error('Property already exists in object.');
		} else { args.obj[args.key] = args.value; }
		return (l).fn.__chain( args.obj );
	};
	
	/**
	 * Returns a collection with a value added regardless if the `key` property/index exists.
	 * @param {object|array} obj
	 * @param {string|number} key
	 * @param {...*} value
	 * @return {object}
	 */
	(l).set = function( obj, key, value ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[key, [0,1]], 2:[value, [1,2]]}, [{obj:'object|array'}, {key:'string|number'}, {value:'*'}]);
		args.obj[args.key] = args.value;
		return (l).fn.__chain( args.obj );
	};
	
	/**
	 * Sets all undefined values in a collection to `value`.
	 * @param {object|array} obj
	 * @param {...*} value
	 * @return {object}
	 */
	(l).setUndef = (l).setIfUndefined = function( obj, value ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[value, [0,1]]}, [{obj:'object|array'}, {value:'*'}]);
		if ( arguments.length === 1 ) {
			args.value = args.obj;
			args.obj = (l)._global || {};
		}
		(l).each(args.obj, function(index, value) {
			if ( (l).isUndefined(value) ) { args.obj[index] = args.value;	}
		});
		return (l).fn.__chain( args.obj );	
	};
	
	/**
	 * Sets null and undefined properties in object with replacement values contained in 
	 * the defaults object. Will not override values that are already set.
	 * @param {object} obj
	 * @param {...*} defaults
	 * @return {object}
	 */
	(l).defaults = function( obj, defaults ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[defaults, [0,1]]}, [{obj:'object'}, {defaults:'object'}]);
		if ( arguments.length === 1 ) { args.defaults = args.obj; args.obj = (l)._global || {}; }	
		(l).each(args.defaults, function(index, value) {
			if ( !(index in args.obj) ) {
				args.obj[ index ] = value;
			} else if ( index in args.obj ) {
				if ( (l).isNull(args.obj[index]) || (l).isUndefined(args.obj[index]) ) {
					args.obj[ index ] = value;
				}
			}
		}) 
		return (l).fn.__chain( args.obj );
	}; 
	
	/**
	 * Creates a shallow copy of a collection. 
	 * @param {object|array} obj
	 * @return {object|array}
	 */
	(l).clone = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array'}]);
		return !(l).isPlainObject(args.obj) ? (l).fn.__chain( args.obj ) : (l).merge({}, args.obj);
	};
	
	/**
	 * Returns an object who's children have been ncapsulated within their own sub-objects. If `prefix`
	 * is given will prepend a prefix string to the the newly nested objects property names.
	 * @param {object} obj
	 * @return {object}
	 */
	(l).nest = function( obj, prefix ) {
		var args = (l).fn.__args([obj, prefix], [{obj:'object'}, {prefix:'string|number'}]), 
			prefix = args.prefix ? args.prefix : "", newObj;
		(l).each(args.obj, function(index, value) {
			newObj = {};
			newObj[prefix+index] = value;
			args.obj[index] = newObj;
		});
		return (l).fn.__chain( args.obj );
	};
	
	/**
	 * Removes a value from a collection at `key`. When removing values from an array, `key` should
	 * be the index from where to remove value.
	 * @param {object|array} obj
	 * @param {string|number} key
	 * @return {object}
	 */	
	(l).remove = function( obj, key ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[key, [0,1]]}, [{obj:'object|array'}, {key:'string|number|array'}]),
			rest, from, i;
		if ( (l).isPlainObject(args.obj) ) {			
			if ( (l).isArray(args.key) ) {
				for ( i = 0; i < args.key.length; i++ ) {
					if ( args.key[i] in args.obj ) { 
						delete args.obj[args.key[i]];
					}
				}
			} else {
				if ( args.key in args.obj ) { 
					delete args.obj[args.key];
				}
			}
		} else if ( (l).isArray(args.obj) ) {
			from = parseInt(args.key);
			rest = args.obj.slice((from) + 1);
			args.obj.length = (from < 0) ? args.obj.length + from : from; 
			args.obj.push.apply(args.obj, rest);
		}
		return (l).fn.__chain( args.obj );
	};
	
	/**
	 * Returns collection that has had all values and property/names removed.
	 * @param {object|array} obj
	 * @param {object|array}
	 */	
	(l).clear = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array'}]);
		if ( (l).isPlainObject(args.obj) ) {			
			(l).each(args.obj, function(index, value) { delete args.obj[index]; });
		} else if ( (l).isArray(args.obj) ) { args.obj.length = 0; }
		return (l).fn.__chain( args.obj );
	};
	
	/**
	 * Returns a collection that has had all values set to undefined.
	 * @param {object|array} obj
	 * @return {object|array}
	 */	
	(l).empty = function( obj ) {		
		var args = (l).fn.__args([obj], [{obj:'object|array'}]);		
		if ( (l).isPlainObject(args.obj) || (l).isArray(args.obj) ) {
			(l).each(args.obj, function(index, value) { args.obj[index] = undefined; });
		}
		return (l).fn.__chain( args.obj );
	};
	
	/**
	 * Returns a collection that has had an iterator function passed over each value where the
	 * returned result from iterator is placed at the corresponding property/index.
	 * @param {object|array} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 * @return {object|array}
	 */
	(l).replace = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'object|array'}, {fn:'function'}, {scope:'object|function|defaultobject'}]),
			ret;
		if ( (l).isPlainObject(args.obj) ) {
			ret = {};
			(l).each(args.obj, function(index, value) {
				ret[index] = args.fn.call( this, value );
			});
		} else if ( (l).isArray(args.obj) ) {
			ret = [];
			(l).each(args.obj, function(index, value) {
				ret.push( args.fn.call( this, value ) );
			});
		}
		return (l).fn.__chain( ret );
	};
		
	/**
	 * Performs a deep iteration on the target object and calls `fn` on every nested array or 
	 * object within a collection. When `fargs` is an array its values are passed as arguments
	 * to `fn`. When `depth` is set will prevent the deep search from going deeper than the depth
	 * defined. If `arrs` is true will not perform a deep search through nested arrays.
	 * @param {object|array} obj
	 * @param {function} fn
	 * @param {array} fargs
	 * @param {object|function} scope
	 * @param {number} depth
	 * @param {boolean} arrs
	 * @return {object}
	 */
	(l).deep = function( obj, fn, fargs, scope, depth, arrs ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[fargs, [1,2]], 3:[scope, [1,2,3]], 4:[depth, [2,3,4]], 5:[arrs, [3,4,5]]}, [{obj:'object|array'}, {fn:'function'}, {fargs:'array'}, {scope:'object|function|defaultobject'}, {depth:'number'}, {arrs:'bool'}]),
		depth = args.depth ? args.depth : "*", o, res;

		// Place passed object at the beginning of the 'fargs' array
		args.fargs = args.fargs ? args.fargs : [];

		// Call iterator on every nested object/array to level specified by depth
		for ( o in args.obj ) {
			if ( (l).isArray(args.fargs) ) { args.fargs.unshift(depth, o, args.obj[o], args.obj); }
			res = args.fn.apply( args.scope || this, args.fargs );
			if ( res === false ) { break; }
			if ( (l).isPlainObject(args.obj[o]) || ( (l).isArray(args.obj[o]) && !args.arrs ) ) {
				args.depth = (depth === "*") ? "*" : depth-1;
				args.fargs = (l).shift(args.fargs, 4);
				if ( args.depth ) { (l).deep(args.obj[o], args.fn, args.fargs, args.scope, args.depth, args.arrs); }
			}
			args.fargs = (l).shift(args.fargs, 4);
		}
		return (l).fn.__chain( args.obj );
	};

	/**
	 * Calls a user defined function on the targeted collection. Method is useful for inserting custom 
	 * functionality within chainned methods.
	 * @param {object|array} obj
	 * @param {function} fn
	 * @return {object}
	 */
	(l).tap = function( obj, fn ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [fn, [0,1]]}, [{obj:'object|array'}, {fn:'function'}]);	
		args.fn.call(this, args.obj);
		return (l).fn.__chain( args.obj );
	};
	
	/**
	 * Searches through a collection, returning an array of name/value pairs that the name/value pairs
	 * matched in the `matches` object.
	 * @param {object} obj
	 * @param {object} matches
	 * @param {object|function} scope
	 * @return {array}
	 */
	(l).where = function( obj, matches, find ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[matches, [0,1]], 2:[find, [1,2]]}, [{obj:'object|array'}, {matches:'array|object'}, {find:'bool'}]);
		return (l)[find ? 'find' : 'filter'](args.obj, function(value, index) {
			for ( var key in args.matches ) {
				if (args.matches[key] !== value[key]) { return false; }
			}
			return true;
		});
	};

	/**
	 * Searches through a collection, returning the first value that matches all of the key value pairs 
	 * in the `matches` object.
	 * @param {object} obj
	 * @param {object} matches
	 * @param {object|function} scope
	 * @return {object}
	 */
	(l).whereFirst = function( obj, matches ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[matches, [0,1]]}, [{obj:'object|array'}, {matches:'array|object'}]);
		return (l).where(args.obj, args.matches, true);
	};
	
	/**
	 * Returns a collection in groups of `n` values. If `pad` is passed, pads the collection with `pad`.
	 * @param {object|array} obj
	 * @param {integer} n
	 * @param {...*} pad
	 * @return {object}
	 */
	(l).groupsOf = function( obj, n, pad ) {
		var args = (l).fn.__args({0:[obj, [0]], 1:[n, [0,1]], 2:[pad, [1,2]]}, [{obj:'array|object'}, {n:'number'}, {pad:'*'}]),
			res = {}, i = 0, key;
		(l).each(args.obj, function(index, value) {
			if ( i < args.n-1 && (l).has(res, key) ) {
				i += 1;
				res[key].push(value);
			} else {
				i = 0;
				key = index;
				res[key] = [value];
			}
		});
		if ( args.pad ) {
			(l).each(res, function(index, value) {
				if ( value.length < args.n ) {
					for ( i = value.length; i < args.n; i++ ) {
						res[index].push(args.pad);
					}
				}
			});
		}
		return (l).fn.__chain( res );
	};

	/**
	 * Returns an object containing a collection's values that have been grouped after running 
	 * each value through `map`. When `map` is passed as a string, values are grouped by the
	 * property name given by `map`.
	 * @param {object|array} obj
	 * @param {string|function} map
	 * @param {function|object} scope
	 * @return {object}
	 */
	(l).groupBy = function( obj, map, scope, count, key ) {
		var args = (l).fn.__args({0:[obj, [0]], 1:[map, [0,1]], 2:[scope, [1,2]], 3:[count, [2,3]], 4:[key, [4]]}, [{obj:'array|object'}, {map:'function|string'}, {scope:'function|object|defaultobject'}, {count:'bool'}, {key:'bool'}]),
			res = {}, key;
		(l).each(args.obj, function(index, value) {
			key = (l).isString(args.map) ? value[args.map] : args.map.call(args.scope || this, value, index, args.obj);	
			if ((l).has(res, key)) { res[key].push(value); } 
			else { res[key] = [value]; }
		});
		if ( args.count ) {
			(l).each(res, function(index, value) {
				if ( args.key ) {
					res[index] = {};
					res[index].len = value.length;
					res[index].val = value;
					res[index].key = index;
				} else {
					res[index] = value.length;
				}
			});
		}
		return (l).fn.__chain( res );
	};
		
	/**
	 * Returns an object containing a collection sorted into groups that each contain the
	 * number of objects in each group. 
	 * @param {object|array} obj
	 * @param {string|function} map Mapping function or property name string
	 * @param {function|object} scope The scope to bind `map` to
	 * @return {object}
	 */
	(l).countBy = function( obj, map, scope, index ) {
		return (l).groupBy.call(this, obj, map, scope || this, true, index);
	};
	
	/**
	 * Returns an array containing a collections properties/indices.
	 * @param {object|array|function} obj
	 * @return {array}
	 */
	(l).keys = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array|function|defaultobject'}]),
			o, keys = [];
		for ( o in args.obj ) { keys.push(o); }
		return keys;
	};
	
	/**
	 * Returns an array containing a collections values.
	 * @param {object|array|function} obj
	 * @return {array}
	 */
	(l).values = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object|array|function|defaultobject'}]),
			o, vals = [];
		for ( o in args.obj ) { vals.push(args.obj[o]); }	
		return vals;
	};
	
	/**
	 * Returns an array of name value pairs from an object.
	 * @param {object} obj
	 * @return {array}
	 */
	(l).pairs = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object'}]),
			pairs = [];
		if ( (l).isPlainObject(args.obj) ) {
			(l).each(args.obj, function(index, value) {
				pairs.push([index, value]);
			});
		}
		return pairs;
	};
	
	/**
	 * Returns the count of properties/indices in a collection. Performs a deep count
	 * when the `deep` is true.
	 * @param {object|array} obj
	 * @param {boolean} deep
	 * @return {integer}
	 */
	(l).len = function( obj, deep, count ) {	 
		var args = (l).fn.__args([obj, deep], [{obj:'object|array'}, {deep:'bool'}]),
			count = count ? (count += (l).keys(args.obj).length) : (l).keys(args.obj).length, o;
		if ( args.deep ) {
			for ( o in args.obj ) {
				if ( (l).isPlainObject(args.obj[o]) || (l).isArray(args.obj[o]) ) { 
					return (l).len( args.obj[o], args.deep, count ); 
				}
			}
		}
		return count;
	};
	
	/**
	 * Returns the count of all values that are not falsy (null, undefined, 0, "", NaN). Performs 
	 * a deep count when `deep` is true.
	 * @param {object|array} obj
	 * @return {integer}
	 */
	(l).size = function( obj, deep, count ) {
		var args = (l).fn.__args([obj, deep], [{obj:'object|array'}, {deep:'bool'}]),
			count = count ? count : 0, o;		
		(l).each((l).values(args.obj), function(index, value) {
			if ( !(l).isFalsy(value) ) { count += 1; }
		});
		if ( args.deep ) {
			for ( o in args.obj ) {
				if ( (l).isPlainObject(args.obj[o]) || (l).isArray(args.obj[o]) ) { 
					return (l).size( args.obj[o], args.deep, count ); 
				}
			}
		}
		return count;
	};
	
	/**
	 * Return an integer representing how many levels deep a nested object is.
	 * @param {object} obj
	 * @param {string|number} key
	 * @return {integer}
	 */
	(l).howDeep = function( obj, key ) {
		var args = (l).fn.__args(arguments, [{obj:'object'}, {key:'string|number'}]),
			paths, target, o,
			paths = (l).paths(args.obj),
			objs = (l).getByType(args.obj, "*", true);
		console.log(args);
		if ( args.key ) {
			if ( args.key in paths ) { return paths[args.key].split(".").length; }
		} else {
			target = args.obj ? args.obj : (l)._object;
			for ( o in objs ) {
				if ( (l).isEqual(target, objs[o]) ) { 
					return (l).howDeep(o); 
				}
			}
		}
	};
	
	/**
	 * Returns an query string converted from an object literal. Will convert deeply nested objects
	 * and arrays. When `prefix` is provided, the prefix string is prepended to each property name.
	 * @param {object} obj
	 * @param {prefix} str
	 * @return {string}
	 */
	(l).toQueryString = function( obj, prefix ) {
		var args = (l).fn.__args([obj, prefix], [{obj:'object'}, {prefix:'string'}]),
			ret = "";
		(l).deep(args.obj, function( depth, index, value ) {
			index = index.toString();
			if ( !(l).isPlainObject(value) ) { 
				if ( (l).isArray(value) ) {
					(l).deep(value, function( arrDepth, arrIndex, arrValue ) {
						arrIndex = arrIndex.toString();
						ret += (args.prefix ? args.prefix + index + "[]" : index + "[]") + "=" + arrValue + "&";
					}, "*");
				} else {
					ret += (args.prefix ? args.prefix + index : index) + "=" + value + "&"; 
				}
			}
		}, "*");
		ret = encodeURIComponent( ret.replace(/&$/g, '') );
		return ret;
	};
	
	/**
	 * Returns an object that has been converted from a query string. When `deep` is passed will attempt
	 * to assemble all arrays.
	 * @param {object} obj
	 * @param {boolean} deep
	 * @return {object}
	 */
	(l).fromQueryString = function( obj, deep ) {
		var args = (l).fn.__args([obj, deep], [{obj:'string'}, {deep:'bool'}]),
			ret = {}, arr = [], parts;
		args.obj = decodeURIComponent(args.obj);
		(l).each( args.obj.split("&"), function(index, value) {
			parts = value.split("=");
			if ( parts[0].match(/\[\]/g) !== null ) {
				parts[0] = parts[0].replace(/\[\]/g, '');
				if ( parts[0] in ret ) { ret[ parts[0] ].push(parts[1]); } 
				else { ret[ parts[0] ] = [parts[1]]; }
			} else {
				ret[ parts[0] ] = parts[1];
			}
		});
		return ret;
	};

	/**
	 * Returns an array containing elements at `index`. When multiple values are in the `index`
	 * array values at those indices are returned.
	 * @param {array} obj
	 * @param {integer} index
	 * @return {array}
	 */
	(l).at = function( obj, index ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [index, [0,1]]}, [{obj:'array'}, {index:'array'}]), 
			i = 0, ret = [];
		if ( arguments.length === 1 ) { args.index = args.obj; args.obj = (l)._object; }
		ret = (l).filter(args.obj, function(value, index) {
			for ( i = 0; i < args.index.length; i++ ) {
				if ( args.index[i] === index ) { return true; }
			}
			return false;
		});
		return ret;
	};
		
	/**
	 * Returns an array containing the first element of an array. Passing 'n' will return
	 * the first N elements of the array.
	 * @param {array} obj
	 * @param {integer} n
	 * @return {array}
	 */
	(l).first = function( obj, n ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [n, [0,1]]}, [{obj:'array'}, {n:'number'}]),
			n = args.n ? args.n : 1, i = 0, ret = [];
		for ( ; i < n; i++ ) { ret.push(args.obj[i]); }
		return (l).fn.__chain( ret );
	};
	
	/**
	 * Returns an array containing all but the last element of an array. Passing 'n' will 
	 * return all but the last N elements of the array.
	 * @param {array} obj
	 * @param {integer} n
	 * @return {array}
	 */
	(l).initial = function( obj, n ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [n, [0,1]]}, [{obj:'array'}, {n:'number'}]),
			n = args.n ? args.obj.length - args.n : args.obj.length - 1, i = 0, ret = [];
		for ( ; i < n; i++ ) { ret.push(args.obj[i]); }
		return ret;
	};

	/**
	 * Returns an array containing the last element of an array. Passing 'n' will 
	 * return the last N elements of the array.
	 * @param {array} obj
	 * @param {integer} n
	 * @return {array}
	 */
	(l).last = function( obj, n ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [n, [0,1]]}, [{obj:'array'}, {n:'number'}]),
			n = args.n ? args.obj.length - args.n : args.obj.length - 1, i = args.obj.length, ret = [];
		for ( ; n < i; n++ ) { ret.push(args.obj[n]); }
		return ret;
	};
	
	/**
	 * Returns an array containing the rest of elements of an array after the first 
	 * element. Passing 'n' will return the rest of the elements after N as an index.
	 * @param {array} obj
	 * @param {integer} n
	 * @return {array}
	 */
	(l).rest = (l).tail = (l).drop = function( obj, n ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [n, [0,1]]}, [{obj:'array'}, {n:'number'}]),
			n = args.n ? args.n : 1, i = args.obj.length, ret = [];
		for ( ; n < i; n++ ) { ret.push(args.obj[n]); }
		return ret;
	};

	/**
	 * Returns an array with all falsy values (false, null, 0, "", undefined, and NaN) removed.
	 * @param {array} obj
	 * @return {array}
	 */
	(l).compact = function( obj ) {
		var args = (l).fn.__args({0: [obj, [0]]}, [{obj:'array'}]),
			i = 0, ret = [];
		for ( ; i < args.obj.length; i++ ) {
			if ( !(l).isFalsy(args.obj[i]) ) { ret.push(args.obj[i]); }
		}
		return ret;
	};
	
	/**
	 * Flattens a nested collection (of any depth). Passing `n` will flatten a collection to
	 * the depth specified.
	 * @param {array|object} obj
	 * @param {integer} n
	 * @return {array}
	 */
	(l).flatten = function( obj, n ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [n, [0,1]]}, [{obj:'array|object'}, {n:'number|string'}]),
			n = args.n ? args.n : "*", ret = [], type = (l).type(args.obj);
		(l).deep(args.obj, function( depth, index, elm ) {
			switch ( type ) {
				case "array" :
					if ( n === "*" ) {
						if ( !(l).isArray(elm) ) { ret.push(elm); }
					} else if ( depth > 1 ) {
						if ( !(l).isArray(elm) ) { ret.push(elm); }
					} else { ret.push(elm); }
					break;
				case "object" :
					if ( n === "*" ) {
						if ( !(l).isPlainObject(elm) ) { ret[index] = elm; }
					} else if ( depth > 1 ) {
						if ( !(l).isPlainObject(elm) ) { ret[index] = elm; }
					} else { ret[index] = elm; }					
					break;
			}
		}, n);
		return ret;
	};
	
	/**
	 * Returns an array with all instances of `values` removed.
	 * @param {array} obj
	 * @param {array} values
	 * @return {array}
	 */
	(l).without = (l).exclude = (l).subtract = function( obj, values ) {
		var args = (l).fn.__args({0: [obj, [0]], 1: [values, [0,1]]}, [{obj:'array'}, {values:'array'}]);
		return (l).filter(args.obj, function(value, index) {
			for ( var i = 0; i < args.values.length; i++ ) {
				if ( (l).isEqual(args.values[i], value) ) { return false; }
			}
			return true;
		});
	};

	/**
	 * Returns an array with duplicate-free values, using a powerful isEquals method to test for 
	 * equality. Unique values will be computed based on a transformation when an iterator function is passed.
	 * @param {array} obj
	 * @param {function} fn
	 * @param {object|function}
	 * @return {array}
	 */
	(l).uniq = (l).unique = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'array'}, {fn:'function'}, {scope:'object|function|defaultobject'}]),
			ret = [], seen = [], target;
		target = args.fn ? (l).map(args.obj, args.fn, args.scope) : args.obj;
		(l).each(target, function(index, value) {
			if ( !(l).contains(seen, value) ) {
				seen.push(value);
				ret.push(value);
			}
		});
		return ret;
	};
		
	/**
	 * Returns an array containing the computed union of passed arrays: this is an array
	 * containing only unique items in the order they are present in passed arrays.
	 * @param {*arrays}
	 * @return {array}
	 */
	(l).union = function() {
		var args = (l).fn.__args(arguments, [{'*':'arr:array'}]),
			ret, arrs = [];

		// Put passed arrays into arrs array
		(l).each(args, function(index, value) {
			if ( index !== "obj" && index !== "length" ) { arrs.push(value); }
		});
		
		// Merge the arrays and retrieve unique values
		ret = (l).uniq(Array.prototype.concat.apply(this, arrs));
		ret.shift();
		return ret;
	};
	 
	/**
	 * Returns an array containing the values that are the intersection of all passed arrays (every 
	 * value present in the result is present in the passed arrays).
	 * @param {*arrays}
	 * @return {array}
	 */
	(l).intersection = function() {
		var args = (l).fn.__args(arguments, [{'*':'arr:array'}]),
			ret, arrs = [], rest;

		// Put passed arrays into arrs array
		(l).each(args, function(index, value) {
			if ( index !== "obj" && index !== "length" ) { arrs.push(value); }
		});
		
		// Make sure target array is first element
		rest = Array.prototype.slice.call(arrs, 1);
		ret = (l).filter((l).uniq(arrs[0]), function(item) {
			return (l).every(rest, function(other) {
				return (l).indexOf(other, item) >= 0;
			});
		});
		
		return ret;
	};

	/**
	 * Returns an array containing the values from target array that are not present in other arrays.
	 * @param {*arrays}
	 * @return {array}
	 */
	(l).difference = function() {
		var args = (l).fn.__args(arguments, [{'*':'arr:array'}]), 
			arrs = [], rest;
		(l).each(args, function(index, value) { if ( index !== "obj" && index !== "length" ) { arrs.push(value); } });
		rest = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arrs, 1));
		return (l).fn.__chain( (l).filter((l).uniq(arrs[0]), function(value) {
			return !(l).exists(rest, value);
		}));
	};

	/**
	 * Returns an array containing the merged values of each passed array at the corresponding positions.
	 * @param {*arrays}
	 * @return {array}
	 */
	(l).zip = function() {
		var args = (l).fn.__args(arguments, [{'*':'arr:array'}]),
			i = 0, arrs = [], ret = [];
		(l).each(args, function(index, value) { if ( index !== "obj" && index !== "length" ) { arrs.push(value); } });
		for ( ; i < arrs.length; i++ ) { ret[i] = (l).pluck(arrs, "" + i); }
		return ret;
	};

	/**
	 * Returns an array containing numbers in a range. 
	 * @param {number} start
	 * @param {number} stop
	 * @param {number} step
	 * @return {array}
	 */
	(l).range = function( start, stop, step ) {
		var args = (l).fn.__args({0: [start, [0]], 1:[stop, [0,1]], 2:[step, [1,2]]}, [{start:'number'}, {stop:'number'}, {step:'number'}]),
		i = 0, ret = [];
		if ( arguments.length === 1 ) {
			args.stop = args.start || 0;
			args.start = 0;
		}
		if ( arguments.length < 3 ) { args.step = 1; }
		len = Math.max(Math.ceil((args.stop - args.start) / args.step), 0);
		while ( i < len ) {
			ret[ i++ ] = args.start;
			args.start += args.step;
		}
		return ret;
	};
	
	/** 
	 * Returns an array created from an object. When multiple arguments are passed creates
	 * an array containing values passed as arguments. 
	 * @param {object} obj
	 * @return {array}
	 */
	(l).array = (l).toArray = function( obj ) {
		var args = (l).fn.__args([obj], [{obj:'object'}]), i = 0, ret = [];
		if ( arguments.length > 1 ) {
			for ( ; i < arguments.length; i++ ) { 
				(l).each(arguments[i], function(index, value) { ret.push(value); });
			}
		} else {
			(l).each(args.obj, function(index, value) { ret.push(value); });
		}
		return ret;
	};
	
	/** 
	 * Returns an object created from passed array(s). When two arrays are passed the first is used
	 * for the objects keys and the second its values. When more than two arrays are passed each array
	 * should contain one key and one value. Additionally passing an even number of arguments will result
	 * in all odd arguments being used as keys and all even arguments as values.
	 * @param {*arrays}
	 * @return {object}
	 */
	(l).object = (l).toObject = function() {
		var args = (l).fn.__args(arguments, [{'*':'arr:array'}]),
			arrs = [], keys = [], ret = {}, i = 0;
		(l).each(args, function(index, value) { 
			if ( (l).isArray(value) ) { arrs.push(value); }
		});
		if ( arrs.length === 2 ) {
			keys = arrs[1];
			(l).each(arrs[0], function(index, value) { 
				ret[ value ] = keys[index]; 
			});			
		} else if ( arrs.length > 2 ) {
			for ( ; i < arrs.length; i++ ) { 
				ret[ arrs[i][0] ] = arrs[i][1]; 
			}
		} else {
			for ( ; i < arguments.length; i+=2 ) { 
				ret[ arguments[i] ] = arguments[i+1]; 
			}
		}
		return ret;
	};
				
	/**
	 * Returns the index at which a value can be found in the array or -1 if the value is
	 * not in the array.
	 * @param {array} obj
	 * @param {...*} value
	 * @return {integer}
	 */
	(l).indexOf = function( obj, value ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[value, [0,1]]}, [{obj:'*'}, {value:'*'}]),
			ret, o;
		
		// Refactor arguments object 
		if ( arguments.length === 1 ) {
			args.value = args.obj;
			args.obj = (l)._global || {};
		}

		// Find index if exists
		for ( o in args.obj ) {
			if ( (l).isEqual(args.value, args.obj[o]) ) {
				ret = o;
			}
		}
		return ret || -1;
	};
	
	/**
	 * Returns the index of the last occurence of a value in an array or -1 if the value is
	 * not in the array. Passing `from` will start search from the end of the array minus
	 * the value of `from`.
	 * @param {array} obj
	 * @param {...*} value
	 * @param {integer} from
	 * @return {integer}
	 */
	(l).lastIndexOf = function( obj, value, from, first ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[value, [0,1]], 2:[from, [1,2]], 3:[first, [1,2,3]]}, [{obj:'array'}, {value:'*'}, {from:'number'}, {first:'bool'}]),
			i, ret;

		// Refactor arguments object 
		if ( arguments.length === 1 && (l)._global ) {
			args.value = arguments[0];
			args.obj = (l)._global;
		}
		
		if ( args.first ) {
			i = args.from || 0;
			for ( ; i < args.obj.length; i++ ) {
				if ( (l).isEqual(args.obj[i], args.value) ) { return i; }
			}
		} else {
			i = (args.obj.length - args.from) || args.obj.length;
			while ( i-- ) {
				if ( (l).isEqual(args.obj[i], args.value) ) { return i; }
			} 
		}
		return -1;
	};
	
	/**
	 * Returns the index of the first occurence of a value in an array or -1 if the value is
	 * not in the array. Passing `from` will start search after provided index.
	 * @param {array} obj
	 * @param {...*} value
	 * @param {integer} from
	 * @return {integer}
	 */
	(l).firstIndexOf = function( obj, value, from ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[value, [0,1]], 2:[from, [1,2]]}, [{obj:'array'}, {value:'*'}, {from:'number'}]);
		return (l).lastIndexOf.call(this, args.obj, args.value, args.from, true);
	};
	
	/**
	 * Returns a sorted array with values that have been ranked in ascending order as a reuslt
	 * of running an iterator over a collection. Borrows from underscore.js.
	 * @param {array} obj
	 * @param {function} fn
	 * @param {object|function} scope
	 */
	(l).sortBy = function( obj, fn, scope ) {
		var args = (l).fn.__args({0: [obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]]}, [{obj:'array'}, {fn:'function'}, {scope:'object|function|defaultobject'}]);
		return (l).pluck( (l).map(args.obj, function(value, index, list) {
			return {
				value : value,
				index : index,
				criteria : args.fn.call(args.scope, value, index, list) 
			};
		}).sort(function(left, right) {
			var args = (l).fn.__args(arguments, [{left:'*'}, {right:'*'}]);
			var a = left.criteria;
			var b = right.criteria;
			if ( a !== b ) {
				if ( a > b || a === void 0 ) { return 1; }
				if ( a < b || b === void 0 ) { return -1; }
			}
			return left.index < right.index ? -1 : 1;
		}), 'value');		
	};

	/**
	 * Returns the modified target array with `n` elements removed from the begenning. When `n` isn't
	 * passed 1 element is removed from the begenning of the array.
	 * @param {array} obj
	 * @return {array}
	 */
	(l).shift = function( obj, n ) {
		var args = (l).fn.__args([obj, n], [{obj:'object|array'}, {n:'number'}]),
			ret = (l).isPlainObject(args.obj) ? (l).toArray(args.obj) : args.obj, i;
		for ( i = args.n || 1; i > 0;  i-- ) { ret.shift(); }
		return ret;
	};
	
	/**
	 * Returns the modified target array with `n` elements removed from the end. When `n` isn't
	 * passed 1 element is removed from the end of the array.
	 * @param {array} obj
	 * @return {array}
	 */
	(l).pop = function( obj, n ) {
		var args = (l).fn.__args([obj, n], [{obj:'object|array'}, {n:'number'}]),
			ret = (l).isPlainObject(args.obj) ? (l).toArray(args.obj) : args.obj, i;
		for ( i = args.n || 1; i > 0;  i-- ) { ret.pop(); }
		return ret;
	};
	
	/**
	 * Returns a function that will execute after `n` calls.
	 * @param {function} fn
	 * @param {integer} n
	 * @param {boolean} start
	 * @return {function}
	 */
	(l).after = function( fn, n, start ) {
		var args = (l).fn.__args([fn, n], [{fn:'function'}, {n:'number'}]);
		args.fn.n = args.fn.after = args.n;
		return function() {
			if ( args.fn.n > 1 ) { args.fn.n--; } 
			else {
				args.fn.apply(this, arguments);
				args.fn.n = args.fn.after;
			}
		};
	};
	
	/**
	 * Returns a function that can only be called one time.
	 * @param {function} fn
	 * @return {function}
	 */
	(l).once = function( fn ) {
		var args = (l).fn.__args([fn], [{fn:'function'}]);
		args.fn.n = args.fn.once = 1;
		return function() {
			if ( args.fn.n ) {
				args.fn.n--;
				return args.fn.apply(this, arguments);
			}
		};
	};
	
	/**
	 * Returns a function that will execute `n` times.
	 * @param {function} fn
	 * @param {integer} n
	 * @return {function}
	 */
	(l).times = function( fn, n ) {
		var args = (l).fn.__args([fn, n], [{fn:'function'}, {n:'number'}]);
		args.fn.n = args.n;
		return function() {
			for ( var i = 0; i < args.fn.n; i++ ) { args.fn.apply(this, arguments); }
		};
	};
	
	/**
	 * Returns a function that has been wrapped in the `wrapper` function. The function that is 
	 * wrapped is passed as the first argument to `wrapper`. This provides a mechanism for running
	 * code beofre and/or after `fn` runs.
	 * @param {function} fn
	 * @param {function} wrapper
	 * @return {function}
	 */
	(l).wrap = function( fn, wrapper ) {
		var args = (l).fn.__args({0: [fn, [0]], 1:[wrapper, [1]]}, [{fn:'function'}, {wrapper:'function'}]);
		return function() {
			var fargs = [args.fn];
			fargs.push.apply(fargs, arguments);
			return args.wrapper.apply(this, fargs);
		};
	};
	
	/**
	 * Returns a function that is the composition of passed functions. The returned value from a
	 * function is given as the first argument of the next function in a list.
	 * @param {functions*} Functions to compose
	 * @return {function}
	 */
	(l).compose = function() {
		var args = fns = (l).fn.__args(arguments, [{'*':'fns:function'}], true);
		return function() {
			var args = arguments;
			for ( var i = fns.length - 1; i >= 0; i-- ) { args = [fns[i].apply(this, args)]; }
			return args[0];
		};
	},
	
	/**
	 * Returns a function that is bound to the context of `scope` when called. Currying of
	 * an unlimited number of arguments is achieved by passing `fargs` as an array of arguments
	 * to be passed to the target function. When target function is passed additional arguments
	 * when the function is called they are added to the end of the curried arguments.
	 * @param {function} fn
	 * @param {object|function} scope
	 * @param {array} fargs
	 * @return {function}
	 */
	(l).bind = function( fn, scope, fargs ) {
		var args = (l).fn.__args({0:[obj, [0]], 1:[fn, [0,1]], 2:[scope, [1,2]], 3:[fargs, [2,3]]}, [{obj:'object'}, {fn:'*'}, {scope:'object|function|defaultobject'}, {fargs:'array'}], 0);
		if ( !args.fargs ) { args.fargs = []; }
		return function() {
			for ( var i = 0; i < arguments.length; i++ ) { args.fargs.push(arguments[i]); }
			return args.fn.apply(args.scope, args.fargs);
		};
	};
	
	/**
	 * Binds one or more methods to an object of which are specified in `methods` which are
	 * executed in the context of the target object when invoked. When `methods` is not passed 
	 * all of the target object's function properties will be bound.
	 * @param {object|function} obj
	 * @param {array} methods
	 * @return {object}
	 */
	(l).bindAll = function( obj, methods ) {
		var args = (l).fn.__args({0:[obj, [0]], 1:[methods, [0,1]]}, [{obj:'object'}, {methods:'array|object'}]);
		if ( args.length === 1 && args.obj ) {
			(l).each(args.obj, function(f) { 
				if ( (l).isFunction(args.obj[f]) ) { args.obj[f] = (l).bind(args.obj[f], args.obj); }
			});
		} else if ( args.length === 2 ) {
			(l).each(args.methods, function(f) { args.obj[f] = (l).bind(args.obj[f], args.obj); });			
		}
		return args.obj;
	};
	
	/**
	 * Returns a function that has been partially applied by currying its arguments without changing 
	 * the execution context (the dynamic `this` value).
	 * @param {function} fn
	 * @param {...*} fargs
	 * @return {function}
	 */
	(l).fill = (l).partial = function( fn, fargs ) {
		var args = (l).fn.__args([fn, fargs], [{fn:'function'}, {fargs:'array'}], null);
		return function() {
			for ( var i = 0; i < arguments.length; i++ ) { args.fargs.push(arguments[i]); }
			return args.fn.apply(this, args.fargs);
		};
	},
	
	/**
	 * Returns a memoized function that caches the functions returned results. When passed a 
	 * hash function through `hash` will use to determine the key, based on passed arguments
	 * to the original function. 
	 * @param {function} fn
	 * @param {function} hash
	 * @return {function}
	 */
	(l).memoize = function( fn, hash ) {
		var args = (l).fn.__args({0:[fn, [0]], 1:[hash, [1]]}, [{fn:'function'}, {hash:'function'}], 0),
			memo = {};
		args.hash || (args.hash = (l).identity);
		return function() {
			var key = args.hash.apply(this, arguments);
			return (l).has(memo, key) ? memo[key] : (memo[key] = args.fn.apply(this, arguments));
		};
	};
	
	/**
	 * Returns a function that executes after `ms` millaseconds when invoked. Passes `fargs` 
	 * array as supplied arguments to `fn`.
	 * @param {function} fn
	 * @param {integer} ms
	 * @param {array} fargs
	 * @return {function}
	 */
	(l).delay = function( fn, ms, fargs ) {
		var args = (l).fn.__args([fn, ms, fargs], [{fn:'function'}, {ms:'number'}, {fargs:'array'}], null);
		return function() {
			setTimeout(function() { return args.fn.apply(null, args.fargs); }, args.ms);
		}
	};
	
	/**
	 * Returns a function that defers invoking `fn` until the current call stack has cleared. This
	 * is similar to using the setTimeout function with no delay. Arguments passed through `fargs` 
	 * are passed to `fn`. This method is useful for performing computationaly expensive operations
	 * that may block the browser UI thread from rendering.
	 * @param {function} fn
	 * @param {array} fargs
	 * @return {function}
	 */
	(l).defer = function( fn, fargs ) {
		var args = (l).fn.__args([fn, fargs], [{fn:'function'}, {fargs:'array'}], null );
		return (l).delay.call((l), args.fn, 1, args.fargs);
	};
	
	/**
	 * Returns a throttled version of `fn` that can only be invoked every `ms` milaseconds. This is
	 * useful when a function is being called repeatedly where limiting the rate of its invocation
	 * is a factor. This method borrows heavily from underscore.js.
	 * @param {function} fn
	 * @param {number} ms
	 * @return {function} 
	 */	
	(l).throttle = function( fn, ms ) {
		var args = (l).fn.__args([fn, ms], [{fn:'function'}, {ms:'number'}], 0),
			scope, last, timeout, fargs, res, later;
		later = function() {
			last = new Date;
			timeout = null;
			ret = args.fn.apply(scope, fargs);
		};
		return function() {
			var now = new Date();
			var left = args.ms - (now - last);
			scope = this;
			fargs = arguments;
			if ( left <= 0 ) {
				clearTimeout(timeout);
				timeout = null;
				last = now;
				res = args.fn.apply(scope, fargs);
			} else if ( !timeout ) {
				timeout = setTimeout(later, left);
			}
			return res;
		}	
	};
	
	/**
	 * Returns a function that while it is being invoked will not execute until it hasn't been
	 * called for `n` milaseconds. When `start` is passed `fn` is triggered on the leading vs.
	 * the trailing edge of the interval. Borrows heavily from underscore.js.
	 * @param {function} fn
	 * @param {integer} n
	 * @param {boolean} start
	 * @return {function}
	 */
	(l).debounce = function( fn, n, start ) {
		var args = (l).fn.__args([fn, n, start], [{fn:'function'}, {n:'number'}, {start:'bool'}]),
			res, timeout;
		return function() {
			var scope = this, fargs = arguments;
			var next = function() {
				timeout = null;
				if ( !args.start ) { result = args.fn.apply(scope, fargs); }
			};
			var call = args.start && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(next, args.n);
			if ( call ) { res = args.fn.apply(scope, fargs); }
			return res;
		};
	};
	
	/**
	 * Returns a targeted object "wrapped" as a property of the library. Calling other 
	 * chainable methods will continue to return wrapped objects until the end method 
	 * is called OR a any method that breaks the chain by design.
	 * @param {object} obj
	 * @param {string|number} key
	 * @return {object}
	 */
	(l).chain = function( obj, key ) {
		(l)._chain = true;
		return (l).fn.__init.call((l), obj, key);
	};
	
	/**
	 * Breaks chaining mode and returns the targeted object
	 * @return {object}
	 */
	(l).end = (l).value = function( obj ) {
		(l)._chain = false;
		return (l)._global;
	};
	
	/**
	 * Return `value`. If `value` is a function invoke it and return its value.
	 * @param {...*} value
	 * @return {...*}
	 */
	(l).result = function( value ) {
		var args = (l).fn.__args([value], [{value:'*'}]);
		return (l).isFunction(args.value) ? args.value() : value;
	};
	
	/**
	 * Relinquish control of the library global to its previous owner and return a reference
	 * to the boiler.js object.
	 * @return {object}
	 */
	(l).noConflict = function() {
		root[l] = previousLib;
		return this;
	};
	
	/**
	 * Used as the default iterator function when none is provided for methods that require one.
	 * @param {...*} value
	 * @return {...*}
	 */
	(l).identity = function( value ) {
		return value;
	};
	
	/**
	 * Extends specified JavaScript array methods onto the library.
	 * @return {function}
	 */
	(l).each(['sort'],			 
		function(index, name) {
			if ( Array.prototype[name] ) {
				(l)[name] = !(l)[name] ? Array.prototype[name] : (l)[name]; 
			}
	});
	
})();