_.module(window, 'assert',
	{
	//_extends: [window],
	//_exposed: [],
	//_retract: [],
	
	test: function( method, args ) {
		var results = [];
		for ( var a in args ) {
			try {
				results.push(method(args[a]));
				console.log('SUCCESS: ', results[a]);		
			} catch (e) {
				console.log('ERROR  : ');					
			}		
		}
		return results;
	}
});

console.log(
	assert,
	assert.test(_.first, [[1,2,3,4]])
);