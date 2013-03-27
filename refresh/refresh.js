(function( $ ) {

	var 

		// Plugin name
		pluginName = "refresh",

		// Plugin version
		pluginVersion = "1.0.0",

		// Reference to the plugin
		plugin = $.fn[pluginName], 

		// Unique namespace id
		namespace = "",

		config = {

			// Files to track
			files: "",

			// Store the paths to register
			dirs: "",

			// File types to track
			types: "",

			// Stores our registered backend path
			path: 'refresh.php',

			// Time in milaseconds to refresh a page
			interval: 500,

			// Set the plugin turning it on or off
			on: true,

			// Is dynamic js evaluation on or off
			jsOn: false
		},

		methods = {

		/**
		 * Initialize configuration values and call default methods.
		 * @param {Object} options An array of name/value pairs for configuration.
		 * @return {Object} jQuery object.
		 */
		init : (function( options ) {

			// Build namespace string
			namespace = window.location.hostname
				.replace(/(-)+/g, "")
				.replace(/(\.)/g, "_");

			// Merge configuration options
			$.extend( config, options );

			// Flush the localStorage object
			methods.flush();

			// Register interval diff tester
			if ( config.on === true ) {
				var diff = setInterval(function() {
					methods.register();
				}, config.interval);
			} else {
				methods.register();
			}

			// Bind methods to plugin
			for ( var fn in methods ) {
				$.fn[pluginName][fn] = methods[fn];
			}

			return this; 
		}),

		/**
		 * Method register files and directories to track for changes.
		 */
		register : function() {

			// Build the XHR object
			var request = $.ajax({
				url: config.path,
				type: "POST",
				data: {method: 'register', files: config.files, dirs: config.dirs, types: config.types},
				dataType: "text",
				success: function( data ) {	
					
					//console.log(data);
					
					// Convert serialized object to data to iterate over it
					var fileInfo = JSON.parse( data ); 	

					// First check and see if files are already in localStorage
					for ( var fileOnRemote in fileInfo ) {	
						var fileRemoteObj = fileInfo[fileOnRemote];
						var fileIndex = fileInfo[fileOnRemote].name;

						// Retrieve the keyed file item if it exists
						if ( localStorage.getItem(namespace+"_"+fileIndex) ) { 

							// Unserialize stored file object
							var fileObj = JSON.parse( localStorage.getItem(namespace+"_"+fileIndex) );

							// Reference the modification times to comapre
							var new_time = fileRemoteObj.m_time;
							var old_time = fileObj.m_time;

							// When a file has been updated reload the relavent aspects of the page
							if ( new_time > old_time ) {

								// Update local storage to reflect new m_time on file
								var fileData = JSON.stringify({
									'name': fileInfo[fileOnRemote].name,
									'm_time': fileInfo[fileOnRemote].m_time
								});

								// Update changes to localStorage
								localStorage.setItem(namespace+"_"+fileIndex, fileData);

								// Determine the file type to choose which type of refresh
								var type = fileInfo[fileOnRemote].name.split("."); 
								type = type[type.length-1];

								// Reload only the files of a type vs. the entire page 
								switch ( type ) {

									// Re-evaluate javascript changes
									case 'js' :

										if ( config.jsOn ) {

											// Generate a file match regexp to determine which file changed
											var hrefArray = fileIndex.split("/");
											var matchString = new RegExp(hrefArray[hrefArray.length-1], "g"); 
											var queryString = '?reload=' + new Date().getTime();

											$('script[type="text/javascript"]').each(function(index, value) {

												// Reload the script that was modified
												if ( this.src.match(matchString) !== null ) { 

													// Evaluate scripts of type javascript with src attrib set
													if ( $(this).attr('src') ) {
														var jsSrc = this.src.replace(/\?.*|$/, queryString); 
														this.src = jsSrc; 

														$(this).load(this.src, function() {
															var js = $(this).get(0).innerHTML;
															//eval(js);

															// Execute script in the global scope
															var fn = new Function([], js)();
														});
													}
												}       
											}); 

										} else {
											location.reload(true);
										}
										break;

									// Reload stylesheet changes
									case 'cssS' :

										// Testing for dynamic CSS reload
										var css = $("style");

										// Save reference to style element
										var cssArr = [];

										$.each(css, function(index, value) {

											// When style elements are found with @imports										
											if ( $(this).text().match(/@import/g) !== null ) {

												// Save a copy of the element in reference array
												cssArr.push(this);

												// Parse the @import strings and make new link elements
												var styleNodes = $(cssArr[index]).text();
												var styleNodesArr = styleNodes.split(";");
												for ( var n = 0; n < styleNodesArr.length; n++ ) {
													var uid = "unique_"+n;
													if ( styleNodesArr[n] ) {
														var styleNode = styleNodesArr[n]
															.replace(/\@import url\("/g, "")
															.replace(/"\)/g, "")
															.replace(/\n/g, "");

														var link = $("<link>")
															.attr({
																rel: "stylesheet",
																href: styleNode,
																media: this.media,
																id: uid
															});

														// Remove style elements with imported css
														$(this).remove();

														// Only add link elements to page if they haven't already been
														if ( $("#"+uid) ) {
															$("head").prepend(link.get(0));
														}
													}
												}	
											}
										});

										// Generate a file match regexp to determine which file changed
										var hrefArray = fileIndex.split("/");
										var matchString = new RegExp(hrefArray[hrefArray.length-1], "g");

										// Assign a unique string to changed link element href so css reloads
										var queryString = '?reload=' + new Date().getTime();
										$('link[rel="stylesheet"]').each(function() {

											// If the link in question is the one changed reload it
											if ( this.href.match(matchString) !== null ) {
												var cssHref = this.href.replace(/\?.*|$/, queryString);
												this.href = cssHref;
											}
										}); 

										break;

									// In all other instances reload the entire page
									default :
										location.reload(true);
								}

							}

						}

					}

					// Set the file m_times in our localStorage object
					for ( var fileOnRemote in fileInfo ) {
						var fileIndex = fileInfo[fileOnRemote].name;
						var fileData = JSON.stringify({
							'name': fileInfo[fileOnRemote].name,
							'm_time': fileInfo[fileOnRemote].m_time
						});
						localStorage.setItem(namespace+"_"+fileIndex, fileData); 
					}
				}
			});
			return this;
		},

		/**
		 * Method deletes all localStorage objects in the refresh namespace.
		 */
		flush: function() {
			for ( var obj in localStorage ) {
				var matchNS = new RegExp(namespace, 'g');
				if ( obj.match(matchNS) !== null) {
					localStorage.removeItem(obj);
				}
			}
			return this;
		}

	};

	/**
	 * Plugin interface method.
	 */
	$.fn[pluginName] = function( method ) {			
		switch ( method ) {
			case 'init' :	
				methods.init.apply( this, Array.prototype.slice.call( arguments, 1 ));
				break;
		}
		return this;
	};

})( jQuery );