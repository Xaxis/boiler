var types = {
  argument:     [(function(){ return arguments; })()],
  array:        [[1,2,3]],
  bool:         [false, true],
  date:         [new Date()],
  element:      [document.createElement('a')],
  finite:       [Infinity, -Infinity],
  function:     [function(){}],
  nan:          [NaN],
  null:         [null],
  number:       [0,1,1.22,-1.33],
  object:       [window, Math],
  plainobject:  [{one: 1, two: 2}],
  regexp:       [/(.)/],
  string:       ['Great White Shark'],
  undefined:    [undefined]
};
var noFalsyTypes = {
  argument:     [(function(){ return arguments; })()],
  array:        [[1,2,3]],
  bool:         [true],
  date:         [new Date()],
  element:      [document.createElement('a')],
  finite:       [Infinity, -Infinity],
  function:     [function(){}],
  number:       [1,1.22,-1.33],
  object:       [window, Math],
  plainobject:  [{one: 1, two: 2}],
  regexp:       [/(.)/],
  string:       ['Great White Shark'],
};
var obj = {
  A: {
    a_1: [1,2],
    a_2: [],
    a_3: {
      a_3_1: [1,2],
      a_3_2: function(){return 'a_3_2'},
      a_3_3: NaN,
      a_3_4: null,
      a_3_5: 99,
      a_3_6: Math,
      a_3_7: 'blue',
      a_3_8: undefined,
      a_3_9: /(.)/g
    },
    a_4: false,
    a_5: true,
    a_6: {
      a_6_1: true,
      a_6_2: function(){return'a_6_2';},
      a_6_3: new Date(),
      a_6_4: document.createElement('a')
    },
    a_7: function(){return'a_7'},
    a_8: new Date(),
    a_9: document.createElement('a'),
    a_10: NaN,
    a_11: null,
    a_12: 99,
    a_13: Math,
    a_14: 'blue',
    a_15: undefined,
    a_16: /(.)/g
  },
  B: [1,2,3],
  C: false,
  D: function(){return 'D'},
  E: new Date(),
  F: document.createElement('a'),
  G: NaN,
  H: null,
  I: 99,
  J: Math,
  K: 'red',
  L: undefined,
  M: /(.)/g
};

// ARRAY METHODS
test("at", function() {
  deepEqual(_.at([1,2,3], 1), [2], 'returns array with value at single index when `index` is passed as number');

  deepEqual(_.at([1,2,3], [0,1]), [1,2], 'returns array with values at indices when `index` is passed as as an array of indices');

  deepEqual(_.at([1,2,3,[4,5,6]], [0,1], true), [1,2,4,5], 'deeply returns array with values at indices when `index` is passed as as an array of indices');

  deepEqual(_.at([1,2,[3]], 0, true), [1,3], 'deeply returns array with values at single index when `index` is passed as number');

  deepEqual(_.at([1,2,[3,[4,5,[6,7]]]], 0, 2), [1,3], 'deeply returns array with values at single index when `index` is passed as number');
});

test("compact", function() {
  deepEqual(_.compact([0,  null,  undefined,  '',  NaN,  false, {},  [],  'Red']), [{},[],'Red'], 'returns array with all "falsy" values removed');

  deepEqual(_.compact([0,  null,  undefined,  '',  NaN,  false, {},  [],  'Red'], true), ['Red'], 'returns array with all "falsy" values and empty arrays and object literals removed');

  deepEqual(_.compact([0,1,false,[2,[],3,{}]], true, true), [1, [2, [], 3, {}], 2, 3], 'deeply returns array with all "falsy" values and empty arrays and object literals removed');

  deepEqual(_.compact([0,1,false,[2,[],3,{}]], false, true), [1, [2, [], 3, {}], 2, [], 3, {}], 'deeply returns array with all "falsy" values removed');

  deepEqual(_.compact([0,1,false,[2,[],3,{}]], true, 1), [1, [2, [], 3, {}]], 'deeply returns array with all "falsy" values removed to specified depth');
});

test("difference", function() {
  deepEqual(_.difference(['Red',  'Green',  'Blue'], ['Red',  'Green']), ['Blue'], 'returns array containing the difference of values between target array and comparison array(s)');

  deepEqual(_.difference([1,2,3], [2,3,4], [3,4,5]), [1], 'returns array containing the difference of values between target array and comparison array(s)');

  deepEqual(_.difference([1,2,3,[6]], [2,3,4], [3,4,5], true), [1, 6], 'returns array containing the difference of values between target array (with nested values) and comparison array(s)');

  deepEqual(_.difference([1,2,3,[6,[7]]], [2,3,4], [3,4,5], 1), [1, [6, [7]]], 'returns array containing the difference of values between target array (with nested values to specified depth) and comparison array(s)');
});

test("first", function() {
  deepEqual(_.first([1,2,3]), [1], 'returns array containing first value from target array');

  deepEqual(_.first([1,2,3], 2), [1,2], 'returns array containing first `n` values from target array');

  deepEqual(_.first([1,2,3], 2), [1,2], 'returns array containing first `n` values from target array and nested arrays');

  deepEqual(_.first([1,2,3,[4,5,6,[7,8,9]]], 1, true), [1,4,7], 'returns array containing first `n` values from target array and nested arrays to specified depth');
});

test("indexOf", function() {
  deepEqual(_.indexOf([1,2,3], 2), 1, 'returns the index of the first value encountered that matches `value`');

  deepEqual(_.indexOf([1,2,3,1,2,3], 2, 3), 4, 'returns the index of the first value encountered that matches `value` starting after `from`');

  deepEqual(_.indexOf([1,2,[3]], 3, true), '2.0', 'returns the namespace path of the first nested value encountered that matches `value`');
});

test("initial", function() {
  deepEqual(_.initial([1,2,3]), [1,2], 'returns all but the last value in array');

  deepEqual(_.initial([1,2,3], 2), [1], 'returns all but the last `n` values in array');

  deepEqual(_.initial([1,2,3,[4,5,6]], 2, true), [1,2,4], 'deeply returns all but the last `n` values in array');
});

test("intersection", function() {
  deepEqual(_.intersection([1,2,3,4], [1,2,101,102]), [1,2], 'returns an array containing intersected values');

  deepEqual(_.intersection([7,8,9], [9,10,11]), [9], 'returns an array containing intersected values');

  deepEqual(_.intersection([7,8,9], [[9],10,11], true), [9], 'returns an array containing intersected values inclusive of nested arrays');
});

test("last", function() {
  deepEqual(_.last([1,2,3]), [3], 'returns an array containing the last value in target array');

  deepEqual(_.last([1,2,3], 2), [2,3], 'returns an array containing the last `n` values in target array');

  deepEqual(_.last([1,2,3,[4,5,6]], 2, true), [2,3,5,6], 'returns an array containing the last `n` values in target array');
});

test("lastIndexOf", function() {
  deepEqual(_.lastIndexOf([1,2,3,1,2,3], 3), 5, 'returns the last index in array where target value exists');

  deepEqual(_.lastIndexOf(['GM', 'Ford', 'GM', 'Suburu', 'Honda'], 'GM', 2), 2, 'returns the last index in array where target value exists starting from `n` element from end of array');

  deepEqual(_.lastIndexOf(['GM', 'Ford', ['GM', 'Suburu', 'Honda']], 'GM', 2, true), "2.0", 'returns the last index in array where target value exists starting from `n` element from end of array');
});

test("object", function() {
  deepEqual(_.object(['one',1,'two',2,'three',3]),{one:1,two:2,three:3}, 'successfully created object-literal from one array, where odd elements represent keys and even represent values');

  deepEqual(_.object(['one','two','three'], [1,2,3]),{one:1,two:2,three:3}, 'successfully created object-literal from two arrays, the first containing keys and the second containing values');

  deepEqual(_.object(['one',1],['two',2],['three',3]),{one:1,two:2,three:3}, 'successfully created object-literal from multiple arrays, where first element in each array represents a key and the second element a value');

  deepEqual(_.toObject(['one',1,'two',2,'three',3]),{one:1,two:2,three:3}, 'successfully aliased with _.toObject');
});

test("rest", function() {
  deepEqual(_.rest([1,2,3]), [2,3], 'return array containing all elements after the first element of target array');

  deepEqual(_.rest([1,2,3]), [2,3], 'return array containing all elements after the first element of target array');

  deepEqual(_.rest([1,2,3], 2), [3], 'return array containing all elements after the nth element of target array');

  deepEqual(_.tail([1,2,3], 2), [3], 'successfully aliased with _.tail');

  deepEqual(_.rest([1,2, [3,4,5]], 1, true), [2, 4, 5], 'deeply return array containing all elements after the nth element of target array');
});

test("union", function() {
  deepEqual(_.union([1,2,3], [2,3,4], [3,4,5]), [1,2,3,4,5], 'returns array containing the union of values from passed arrays');
});

test("uniq", function() {
  deepEqual(_.uniq([1,2,3,4,5,6,1,2,3]), [1,2,3,4,5,6], 'returns non-duplicate simple values from target array');

  deepEqual(_.uniq([[1,2,3],[4,5,6],[1,2,3], [4,5,6]]), [[1,2,3], [4,5,6]], 'returns non-duplicate complex values from target array');

  deepEqual(_.uniq([1,2,3,3], function (n) {return n * 2;}), [2,4,6], 'returns non-duplicate complex values computed from an iterator function');

  deepEqual(_.uniq([1,2,3,3], function (n) {return n * this.x;}, {x: 3}), [3,6,9], 'returns non-duplicate complex values computed from an iterator function bound to an object scope');

  deepEqual(_.uniq([1,1,2,2,[3,3,4,4]], true), [1,2,3,4], 'deeply returns non-duplicate simple values from target array');
});

test("without", function() {
  deepEqual(_.without([1,2,3,4], [3,4]), [1,2], 'returns array containing all values but those in the `values` array');

  deepEqual(_.without([[1],[2],[3],[4]], [[3],[4]]), [[1],[2]], 'returns array containing all complex values but those in the `values` array');

  deepEqual(_.without([1,2,3,4], [3,[4]], true), [1,2], 'deeply returns array containing all values but those in the `values` array');

  deepEqual(_.without([1,2,3,4], [3,[4]], true), [1,2], 'successfully aliased with _.exclude');
});

test("zip", function() {
  deepEqual(_.zip(['Red','Blue'], ['#F00','#00F']), [["Red","#F00"], ["Blue","#00F"]], 'returns array zipped from multiple arrays');
});

// COLLECTIONS
test("add", function() {
  deepEqual(_.add([1,2,3], 3, 4), [1,2,3,4], 'successfully added value to array at index');

  deepEqual(_.add({0:1,1:2,2:3}, 3, 4), {0:1,1:2,2:3,3:4}, 'successfully added value to object-literal at index');

  deepEqual(_.add([1,2,3], 2, 4), [1,2,3], 'did not add value to array at existing index');

  deepEqual(_.add([1,2,[]], 0, 3, true), [1,2,[3]], 'deeply added value at index');

  deepEqual(_.add({0:1,1:2,2:3, 4:{}}, 3, 4, true), {0:1,1:2,2:3,3:4, 4:{3:4}}, 'successfully deeply added value to object-literal at index');
});

test("all", function() {
  equal(_.all([1,2,3], function(n){return _.isNumber(n);}), true, 'all members of array passed the test in iterator');

  equal(_.all({0:1,1:1}, function(n){return _.isNumber(n);}), true, 'all members of object-literal passed the test in iterator');

  equal(_.all([1,2,3], function(n){return _.isNumber(n * this.x);}, {x:2}), true, 'all members passed the test in iterator when bound to `scope`');

  equal(_.every([1,2,3], function(n){return _.isNumber(n);}), true, 'successfully aliased with _.every');

  equal(_.all([1,2,3,[4,5,6]], function(n){return _.isNumber(n);}, true), true, 'all members (including deep members) in array passed the test in iterator');

  equal(_.all({0:1,1:{0:1,1:2}}, function(n){return _.isNumber(n);}, true), true, 'all members (including deep members) in object-literal passed the test in iterator');
});

test("any", function() {
  equal(_.any([1,2,3], function(n){return _.isNumber(n);}), true, 'any member of array passed the test in iterator');

  equal(_.any({0:1,1:1}, function(n){return _.isNumber(n);}), true, 'any member of object-literal passed the test in iterator');

  equal(_.any([1,2,3], function(n){return _.isNumber(n * this.x);}, {x:2}), true, 'any member passed the test in iterator when bound to `scope`');

  equal(_.some([1,2,3], function(n){return _.isNumber(n);}), true, 'successfully aliased with _.some');

  equal(_.any([1,2,3,[4,5,6]], function(n){return _.isNumber(n);}, true), true, 'any member (including deep members) in array passed the test in iterator');

  equal(_.any({0:1,1:{0:1,1:2}}, function(n){return _.isNumber(n);}, true), true, 'any member (including deep members) in object-literal passed the test in iterator');
});

test("average", function() {
  equal(_.average([1,2,3]), 2, 'the average of an array of values was computed');

  equal(_.average({0:1,1:2,2:3}), 2, 'the average of an object-literal\'s values was computed');

  equal(_.average([1,2,[3]], true), 2, 'the average value of an array with deep members was computed');
});

test("clear", function() {
  deepEqual(_.clear([1,2]), [], 'an array of values was cleared');

  deepEqual(_.clear({0:1,1:2}), {}, 'an object-literal\'s values were cleared');
});

test("clone", function() {
  deepEqual(_.clone([1,2,[3]]), [1,2,[3]], 'an array was cloned');

  deepEqual(_.clone({0:1,1:2}), {0:1,1:2}, 'an object-literal was cloned');

  var arr = [1,2,[3]];
  var arr2 = _.clone(arr, true);
  arr[2][0] = 4;
  deepEqual(_.clone(arr2, true), [1,2,[3]], 'an array deeply was cloned');
});

test("contains", function() {
  deepEqual(_.contains([1,2], 2), true, 'found simple value in array');

  deepEqual(_.contains({0:1,1:2}, 2), true, 'found simple value in object-literal');

  deepEqual(_.contains({0:1,1:[2]}, [2]), true, 'found complex value in object-literal');

  deepEqual(_.inArray({0:1,1:2}, 2), true, 'successfully aliased with _.inArray');

  deepEqual(_.contains({0:1,1:[2]}, 2, true), true, 'successfully deeply found value in array');
});

test("count", function() {
  equal(_.count([1,2,3], function(n){return _.isNumber(n);}), 3, 'successfully counted values in array that passed iterator\'s test');

  equal(_.count({0:1,1:2}, function(n){return _.isNumber(n);}), 2, 'successfully counted values in object-literal that passed iterator\'s test');

  equal(_.count([1,2,3], function(n){return _.isNumber(n + this.x);}, {x: 2}), 3, 'successfully counted values in array that passed iterator\'s test and are bound to `scope`');

  equal(_.count([1,2,[3]], function(n){return _.isNumber(n);}, true), 3, 'successfully counted values (including nested members) in array that passed iterator\'s test');
});

test("countBy", function() {
  deepEqual(_.countBy([1.3,  1.5,  2.2,  2.9], function (n){ return Math.floor(n); }), {1:2, 2:2}, 'successfully counted an array of values');

  deepEqual(_.countBy({0:"Red",1:"Red",2:"Blue"}, function (c){ return c; }), {"Blue":1, "Red":2}, 'successfully counted an object-literal\'s values');

  deepEqual(_.countBy({0:"Red",1:"Red",2:"Blue"}, function (c){ return c + this.x; }, {x:" is a Color!"}), {"Red is a Color!":2, "Blue is a Color!":1}, 'successfully counted an object-literal\'s values while bound to `scope`');
});

test("deep", function() {

  _.deep([1,2,3], function(d, i, v, r) {
    equal(v, parseInt(i) + 1, '[1,2,3] each iteration provided index and value from array');
  });

  _.deep([1,2,[3,[4]]], function(d, i, v, r) {
    equal(v, v, '[1,2,[3,[4]]] each iteration provided index and value from array while going deep');
  });

  var last = 0;
  _.deep([1,2,[3,[4]]], function(d, i, v, r) { last = v; }, 2);
  deepEqual(last, [4], 'iterated to a specified depth in an array');

  var arr = [1,2];
  _.deep([1,2], function(d, i, v, r) {
    deepEqual(arr, r, 'each iteration has a reference to the target collection');
  });

  _.deep({0:1, 1:2}, function(d, i, v, r) {
    equal(v, parseInt(i) + 1, '{0:1, 1:2} each iteration provided index and value from object-literal');
  });

  last = 0;
  _.deep({0: {color:'Red'}, 1: [1,2,3]}, function(d, i, v, r) {
    last = v;
  }, true);
  deepEqual(last, [1,2,3], 'did not iterate through arrays when `noArrays` was passed');

  last = 0;
  _.deep({obj:{0: [1,2,3], 1: {color:'Red'}}, fn:function(d, i, v, r) {
    last = v;
  }, noArrays: false, noObjects: true});
  deepEqual(last, {color:'Red'}, 'did not iterate through object-literals when `noObjects` was passed');

  var args = ['test'];
  _.deep({obj: [1,2], fn: function(d,i,v,r,a) {
    equal("test", a, 'successfully passed arguments to iterator')
  }, args: args});
});

test("each", function() {
  _.each([1, 2, 3], function(i,v) {
    equal(v, i + 1, 'each iteration provided index and value from array');
  });

  var answers = [];
  _.each([1, 2, 3], function(i,v){ answers.push(v * this.multiplier);}, {multiplier : 5});
  equal(answers.join(', '), '5, 10, 15', 'scope object property accessed');

  answers = false;
  _.each([1, 2, 3], function(i,v,arr) { if (_.contains(arr, v)) answers = true; });
  equal(true, answers, 'original collection can be referenced from within the iterator');

  answers = [];
  _.forEach([1, 2, 3], function(i,v){ answers.push(v); });
  equal(answers.join(', '), '1, 2, 3', 'can be aliased with _.forEach"');
});

test("empty", function() {
  deepEqual(_.empty([1,2]), [undefined, undefined], 'successfully emptied an array');

  deepEqual(_.empty({0:1,1:2}), {0:undefined, 1:undefined}, 'successfully emptied an object-literal');

  deepEqual(_.empty([1,[2]], true), [undefined, [undefined]], 'successfully emptied an array with nested arrays');

  deepEqual(_.empty([1,{0:2}], true), [undefined, {0: undefined}], 'successfully emptied an array with nested object-literals');

  deepEqual(_.empty({0: 1, 1: [2]}, true), {0: undefined, 1: [undefined]}, 'successfully emptied an object-literal with nested arrays');

  deepEqual(_.empty({0: 1, 1: {0: 2}}, true), {0: undefined, 1: {0: undefined}}, 'successfully emptied an object-literal with nested object-literals');
});

test("filter", function() {
  deepEqual(_.filter([1,2], function(n) {return n >=2;}), [2], 'successfully filtered an array with condition');

  deepEqual(_.filter({0:1,1:2}, function(n) {return n >=2;}), [2], 'successfully filtered an object-literal with condition');

  deepEqual(_.filter([1,2], function(n) {return n == this.x;}, {x:2}), [2], 'successfully filtered an array while applying a scope');
});

test("find", function() {
  equal(_.find([1,2], function(n) {return n === 2;}), 2, 'successfully found a value in an array');

  equal(_.find({0:1,1:2}, function(n) {return n === 2;}), 2, 'successfully found a value in an object-literal');

  equal(_.find([1,2], function(n) {return n === this.x;}, {x:2}), 2, 'successfully found a value in an array while bound to scope');

  equal(_.find([1,{0: 2}], function(n) {return n === 2;}, true), 2, 'successfully deeply found a value in an array');
});

test("findKey", function() {
  equal(_.findKey([1,2], function(k) {return k == 1;}), 2, 'successfully found a value in an array located at key');

  equal(_.findKey({0:1,1:2}, function(k) {return k == 1;}), 2, 'successfully found a value in an object-literal located at key');

  equal(_.findKey([1,2], function(k) {return k == this.x;}, {x:1}), 2, 'successfully found a value in an array located at key while bound to scope');

  equal(_.findKey([1,[2,3,4]], function(k) {return k == 2;}, true), 4, 'successfully deeply found a value in an array located at key');
});

test("flatten", function() {
  deepEqual(_.flatten([1,[2]]), [1,2], 'successfully flattened an array');

  deepEqual(_.flatten({0:1,1:{1:2}}), [1,2], 'successfully flattened an object-literal');

  deepEqual(_.flatten({0:1,1:[2]}), [1,2], 'successfully flattened an object-literal with nested arrays');

  deepEqual(_.flatten([1,[2,{0:3}]]), [1,2,3], 'successfully flattened an array with nested object-literal');

  deepEqual(_.flatten({0:1,1:2, 2:[3,[4]]}, 1), [1,2,[3,[4]]], 'successfully flattened an object-literal with nested arrays to specified depth');

  deepEqual(_.flatten([1,2,{0:3,1:[4]}], 1), [1,2,{0:3,1:[4]}], 'successfully flattened an array with nested object-literals to specified depth');

  deepEqual(_.flatten([1,[2,[3]]], 2), [1,2,[3]], 'successfully flattened an array to specified depth');
});

test("groupBy", function() {
  var len = _.len(_.groupBy(['Cat',  'Dog',  'Iguana'], function (s){ return s.length; }));
  equal(len, 2, 'grouped array by property length with mapping function');

  len = _.len(_.groupBy([{'elm':'K',  'type':'metal'},  {'elm':'Ca',  'type':'metal'},  {'elm':'Ne',  'type':'gas'}], 'type'));
  equal(len, 2, 'grouped object-literals in array by property');
});

test("groupsOf", function() {
  var len = _.len(_.groupsOf([1,2,3,4], 2));
  equal(len, 2, 'grouped array elements in groups of 2');

  len = _.len(_.groupsOf([1,2,3,4,5], 2, '*'));
  equal(len, 3, 'grouped array elements in groups of 2 with padding');

  len = _.len(_.groupsOf({0:1, 1:2, 2:3, 3:4, 4:5, 5:6}, 2));
  equal(len, 3, 'grouped object-literal values in groups of 2');

  len = _.len(_.groupsOf({0:1, 1:2, 2:3, 3:4, 4:5, 5:6, 6:7}, 2, '*'));
  equal(len, 4, 'grouped object-literal values in groups of 2 with padding');
});

test("has", function() {
  var obj = {'one':1,'two':2};
  equal(_.has(obj, 'two'), true, 'object literal has key');

  equal(_.has([1,2], 0), true, 'array has index');

  equal(_.has(obj, 'three'), false, 'array does not have key');

  equal(_.has(obj, 'two'), true, 'successfully aliased by _.keyExists');

  equal(_.has({0: 1, 1:{color:'#F00'}}, 'color', true), true, 'successfully deeply tested if an object-literal has a key');
});

test("invert", function() {
  var obj = {'one':1,'two':2};
  deepEqual(_.invert(obj), {1:'one', 2:'two'}, 'successfully inverted object-literal key/value pairs');

  deepEqual(_.invert([1,2]), {1:0,2:1}, 'successfully inverted array to object-literal with inverted key/value pairs');
});

test("invoke", function() {
  deepEqual(_.invoke({0:'Tulip', 1:'Daisy'}, function (v,  a) {return v + a;}, [' is a flower.']), ["Tulip is a flower.", "Daisy is a flower."], 'successfully invoked iterator on all values in object-literal');
});

test("isEmpty", function() {
  equal(_.isEmpty({}), true, 'successfully determined if an object-literal is empty');

  equal(_.isEmpty([]), true, 'successfully determined if an array is empty');

  equal(_.isEmpty({0:1}), false, 'successfully determined if an object-literal is empty');

  equal(_.isEmpty([1]), false, 'successfully determined if an array is empty');
});

test("isUnique", function() {
  deepEqual(_.isUnique([1,2,3,4,4], 4), false, 'successfully determined if a value in array is unique');

  deepEqual(_.isUnique([[1,2],[1,4]], [1,2]), true, 'successfully determined if a complex value in array is unique');

  deepEqual(_.isUnique({0:[1,2], 1:[1,4]}, [1,2]), true, 'successfully determined if a complex value in an object-literal is unique');
});

test("keys", function() {
  deepEqual(_.keys([1,2]), ['0', '1'], 'successfully retrieved an arrays keys');

  deepEqual(_.keys({0:1, 1:2}), ['0', '1'], 'successfully retrieved an object-literals keys');

  deepEqual(_.keys({'name':'Ted', 'age':33, extra: {eyecolor: 'Blue'}}, true), ["name", "age", "extra", "extra.eyecolor"], 'successfully deeply retrieved an array of keys');
});

test("least", function() {
  equal(_.least(['red','red','blue','blue','green']), 'green', 'successfully retrieved the value that occurs the least amount of times from array');

  equal(_.least({0: 'red', 1: 'red', 2: 'blue', 3: 'blue', 4: 'green'}), 'green', 'successfully retrieved the value that occurs the least amount of times from object-literal');
});

test("len", function() {
  equal(_.len([1,2]), 2, 'successfully returned the length of an array');

  equal(_.len({0: 1, 1: 2}), 2, 'successfully returned the length of an object-literal');

  equal(_.len([1,2,[3]], true), 3, 'successfully returned the length of an array (counting deep values)');

  equal(_.len({0: 1, 1: 2, 2: [3]}, true), 3, 'successfully returned the length of an object-literal (counting deep values)');
});

test("map", function() {
  var doubled = _.map([1, 2, 3], function(num){ return num * 2; });
  equal(doubled.join(', '), '2, 4, 6', 'doubled numbers');

  doubled = _.collect([1, 2, 3], function(num){ return num * 2; });
  equal(doubled.join(', '), '2, 4, 6', 'aliased as "collect"');

  var tripled = _.map([1, 2, 3], function(num){ return num * this.multiplier; }, {multiplier : 3});
  equal(tripled.join(', '), '3, 6, 9', 'tripled numbers with scope bound');
});

test("max", function() {
  equal(_.max([1,2,3]), 3, 'returned max value from array');

  equal(_.max({0:1,1:1,2:3}), 3, 'returned max value from object-literal');

  equal(_.max([1,2,[3]], true), 3, 'returned max value from array (counting deep values)');

  equal(_.max({0:1,1:1,2:{0:3}}, true), 3, 'returned max value from object-literal (counting deep values)');
});

test("min", function() {
  equal(_.min([1,2,3]), 1, 'returned min value from array');

  equal(_.min({0:1,1:1,2:3}), 1, 'returned min value from object-literal');

  equal(_.min([1,2,[3]], true), 1, 'returned min value from array (counting deep values)');

  equal(_.min({0:1,1:1,2:{0:3}}, true), 1, 'returned min value from object-literal (counting deep values)');
});

test("most", function() {
  equal(_.most(['red','red','blue','blue','blue','green']), 'blue', 'successfully retrieved the value that occurs the most amount of times from array');

  equal(_.most({0: 'red', 1: 'red', 2: 'blue', 3: 'blue', 4: 'green', 5: 'blue'}), 'blue', 'successfully retrieved the value that occurs the most amount of times from object-literal');
});

test("none", function() {
  equal(_.none([1,2,3], function(n){return _.isString(n);}), true, 'no members of array passed the test in iterator');

  equal(_.none({0:1,1:1}, function(n){return _.isString(n);}), true, 'no members of object-literal passed the test in iterator');

  equal(_.none([1,2,3], function(n){return _.isString(this.x);}, {x:2}), true, 'no members passed the test in iterator when bound to `scope`');

  equal(_.none([1,2,3,[4,5,6]], function(n){return _.isString(n);}, true), true, 'no members (including deep members) in array passed the test in iterator');

  equal(_.none({0:1,1:{0:1,1:2}}, function(n){return _.isString(n);}, true), true, 'no members (including deep members) in object-literal passed the test in iterator');
});

test("omit", function() {
  deepEqual(_.omit([1,2,3], [0,1]), [3], 'matched all but indices from array in list');

  deepEqual(_.omit({'one':1, 'two':2, 'three':3}, ['one','two']), [3], 'matched all but indices from object-literal in list');

  deepEqual(_.blacklist([1,2,3], [0,1]), [3], 'successfully aliased with _.blacklist');
});

test("only", function() {
  deepEqual(_.only([1,2,3], [0,1]), [1,2], 'matched all indices from array in list');

  deepEqual(_.only({'one':1, 'two':2, 'three':3}, ['one','two']), [1,2], 'matched all indices from object-literal in list');

  deepEqual(_.whitelist([1,2,3], [0,1]), [1,2], 'successfully aliased with _.whitelist');
});

test("reduce", function() {
  equal(_.reduce([22,  44,  88], function (base,  value,  index) { return base - value; }), -110, 'successfully reduced an array by the reduction in iterator');

  equal(_.foldl([22,  44,  88], function (base,  value,  index) { return base - value; }), -110, 'successfully aliased with _.foldl');

  equal(_.reduce([22,  44,  88], function (base,  value,  index) { return base - value * this.x; }, {x:-110}), 14542, 'successfully reduced an array by the reduction in iterator while bound to object scope');

  equal(_.reduce({0:22,  1:44,  2:88}, function (base,  value,  index) { return base - value; }), -110, 'successfully reduced an array by the reduction in iterator');
});

test("reduceRight", function() {
  equal(_.reduceRight([22,  44,  88], function (base,  value,  index) { return base - value; }), 22, 'successfully reduced an array by the reduction in iterator');

  equal(_.foldr([22,  44,  88], function (base,  value,  index) { return base - value; }), 22, 'successfully aliased with _.foldr');

  equal(_.reduceRight([22,  44,  88], function (base,  value,  index) { return base - value * this.x; }, {x:-110}), 7348, 'successfully reduced an array by the reduction in iterator while bound to object scope');

  equal(_.reduceRight({0:22,  1:44,  2:88}, function (base,  value,  index) { return base - value; }), 22, 'successfully reduced an array by the reduction in iterator');
});

test("reject", function() {
  deepEqual(_.reject([1,2], function(n) {return n >=2;}), [1], 'successfully rejected an array with condition');

  deepEqual(_.reject({0:1,1:2}, function(n) {return n >=2;}), [1], 'successfully rejected an object-literal with condition');

  deepEqual(_.reject([1,2], function(n) {return n == this.x;}, {x:2}), [1], 'successfully rejected an array while applying an object scope');
});

test("remove", function() {
  deepEqual(_.remove([2,3,4],1), [2,4], 'successfully removed a value from an array at key');

  deepEqual(_.remove({'red':'#F00', 'blue':'#00F', 'green':'#0F0'}, 'green'), {'red':'#F00', 'blue':'#00F'}, 'successfully removed a value from an object-literal at key');
});

test("replace", function() {
  deepEqual(_.replace([1,2], function(v) {return v*2;}), [2,4], 'successfully replaced values in array with result from iterator');

  deepEqual(_.replace({'red':'#F00', 'blue':'#00F'}, function (v) {return v + '000';}), {"red":"#F00000", "blue":"#00F000"}, 'successfully replaced values in object-literal with result from iterator');

  deepEqual(_.replace([1,2], function(v) {return v*this.x;}, {x:2}), [2,4], 'successfully replaced values in array with result from iterator when bound to scope');

  deepEqual(_.replace([1,[2]], function(v) {return v*2;}, true), [2,[4]], 'successfully deeply replaced values in array and nested arrays with result from iterator');

  deepEqual(_.replace({0:1, 1:[2]}, function(v) {return v*2;}, true), {0:2, 1:[4]}, 'successfully deeply replaced values in object-literal and nested arrays with result from iterator');
});

test("sample", function() {
  var sample = _.sample([1,2,3]);
  deepEqual(_.sample([1,2,3]).length, sample.length, 'successfully sampled a value from an array');

  sample = _.sample({0:1,1:2,2:3});
  deepEqual(_.sample({0:1,1:2,2:3}).length, sample.length, 'successfully sampled a value from an object-literal');

  sample = _.sample({0:1,1:2,2:3});
  deepEqual(_.sample({0:1,1:2,2:3}, 2).length, 2, 'successfully sampled a specified number of values');

  var sample = _.sample([1,2,3]);
  deepEqual(_.sample([1,2,[3]]).length, sample.length, 'successfully deeply sampled a value from an array');
});

test("set", function() {
  deepEqual(_.set([1,2,3], 0, 2), [2,2,3], 'successfully set value in an array at key');

  deepEqual(_.set({0:1,1:2,2:3}, 0, 2), {0:2,1:2,2:3}, 'successfully set value in an object-literal at key');

  deepEqual(_.set({0:1,1:2,2:3,3:{}}, 0, 2, true), {0:2,1:2,2:3,3:{0:2}}, 'successfully set value in an object-literal at key');
});

test("setUndef", function() {
  deepEqual(_.setUndef([1,undefined,3], 2), [1,2,3], 'successfully set undefined values in an array');

  deepEqual(_.setUndef({0:1, 1:undefined, 2:3}, 2), {0:1,1:2,2:3}, 'successfully set undefined values in an object-literal');

  deepEqual(_.setUndef([1,undefined,[9,undefined]], 2, true), [1,2,[9,2]], 'successfully deeply set undefined values in an array');
});

test("shuffle", function() {
  var results = [];
  for ( var i = 0; i < 10; i++) { results.push(_.shuffle([1,2,3,4])); }
  equal(_.uniq(results).length >= 1 , true, 'successfully shuffled an array of values');

  results = [];
  for ( var i = 0; i < 10; i++) { results.push(_.shuffle({0:1,1:2,2:3,3:4})); }
  equal(_.uniq(results).length >= 1 , true, 'successfully shuffled an object-literal of values');
});

test("size", function() {
  equal(_.size([1,2,undefined]), 2, 'successfully returned the size of an array');

  equal(_.size({0: 1, 1: 2, 2: undefined}), 2, 'successfully returned the size of an object-literal');

  equal(_.size([1,2,[3, undefined]], true), 3, 'successfully returned the size of an array (counting deep values)');

  equal(_.size({0: 1, 1: 2, 2: [undefined, 3]}, true), 3, 'successfully returned the size of an object-literal (counting deep values)');
});

test("sortBy", function() {
  deepEqual(_.sortBy([1,  2,  3,  4,  5,  6], function (num){ return Math.cos(num); }), [3, 4, 2, 5, 1, 6], 'successfully sorted array by condition within iterator');

  deepEqual(_.sortBy([1,  2,  3,  4,  5,  6], function (num){ return Math.cos(num) * this.x; }, {x:2}), [3, 4, 2, 5, 1, 6], 'successfully sorted array by condition within iterator while bound to scope');
});

test("sum", function() {
  equal(_.sum([1,2,3]), 6, 'successfully summed an array of values');

  equal(_.sum([1,2,[3]], true), 6, 'successfully summed an array of values (counting deep values)');

  equal(_.sum({0:1,1:2,2:3}), 6, 'successfully summed an object-literal of values');

  equal(_.sum({0:1,1:2,2:{0:3}}, true), 6, 'successfully summed an object-literal of values (counting deep values)');
});

test("tap", function() {
  deepEqual(_.tap({0:'Red'}, function (obj){ return _.toArray(obj); }), ['Red'], 'successfully tapped into object-literal and called iterator on it');
});

test("values", function() {
  var vals = [1,2,3];
  deepEqual(_.values([1,2,3]), vals, 'successfully retrieved the values from an array');

  deepEqual(_.values({0:1,1:2,2:3}), vals, 'successfully retrieved the values from an object-literal');

  deepEqual(_.values({0: 1, 1: {0: 1, 1: 2}}, true), [1, {0: 1, 1: 2}, 1, 2], 'successfully deeply retrieved the values from an object-literal');
});

test("where", function() {
  deepEqual(_.where([{'id':0,  'age':22},  {'id':1,  'age':29},  {'id':2,  'age':29}], {'age':29}), [{'id':1,  'age':29}, {'id':2,  'age':29}], 'successfully retrieved object-literals from array that match');
});

test("whereFirst", function() {
  deepEqual(_.whereFirst([{'id':0,  'age':22},  {'id':1,  'age':29},  {'id':2,  'age':29}], {'age':29}), {'id':1,  'age':29}, 'successfully retrieved first object-literal from array that matches');
});

// FUNCTION METHODS
test("after", function() {
  var res = true;
  var fn = _.after(function(v){ return v; }, 3);
  for (var i = 0; i < 3; i++) {
    if ( i < 3 && fn(2) ) res = false;
  }
  equal(res, true, 'function not called until the nth call');
});

test("bind", function() {
  var ecosystem = function() { return this.type + '!'; };
  var rainforest = {type: 'Tropical'};
  ecosystem = _.bind(ecosystem, rainforest);
  equal(ecosystem(), 'Tropical!', 'successfully bound function to scope of object-literal');
});

test("bindAll", function() {
  var htmlButton = {
    title   : 'Boiler.js',
    onClick : function() { return 'Mouse Click: ' + this.title; },
    onHover : function() { return 'Mouse Hovering: ' + this.title; }
  };
  _.bindAll(htmlButton);
  jQuery('#button').bind('click', htmlButton.onClick);
  jQuery('#button').bind('mouseover', htmlButton.onHover);

  equal(jQuery('#button').triggerHandler('click'), 'Mouse Click: Boiler.js', 'successfully bound functions to event handlers in object-literal');

  equal(jQuery('#button').triggerHandler('mouseover'), 'Mouse Hovering: Boiler.js', 'successfully bound functions to event handlers in object-literal');
});

test("compose", function() {
  var scorch = function(meat) { return meat + " is scorched"; };
  var broil = function(meat){ return meat + " and broiled!"; };
  var meat = _.compose(broil, scorch);
  equal(meat('Chicken'), 'Chicken is scorched and broiled!', 'successfully formed a composition of multiple functions');
});

test("debounce", function() {
  var windowWidth = function() { return window.innerWidth; }
  var widthChange = _.debounce(windowWidth, 250);
  jQuery(window).resize(widthChange);
  var res = jQuery(window).triggerHandler('resize');
  equal(true, _.isUndefined(res), 'successfully debounced function');
});

test("defer", function() {
  var message = function( msg ){ return msg; };
  var deferredMsg = _.defer(message);
  var msgString = message('One') + deferredMsg('Two') + message('Three');
  equal(msgString, 'OneundefinedThree', 'successfully deferred function');
});

test("delay", function() {
  var delayed = _.delay(function(msg) { return '3 seconds ' + msg; }, 1);
  equal(delayed('after page load!'), undefined, 'successfully delayed function');
});

test("fill", function() {
  var filledFn = _.fill(_.isArray, [1,2]);
  equal(filledFn(), true, 'successfully filled in arguments for function');

  var filledFn = _.partial(_.isArray, [1,2]);
  equal(filledFn(), true, 'successfully aliased with _.partial');
});

test("memoize", function() {
  var fibonacci = _.memoize(function(n) {
    return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
  });
  equal(fibonacci(11), 89, 'successfully memoized function')
});

test("once", function() {
  var init = _.once(function(){return true;});
  var res = init();
  res = init();
  equal(res, undefined, 'successfully created function that can only be called one time');
});

test("throttle", function() {
  var getWindowWidth = function(){ return window.innerWidth; };
  var throttled = _.throttle(getWindowWidth, 200);
  var res = [];
  var interval = setInterval(function() {
    if (throttled()) { res.push(1); }
  }, 100);
  setTimeout(function() {
    clearInterval(interval);
  }, 1000);
  equal(res.length <= 5, true, 'successfully throttled function');
});

test("times", function() {
  var n = 0;
  var rain = function() { n += 1; };
  rain = _.times(rain, 3);
  rain();
  equal(n, 3, 'successfully called function n times sequentially');
});

test("wrap", function() {
  var season = function(name) { return name + " which is before "; };
  season = _.wrap(season, function(fn) {
    return "First winter then " + fn("Spring") + "Summer!";
  });
  equal(season(), 'First winter then Spring which is before Summer!', 'successfully wrapped a function');
});

// NUMBER METHODS
test("range", function() {
  var range = [0,10,20,30,40];
  deepEqual(_.range(0,50,10), range, 'successfully created a range');

  range = [0,1,2,3,4,5,6,7,8,9];
  deepEqual(_.range(10), range, 'successfully created a range just from a start number');

  range = [1,2,3,4,5,6,7,8,9,10];
  deepEqual(_.range(1,11), range, 'successfully created a range with a start and stop number');

  range = [];
  deepEqual(_.range(0), range, 'successfully created empty array when passed 0');
});

test("uniqueId", function() {
  equal(_.isString(_.uniqueId()), true, 'successfully created a unique id');
});

// OBJECT METHODS
test("array", function() {
  deepEqual(_.array({0:1}, {0:2}), [1,2], 'created an array from multiple object-literals');

  deepEqual(_.array({0:1, 1:2}), [1,2], 'created an array from a single object-literal');

  deepEqual(_.array([1,2,3,4]), [1,2,3,4], 'created an array from a single array');

  deepEqual(_.array([1],[2],[3],[4]), [1,2,3,4], 'created an array from multiple arrays');

  deepEqual(_.array({0:1}, {0:2}), [1,2], 'successfully aliased with _.toArray');
});

test("arrayNames", function() {
  deepEqual(_.arrayNames(obj), ['B'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.arrayNames(obj, 'A'), ['a_1', 'a_2'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.arrayNames(obj, 'A', true), ['a_1', 'a_2', 'a_3_1'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("arrays", function() {
  equal(_.arrays(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.arrays(obj, true).length, 4, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.arrays(obj, 'a_1', true).length, 1, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("boolNames", function() {
  deepEqual(_.boolNames(obj), ['C'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.boolNames(obj, 'A'), ['a_4', 'a_5'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.boolNames(obj, 'A', true), ['a_4', 'a_5', 'a_6_1'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("bools", function() {
  equal(_.bools(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.bools(obj, true).length, 4, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.bools(obj, 'a_4', true).length, 1, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("call", function() {
  equal(_.call({obj:obj}).length, 1, 'successfully called functions in target object');

  equal(_.call({obj:obj, deep:true}).length, 4, 'successfully deeply called functions in target object');

  equal(_.call({obj:obj, deep:true, key:'a_6_2'}).length, 1, 'successfully deeply called functions in target object at target key');

  equal(_.call({obj:obj, deep:true, only:'D'}).length, 1, 'successfully called functions in target object with whitelist');
});

test("dateNames", function() {
  deepEqual(_.dateNames(obj), ['E'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.dateNames(obj, 'A'), ['a_8'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.dateNames(obj, 'A', true), ['a_6_3', 'a_8'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("dates", function() {
  equal(_.dates(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.dates(obj, true).length, 3, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.dates(obj, 'a_8', true).length, 1, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("defaults", function() {
  deepEqual(_.defaults({color:'red'}, {color:'blue', type:'rgb'}), {color: "red", type: "rgb"}, 'successfully set default property in target object-literal without overriding any properties');

  deepEqual(_.defaults({color:undefined, type:undefined}, {color:'blue', type:'rgb'}), {color: "blue", type: "rgb"}, 'successfully set default properties in object-literal where values were undefined');
});

test("elementNames", function() {
  deepEqual(_.elementNames(obj), ['F'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.elementNames(obj, 'A'), ['a_9'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.elementNames(obj, 'A', true), ['a_6_4', 'a_9'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("elements", function() {
  equal(_.elements(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.elements(obj, true).length, 3, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.elements(obj, 'a_9', true).length, 1, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("extend", function() {
  deepEqual(_.extend({'one':1, 'two':{}}, {'three':3}), {one: 1, two: {}, three: 3}, 'successfully extended object onto target');

  deepEqual(_.extend({'one':1, 'two':{}}, {'three':3}, {four:4}), {one: 1, two: {}, three: 3, four: 4}, 'successfully extended multiple objects onto target');

  deepEqual(_.extend({'one':1, 'two':{}}, {'three':3}, true), {one: 1, two: {three:3}, three: 3}, 'successfully deeply extended object onto target');

  deepEqual(_.merge({'one':1, 'two':{}}, {'three':3}), {one: 1, two: {}, three: 3}, 'successfully aliased with _.merge');
});

test("functionNames", function() {
  deepEqual(_.functionNames(obj), ['D'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.functionNames(obj, 'A'), ['a_7'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.functionNames(obj, 'A', true), ['a_3_2', 'a_6_2', 'a_7'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("functions", function() {
  equal(_.functions(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.functions(obj, true).length, 4, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.functions(obj, 'a_7', true).length, 1, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("get", function() {
  deepEqual(_.get(obj, 'a_3_1'), [1,2], 'successfully retrieved value at key in object-literal');

  deepEqual(_.get(obj, 'a_6_1'), true, 'successfully retrieved value at key in object-literal');
});

test("getByType", function() {
  equal(_.getByType(obj, 'element').length, 1, 'successfully retrieved values of [type] from object-literal');

  equal(_.getByType(obj, 'array', true).length, 4, 'successfully deeply retrieved values of [type] from object-literal');

  equal(_.getByType(obj, 'bool', 'C').length, 1, 'successfully retrieved values of [type] from object-literal at target key');
});

test("howDeep", function() {
  equal(_.howDeep({'one': {'two': {'three': {}}}}, 'three'), 3, 'successfully determined how many nested levels deep an object-literal is');
});

test("isArguments", function() {
  equal(_.isArguments(types.argument[0]), true, 'returns true when passed an array-like arguments object');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isArguments(types[t][a]) && t !== 'argument') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isArray", function() {
  equal(_.isFunction(types.function[0]), true, 'returns true when passed an array');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isFunction(types[t][a]) && t !== 'function') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isBool", function() {
  equal(_.isBool(types.bool[0]), true, 'returns true when passed a boolean');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isBool(types[t][a]) && t !== 'bool') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isDate", function() {
  equal(_.isDate(types.date[0]), true, 'returns true when passed a date');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isDate(types[t][a]) && t !== 'date') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isElement", function() {
  equal(_.isElement(types.element[0]), true, 'returns true when passed an element');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isElement(types[t][a]) && t !== 'element') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isEqual", function() {
  equal(_.isEqual(0, 0), true, 'successfully determined equality between two objects');

  equal(_.isEqual(11, 11), true, 'successfully determined equality between two objects');

  equal(_.isEqual(false, false), true, 'successfully determined equality between two objects');

  equal(_.isEqual(true, true), true, 'successfully determined equality between two objects');

  equal(_.isEqual(null, null), true, 'successfully determined equality between two objects');

  equal(_.isEqual(NaN, NaN), true, 'successfully determined equality between two objects');

  equal(_.isEqual(undefined, undefined), true, 'successfully determined equality between two objects');

  equal(_.isEqual("",""), true, 'successfully determined equality between two objects');

  equal(_.isEqual(-44, -44), true, 'successfully determined equality between two objects');

  equal(_.isEqual([1],[1]), true, 'successfully determined equality between two objects');

  equal(_.isEqual(obj, _.clone(obj)), true, 'successfully determined equality between two objects');

  equal(_.isEqual([undefined], [undefined]), true, 'successfully determined equality between two objects');

  equal(_.isEqual({0: []}, {0: []}), true, 'successfully determined equality between two objects');

  equal(_.isEqual([], []), true, 'successfully determined equality between two objects');

  equal(_.isEqual({}, {}), true, 'successfully determined equality between two objects');

  equal(_.isEqual(Infinity, Infinity), true, 'successfully determined equality between two objects');

  equal(_.isEqual(function(){return 1;}, function(){return 1;}), true, 'successfully determined equality between two objects');
});

test("isFalsy", function() {
  var isTrue = true;
  var falsy = [0,"",undefined,NaN,null,false];
  for (var f in falsy) {
    if (!_.isFalsy(falsy[f])) isTrue = false;
  }
  equal(isTrue, true, 'returns true for all "falsy" values');

  isTrue = false;
  for (var t in noFalsyTypes) {
    for (var a in noFalsyTypes[t]) {
      if (_.isFalsy(noFalsyTypes[t][a])) isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other non-"falsy" types');
});

test("isFinite", function() {
  equal(_.isFinite(types.finite[0]), true, 'returns true when passed an infinite value');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isFinite(types[t][a]) && t !== 'finite') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isFunction", function() {
  equal(_.isFunction(types.function[0]), true, 'returns true when passed a function');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isFunction(types[t][a]) && t !== 'function') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isNaN", function() {
  equal(_.isNaN(types.nan[0]), true, 'returns true when passed NaN');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isNaN(types[t][a]) && t !== 'nan') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isNull", function() {
  equal(_.isNull(types.null[0]), true, 'returns true when passed a null value');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isNull(types[t][a]) && t !== 'null') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isNumber", function() {
  equal(_.isNumber(types.number[0]), true, 'returns true when passed a numeric value');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isNumber(types[t][a]) && t !== 'number' && t !== 'nan' && t !== 'finite') {
        isTrue = true;
      }
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isObject", function() {
  equal(_.isObject(types.object[0]), true, 'returns true when passed a JavaScript object');

  equal(_.isObject(types.plainobject[0]), true, 'returns true when passed an object literal');

  equal(_.isObject(types.argument[0]), true, 'returns true when passed an arguments object');

  equal(_.isObject(types.array[0]), true, 'returns true when passed an array object');

  equal(_.isObject(types.date[0]), true, 'returns true when passed a date object');

  equal(_.isObject(types.element[0]), true, 'returns true when passed an element object');

  equal(_.isObject(types.null[0]), true, 'returns true when passed a null object');

  equal(_.isObject(types.regexp[0]), true, 'returns true when passed a regular expression object');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isObject(types[t][a]) && t!=='object' && t!=='plainobject' && t!=='argument' && t!=='array' && t!=='date' && t!=='element' && t!=='null' && t!=='regexp') {
        isTrue = true;
      }
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isPlainObject", function() {
  equal(_.isPlainObject(types.plainobject[0]), true, 'returns true when passed an object literal');

  equal(_.isPlainObject(types.object[0]), false, 'returns false when passed a JavaScript object');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isPlainObject(types[t][a]) && t !== 'plainobject') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isRegExp", function() {
  equal(_.isRegExp(types.regexp[0]), true, 'returns true when passed a regular expression');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isRegExp(types[t][a]) && t !== 'regexp') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isString", function() {
  equal(_.isString(types.string[0]), true, 'returns true when passed a string');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isString(types[t][a]) && t !== 'string') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("isUndefined", function() {
  equal(_.isUndefined(types.undefined[0]), true, 'returns true when passed a string');

  var isTrue = false;
  for (var t in types) {
    for (var a in types[t]) {
      if (_.isUndefined(types[t][a]) && t !== 'undefined') isTrue = true;
    }
  }
  equal(isTrue, false, 'returns false on all other types');
});

test("module", function() {
  deepEqual(_.module('My.DOM.Utility'), {My: {DOM: {Utility: {}}}}, 'successfully created object-literal from namespace string');

  deepEqual(_.build('My.DOM.Utility'), {My: {DOM: {Utility: {}}}}, 'successfully aliased with _.build');
});

test("nanNames", function() {
  deepEqual(_.nanNames(obj), ['G'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.nanNames(obj, 'A'), ['a_10'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.nanNames(obj, 'A', true), ['a_3_3', 'a_10'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("nans", function() {
  equal(_.nans(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.nans(obj, true).length, 3, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.nans(obj, 'a_10', true).length, 1, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("nest", function() {
  deepEqual(_.nest({'one': 99}), {one:{one:99}}, 'successfully nested values in object-literal');

  deepEqual(_.nest({'one': 99}, 'pre-'), {one:{'pre-one':99}}, 'successfully nested values in object-literal and prefixed property');
});

test("noArrays", function() {
  var res = true;
  _.filter(_.noArrays(obj), function(v) { if (_.type(v) === 'array') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noArrays(obj, true), function(v) { if (_.type(v) === 'array') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noArrays(obj, 'A', true), function(v) { if (_.type(v) === 'array') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noBools", function() {
  var res = true;
  _.filter(_.noBools(obj), function(v) { if (_.type(v) === 'bool') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noBools(obj, true), function(v) { if (_.type(v) === 'bool') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noBools(obj, 'A', true), function(v) { if (_.type(v) === 'bool') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noDates", function() {
  var res = true;
  _.filter(_.noDates(obj), function(v) { if (_.type(v) === 'date') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noDates(obj, true), function(v) { if (_.type(v) === 'date') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noDates(obj, 'A', true), function(v) { if (_.type(v) === 'date') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noElements", function() {
  var res = true;
  _.filter(_.noElements(obj), function(v) { if (_.type(v) === 'element') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noElements(obj, true), function(v) { if (_.type(v) === 'element') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noElements(obj, 'A', true), function(v) { if (_.type(v) === 'element') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noFunctions", function() {
  var res = true;
  _.filter(_.noFunctions(obj), function(v) { if (_.type(v) === 'function') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noFunctions(obj, true), function(v) { if (_.type(v) === 'function') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noFunctions(obj, 'A', true), function(v) { if (_.type(v) === 'function') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noNans", function() {
  var res = true;
  _.filter(_.noNans(obj), function(v) { if (_.type(v) === 'nan') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noNans(obj, true), function(v) { if (_.type(v) === 'nan') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noNans(obj, 'A', true), function(v) { if (_.type(v) === 'nan') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noNulls", function() {
  var res = true;
  _.filter(_.noNulls(obj), function(v) { if (_.type(v) === 'null') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noNulls(obj, true), function(v) { if (_.type(v) === 'null') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noNulls(obj, 'A', true), function(v) { if (_.type(v) === 'null') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noNumbers", function() {
  var res = true;
  _.filter(_.noNumbers(obj), function(v) { if (_.type(v) === 'number') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noNumbers(obj, true), function(v) { if (_.type(v) === 'number') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noNumbers(obj, 'A', true), function(v) { if (_.type(v) === 'number') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noObjects", function() {
  var res = true;
  _.filter(_.noObjects(obj), function(v) { if (_.type(v) === 'defaultobject') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noObjects(obj, true), function(v) { if (_.type(v) === 'defaultobject') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noObjects(obj, 'A', true), function(v) { if (_.type(v) === 'defaultobject') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noRegexps", function() {
    var res = true;
    _.filter(_.noRegexps(obj), function(v) { if (_.type(v) === 'regexp') { res = false}});
    equal(res, true, 'successfully returned all values from object-literal except of type');

    _.filter(_.noRegexps(obj, true), function(v) { if (_.type(v) === 'regexp') { res = false}});
    equal(res, true, 'successfully deeply returned all values from object-literal except of type');

    _.filter(_.noRegexps(obj, 'A', true), function(v) { if (_.type(v) === 'regexp') { res = false}});
    equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noStrings", function() {
  var res = true;
  _.filter(_.noStrings(obj), function(v) { if (_.type(v) === 'string') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noStrings(obj, true), function(v) { if (_.type(v) === 'string') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noStrings(obj, 'A', true), function(v) { if (_.type(v) === 'string') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("noUndefineds", function() {
  var res = true;
  _.filter(_.noUndefineds(obj), function(v) { if (_.type(v) === 'undefined') { res = false}});
  equal(res, true, 'successfully returned all values from object-literal except of type');

  _.filter(_.noUndefineds(obj, true), function(v) { if (_.type(v) === 'undefined') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type');

  _.filter(_.noUndefineds(obj, 'A', true), function(v) { if (_.type(v) === 'undefined') { res = false}});
  equal(res, true, 'successfully deeply returned all values from object-literal except of type at targeted property key');
});

test("nullNames", function() {
  deepEqual(_.nullNames(obj), ['H'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.nullNames(obj, 'A'), ['a_11'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.nullNames(obj, 'A', true), ['a_3_4', 'a_11'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("nulls", function() {
  equal(_.nulls(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.nulls(obj, true).length, 3, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.nulls(obj, 'a_11', true).length, 1, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("numberNames", function() {
  deepEqual(_.numberNames(obj), ['I'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.numberNames(obj, 'A'), ['a_12'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.numberNames(obj, 'A', true), ['a_3_5', 'a_12'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("numbers", function() {
  equal(_.numbers(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.numbers(obj, true).length, 3, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.numbers(obj, 'a_12', true).length, 1, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("objectNames", function() {
  deepEqual(_.objectNames(obj), ['A', 'J'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.objectNames(obj, 'A'), ['A'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.objectNames(obj, 'A', true), ['A'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("objects", function() {
  equal(_.objects(obj).length, 2, 'successfully retrieved [type]s from object-literal');

  equal(_.objects(obj, true).length, 6, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.objects(obj, 'A', true).length, 1, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("pairs", function() {
  deepEqual(_.pairs({0: 1, 1: 2}), [['0',1],['1',2]], 'successfully retrieved name value pairs from object-literal');
});

test("parent", function() {
  deepEqual(_.parent({0: {1: {2: {color: 'green'}}}}, 2), {2: {color: 'green'}}, 'successfully retrieved the parent object of the targeted property in object-literal');

  deepEqual(_.parent({0: {1: {2: {color: 'green'}}}}), {0: {1: {2: {color: 'green'}}}}, 'successfully returned the object-literal when no target key is passed');
});

test("paths", function() {
  deepEqual(_.paths({color: {rgb: '#0F0'}}), {color: {rgb:'#0F0'}, 'color.rgb': '#0F0'}, 'successfully retrieved values from object-literal keyed by namespace property names');

  deepEqual(_.paths(['red',['green']]), {0: 'red', 1: ['green'], '1.0': 'green'}, 'successfully retrieved values from array keyed by namespace property names');
});

test("pluck", function() {
  deepEqual(_.pluck([{color: 'red', hex:'#F00'}, {color: 'blue', hex:'#00F'}, {color: 'green', hex:'#0F0'}], 'color'), ['red', 'blue', 'green'], 'successfully plucked values from object-literals in target array');

  deepEqual(_.fetch([{color: 'red', hex:'#F00'}, {color: 'blue', hex:'#00F'}, {color: 'green', hex:'#0F0'}], 'color'), ['red', 'blue', 'green'], 'successfully aliased with _.fetch');

  var objs = [{color:{vals:{hex:'FF0', hsl:[0,100,50]}}}, {color:{vals:{hex:'0F0', hsl:[120,100,50]}}}, {color:{vals:{hex:'00F', hsl:[240,100,50]}}}];
  deepEqual(_.pluck(objs, 'color.vals.hex'), ['FF0', '0F0', '00F'], 'successfully plucked nested values from object-literals in target array');
});

test("regexpNames", function() {
  deepEqual(_.regexpNames(obj), ['M'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.regexpNames(obj, 'A'), ['a_16'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.regexpNames(obj, 'A', true), ['a_3_9', 'a_16'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("regexps", function() {
  equal(_.regexps(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.regexps(obj, true).length, 3, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.regexps(obj, 'A', true).length, 2, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("resolve", function() {
  equal(_.resolve({'colors':{'red':{'vals':{'rgb':'#F00', 'hsl':'0, 100, 50'}}}}, 'colors.red.vals.rgb'), '#F00', 'successfully resolved value at targeted namespace');

  equal(_.resolve({'colors':{'red':{'vals':{'rgb':'#F00', 'hsl':'0, 100, 50'}}}}, "rgb", true), 'colors.red.vals.rgb', 'successfully resolved full namespace at targeted partical namespace');

  equal(_.resolve({'colors':{'red':{'vals':{'rgb':'#F00', 'hsl':[0, 100, 50]}}}}, 'colors.red.vals.hsl.1'), 100, 'successfully resolved value in nested array at targeted namespace');
});

test("stringNames", function() {
  deepEqual(_.stringNames(obj), ['K'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.stringNames(obj, 'A'), ['a_14'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.stringNames(obj, 'A', true), ['a_3_7', 'a_14'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("strings", function() {
  equal(_.strings(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.strings(obj, true).length, 3, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.strings(obj, 'A', true).length, 2, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

test("toQueryString", function() {
  equal(_.toQueryString({'firstname':'John', 'middlename':'Edgar', 'lastname':'Hoover'}), 'firstname%3DJohn%26middlename%3DEdgar%26lastname%3DHoover', 'successfully converted object-literal to query string');

  equal(_.toQueryString({'colors':['Red', 'Blue']}, 'pre-'), 'pre-colors%5B%5D%3DRed%26pre-colors%5B%5D%3DBlue', 'successfully converted object-literal to query string while using prefix');
});

test("type", function() {
  equal(_.type((function(){return arguments;})()), 'arguments', 'successfully returned type string of [type]');

  equal(_.type([]), 'array', 'successfully returned type string of [type]');

  equal(_.type(false), 'bool', 'successfully returned type string of [type]');

  equal(_.type(new Date()), 'date', 'successfully returned type string of [type]');

  equal(_.type(document.createElement('a')), 'element', 'successfully returned type string of [type]');

  equal(_.type(Infinity), 'infinity', 'successfully returned type string of [type]');

  equal(_.type(function(){}), 'function', 'successfully returned type string of [type]');

  equal(_.type(NaN), 'nan', 'successfully returned type string of [type]');

  equal(_.type(null), 'null', 'successfully returned type string of [type]');

  equal(_.type(99), 'number', 'successfully returned type string of [type]');

  equal(_.type(Math), 'object', 'successfully returned type string of [type]');

  equal(_.type({}), 'object', 'successfully returned type string of [type]');

  equal(_.type(/(.)/g), 'regexp', 'successfully returned type string of [type]');

  equal(_.type('red'), 'string', 'successfully returned type string of [type]');

  equal(_.type(undefined), 'undefined', 'successfully returned type string of [type]');
});

test("undefinedNames", function() {
  deepEqual(_.undefinedNames(obj), ['L'], 'successfully retrieved [type]Names from object-literal');

  deepEqual(_.undefinedNames(obj, 'A'), ['a_15'], 'successfully retrieved [type]Names from object-literal at target key');

  deepEqual(_.undefinedNames(obj, 'A', true), ['a_3_8', 'a_15'], 'successfully deeply retrieved [type]Names from object-literal');
});

test("undefineds", function() {
  equal(_.undefineds(obj).length, 1, 'successfully retrieved [type]s from object-literal');

  equal(_.undefineds(obj, true).length, 3, 'successfully deeply retrieved [type]s from object-literal');

  equal(_.undefineds(obj, 'A', true).length, 2, 'successfully deeply retrieved [type]s from object-literal starting at target key');
});

// STRING METHODS
test("fromQueryString", function() {
  deepEqual(_.fromQueryString('firstname%3DJohn%26middlename%3DEdgar%26lastname%3DHoover'), {firstname: "John", middlename: "Edgar", lastname: "Hoover"}, 'successfully converted query string to object-literal');

  deepEqual(_.fromQueryString('pre-colors%5B%5D%3DRed%26pre-colors%5B%5D%3DBlue', true), {'pre-colors':['Red', 'Blue']}, 'successfully converted query string to object-literal');
});

test("htmlEncode", function() {
  equal(_.htmlEncode('<html></html>'), '&lt;html&gt;&lt;&#x2F;html&gt;', 'successfully encoded HTML string');
});

test("htmlDecode", function() {
  equal(_.htmlDecode('&lt;html&gt;&lt;&#x2F;html&gt;'), '<html></html>', 'successfully encoded HTML string');
});

// UTILITY METHODS
test("chain", function() {
  equal(_.isPlainObject(_.chain()), true, 'the library method was returned as an object');
});

test("end", function() {
  deepEqual(_.chain([1,2,null,[3,"",4]]).compact().end(), [1,2,[3,"",4]], 'values passed through chain method handed off to the library method in chained sequence');
});

test("identity", function() {
  equal(_.identity(1), 1, 'successfully returned identity value')
});

test("noConflict", function() {
  var lib = _.noConflict();
  equal(lib.isFunction(_), false, 'library is no longer referenced via the underscore');
  _ = lib;
});

test("value", function() {
  equal(_.value(1), 1, 'successfully returned value from non-function');

  equal(_.value(function(){return 1;}), 1, 'successfully returned value from function');
});