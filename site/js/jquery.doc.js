$(document).ready(function(e) {
	
	// jDoc namespace
	var jDoc = jQuery.fn;
	
	// Save a reference to all of our defined sections
	var globalSections = {};
	
	// Save a reference to all the section names in an array
	var globalSectionNames = [];
	
	// A place to reference our name
	var baseName = "";

	/**
	 * Returns the offset relative to the bottom of the window of the first matched element
	 */
	jQuery.fn.offsetBottom = function() {
		var windowBottom = $(window).height();
		var elmOffset = this.position().top;
		var elmHeight = this.height();
		return windowBottom - (elmOffset + elmHeight);
	};
	
	/**
	 * Centers block level elements with a fixed or absolute position: horizontally,
	 * vertically, or horizontally and vertically within its parent element.
	 * @param {string} how Pass 'h', 'v', or 'hv' to set how the element is centered
	 * @return {object} jQuery object to maintain chainability.
	 */
	jQuery.fn.center = function( how ) {
		var parent = $(this).parent();
		var that = this;
		
		var getTop = function() {
			return Math.max(0, (($(parent).height() - that.outerHeight()) / 2) 
				+ $(window).scrollTop());
		}
		var getLeft = function() {
			return Math.max(0, (($(parent).width() - that.outerWidth()) / 2) 
				+ $(window).scrollLeft());
		}
		var top = getTop();
		var left = getLeft();
		
		switch ( how ) {
			case 'h':
				that.css("left", left + "px");
				$(window).resize(function(e) {
					that.css("left", getLeft() + "px");
				});
			break;
			case 'v':
				that.css("top", top + "px");
				$(window).resize(function(e) {
					that.css("top", getTop() + "px");
				});
			break;
			case 'hv':
				that.css("top", top + "px");
				that.css("left", left + "px");
				$(window).resize(function(e) {
					that.css("top", getTop() + "px");
					that.css("left", getLeft() + "px");
				});
			break;
		}
		
		return this;
	};
	
	// Track wether the user is are scrolling UP or DOWN
	var startPosition = $(window).scrollTop();
	var scrollDirection = "";
	$(window).scroll(function() {
		var scroll = $(window).scrollTop();
		if ( scroll > startPosition ) {
			scrollDirection = "down";
		} else {
			scrollDirection = "up";
		}
		startPosition = scroll;
	});
	
	/**
	 * Function tracks page scroll location and associates that location to
	 * defined navigational indices.
	 */
	jDoc.trackScroll = function() {
		
		// Iterate through the globalSections object to first obtain sub section divs IDs
		// so we can set dimensional and position information that will be used by the sub 
		// section index tracking logic.
		var n = 0;
		for ( var gSec in globalSections ) {
			if ( gSec !== "__length" && gSec !== "id" ) {		
				var sectionElm = $("#"+globalSections[gSec].id);
				
				// On load we insert the default sub section index
				if ( n === 0 ) {
					$("#index").html(sectionElm.find("article aside").html());
				}
				
				// Store section positional data	
				globalSections[gSec].height = parseInt( sectionElm.height() );
				globalSections[gSec].offsTop = parseInt( sectionElm.offset()['top'] );
				globalSections[gSec].posTop = parseInt( sectionElm.position()['top'] );
				
				// Store offset from bottom of index div for each sub section
				globalSections[gSec].fromBottom = $(window).height() - ($("#index").position().top + $("#"+gSec).height());
				
				// Set this, next and last section name
				globalSections[gSec].thisSection = gSec;
				if ( n == 0 && globalSections.__length > 1 ) {
					globalSections[gSec].nextSection = globalSectionNames[n+1];
					globalSections[gSec].lastSection = false;
				} else if ( n < globalSections.__length-1 ) {
					globalSections[gSec].nextSection = globalSectionNames[n+1];
					globalSections[gSec].lastSection = globalSectionNames[n-1];					
				} else {
					globalSections[gSec].nextSection = false;
					globalSections[gSec].lastSection = globalSectionNames[n-1];	
				}
				
				for ( var i = 0; i < globalSections[gSec].length; i++ ) {
					if ( jQuery.isPlainObject( globalSections[gSec][i] ) ) {
						var subSectionElm = $("#"+globalSections[gSec][i].id);					
						globalSections[gSec][i].height = parseInt( subSectionElm.height() );
						globalSections[gSec][i].offsTop = parseInt( subSectionElm.offset()['top'] );
						globalSections[gSec][i].posTop = parseInt( subSectionElm.position()['top'] );
					}
				}
			}
			n++;
		}
						
		var 
		
		// Arbitray top offset to adjust when tracking spills over
		arbOffsTop = 150,
		
		// Store the main content containers position from the top
		parentPosTop = parseInt( $("#content").position()['top'] ),
		
		// Store the main content containers offset from the top
		parentOffsTop = parseInt( $("#content").offset()['top'] ) + arbOffsTop,
		
		// Store the window height
		windowHeight = $(window).height(),
		
		// Reference used to make toggle of sub section sub indices happen once per sub index.
		lastSubSectionSubIndex_name;
		
		// Make first sub index visible (when page loads)
		if ( !lastSubSectionSubIndex_name ) {
			var firstSubIndex = $('.sub_index').first();
			firstSubIndex.show();
			lastSubSectionSubIndex_name = firstSubIndex.get(0).id;
			$('.sub_index').each(function(index, elm) {
				
				// Hide all but the first sub index
				if ( this.id !== lastSubSectionSubIndex_name ) {
					$(this).hide();
				}
			});
		}
		
		// Handle layout changes related to section tracking during scrolling
		$(document).on('scroll', function(e) {			
			
			var	
				
			// Store the bottom scroll location (how far scrolled + window height)
			scrollBottom = $(window).scrollTop() + windowHeight,
				
			// Store how many pixels have been scrolled including the offset generated by the nav bar
			howFarScrolled = Math.round( Math.abs( $(window).height() - scrollBottom ) + parentOffsTop );
			
			// Iterate over each section object
			for ( var gSec in globalSections ) {
				
				// Filter out non-object properties
				if ( gSec !== "__length" && gSec !== "id" ) {
					
					/** HANDLE SECTION TRACKING **/
					
					// Get the section element id
					var sectionId = globalSections[gSec].id; 
					
					// Get the section and sub section names
					var sectionName = gSec;
					var subSectionName = "";
					
					// Reference currently active section element
					var sectionElm = $("#"+sectionId);
					
					// Calculate the section element offset including its height
					var sectionBottom = parseInt( sectionElm.offset()['top'] + sectionElm.height() );
					var sectionOffsTop = parseInt( sectionElm.offset()['top'] );
					
					// Determine the scroll range a given section has
					var sectionRange = Math.abs(sectionOffsTop - sectionBottom);
					
					// When tracking region is within the bounds of the section				
					if ( howFarScrolled >= 	sectionOffsTop
						 && howFarScrolled <= sectionBottom ) {
						
						// Update page title
						$(document).find('head title').html(baseName + " - " + gSec);
						
						// Toggle tracking styles
						$(".selected").toggleClass('selected');
						$("." + sectionName).toggleClass('selected');
						
						// Display sub section index
						//$("#index").html($("#" + sectionId + " article aside").html());
					
						/** HANDLE SUB SECTION TRACKING **/
						
						// Iterate over each sub section object
						for ( var i = 0; i < globalSections[gSec].length; i++ ) {
							
							if ( jQuery.isPlainObject( globalSections[gSec][i] ) ) {
								
								// Reference the sub section element
								var subSectionElm = $("#"+globalSections[gSec][i].id);				
								var subSectionIndex = $("#"+globalSections[gSec][i].indexId);
								
								// Calculate how far a sub sections bottom is
								var subSectionBottom = parseInt( subSectionElm.offset()['top'] + subSectionElm.height() );
								var subSectionOffsTop = parseInt( subSectionElm.offset()['top'] );
								
								// When tracking region is within the bounds of the sub section
								if ( howFarScrolled >= subSectionOffsTop 
									 && howFarScrolled <= subSectionBottom ) {
									
									// Get the current sub section sub index
									var subSectionSubIndex = $(subSectionIndex.get(0)).parent();
									var thisSubSectionSubIndex_name = subSectionSubIndex.get(0).id;	
									var parent = subSectionIndex.parent();
									
									// Only toggle the sub section sub index when we enter the next sub index
									if ( thisSubSectionSubIndex_name !== lastSubSectionSubIndex_name ) {
										lastSubSectionSubIndex_name = thisSubSectionSubIndex_name;
										
										if ( scrollDirection === "down" ) {
											
											// Reappend the index anchor elements in their starting order
											$("#index").html($("#" + sectionId + " article aside").html());											
										} else if ( scrollDirection === "up" ) {									
										}
										
										// Make sub section sub index the only sub index visible
										$('.sub_index').each(function(index, elm) {
											if ( elm.id === thisSubSectionSubIndex_name ) {
												$(elm).show();
											} else {
												$(elm).hide();
											}
										});
									}

									// Append or prepend "a" to beginning or end of elements to create sub index "scrolling"
									if ( subSectionIndex.get(0).offsetTop > (subSectionIndex.parent().height()) - 24 ) {
										
										// Which direction is the user scrolling?
										if ( scrollDirection === "down" ) {
											var first = parent.find("a:first");
											parent.append(parent.find("a:first"));
										} else if ( scrollDirection === "up" ) {											
											parent.prepend(parent.find("a:last"));
										}
									
									}
									
									// Highlight anchor in index
									subSectionIndex.addClass('selected');
									
								}								
							
							}
							
						}
						
					}

				}

			}
			
		});
		
	};
	
	/**
	 * Function builds documentation template structures.
	 * @param {string} name Name of the documentation base
	 * @param {object} sections Doc sections and sub sections
	 */
	jDoc.buildDocTemplate = function( name, sections, methods ) {
		
		// Set the global base name
		baseName = name;
		
		// Save all our defined sections
		var sectionStack = {};
		
		/** BUILD NAV MENU **/
		
		// Get nav template from HTML
		var newNav = $("#tpl_nav").clone();
		
		// Output the name to the nav title and head title
		newNav.find('.appName').find('a').html(name);
		$(document).find('head title').html(name);
		
		// Get all the sub section data for content insertion below
		var subSectionContent = $("#data div");
		
		// Define a content index so we know which sub section to place our content in
		var contentIndex = 0;

		// Use to set the length property on globalSections object
		var indexLength = 0;

		// Used to access correct area of the `methods` object
		var lastSubSecRef = "";	
			
		// Build template elements	
		for ( var index in sections ) {
			
			/** BUILD SECTION **/
			
			// Get section template from HTML
			var newSection = $("#tpl_section").clone();
			
			// Give new section properly formatted Title
			var sectionTitle = index 
				.replace(/([A-Z])/g, ' $1')
				.replace(/^./, function( str ) { return str.toUpperCase(); });
				
			// Give new section properly formatted Title
			var sectionId = index 
				.replace(/([A-Z])/g, '-$1')
				.replace(/./g, function( str ) { return str.toLowerCase(); });
			
			// Generate properly formatted nav title
			var navTitle = index
				.replace(/([A-Z])/g, ' $1')
				.replace(/^./g, function( str ) { return str.toUpperCase(); });
					
			// Populate nav	
			if ( indexLength == 0 ) {
				newNav.append('<li class="navLink">'
					+ '<a href="#' + sectionId + '_ref' + '" class="'+ sectionId +' selected">' 
					+ navTitle 
					+'</a></li>');
			} else {
				newNav.append('<li class="navLink">'
					+ '<a href="#' + sectionId + '_ref' + '" class="'+ sectionId +'">' 
					+ navTitle 
					+'</a></li>');
			}
			
			// Append a pipe dilemeter after each nav element
			newNav.append('<li class="pipe">|</li>');
			
			// Assign attributes to new section
			newSection.attr({
				id: "section_" + sectionId
			});
			
			// Modify href link reference to match main nav's anchors
			newSection.find("a").attr({
				name: sectionId + "_ref"
			});
			
			// Populate section title text
			newSection.find("h2").html( sectionTitle );

			// Get index template from HTML
			var newIndex = $("#tpl_sub_index").clone();
			
			// Give new index properly formatted ID
			newIndex.attr('id', index);
			
			// This variable holds an iterations subTitle when one exists
			var subTitle = "";
			
			// Now iterate over the sub sections building them from templates. Also
			// we build a global section object which is used to store section specific
			// identifying and dimensional/positional information utilized by our 
			// scroll tracking logic.
			for ( var subSectionIndex in sections[index] ) {
				
				// Reference the subSectionIndex object for faster access
				var subSecRef = sections[index][subSectionIndex];
			
				/** BUILD SUB-SECTIONS **/
			
				// Get section template from HTML
				var newSubSection = $("#tpl_sub_section").clone();
						
				// When a string is passed we build sub section sub categories
				if ( typeof subSecRef === "string" ) {
					
					// Save last subSecRef to access correct area of methods object
					lastSubSecRef = subSecRef;
					
					// Insert sub category title into index
					newIndex.append('<h3>'+subSecRef+'</h3>');
					
					// Assign subTitle a value to be used on next pass
					subTitle = subSecRef;
					
					// Create div which will hold all of the sub section sub categories
					newIndex.append('<div id="sub_section_' + subTitle.toLowerCase() + '_container" class="sub_index"></div>');
				} else {
					
					// When a subTitle exists insert it before the sub section and clear it
					if ( subTitle ) {
						newSubSection.prepend('<h3>'+subTitle+'</h3>');
						subTitle = "";
					}
					
					// Build properly structured sub section id
					var subSectionId = subSecRef.title			
						.replace(/([^\w\s])/g, "")
						.split(" ").join("-")
						.replace(/./g, function( str ) { return str.toLowerCase(); });
						
					// Assign ID attribut to subsection div
					newSubSection.attr({
						id: "sub_section_" + subSectionId,
						class: "sub_section"
					});
					
					// Modify href link reference (should match sub section indices anchors)
					newSubSection.find("a").attr({
						name: index + "_" + subSectionId + "_ref"
					});
				
					
					// When sectionTitle is Methods or API or Documentation we construct different HTML that 
					// is condusive to displaying Method/Function information.
					if ( sectionTitle === ('Methods' || 'API' || 'Documentation') ) {
					
							// Override newSubSection class
							newSubSection.attr({
								id: "sub_section_" + subSectionId,
								class: "sub_section_method"
							});
							var methodName = subSecRef.title;
							var methodInfo = methods[lastSubSecRef.toLowerCase()][methodName];
							
							// Add method header
							newSubSection.find('h4').addClass('method');
							
							// Put HTML around method argument definitions
							var id = 0;
							var carrets = ['<a>', '</a>'];
							var backticks = ['<code>', '</code>'];
							var defString = methodInfo.def;
							methodArgumentDefinition = methodInfo.def.split(",");
							defString = defString.replace(/([a-zA-Z0-9_])/g, "<span class=\"argumentDefinition\"><a>\$1</a></span>");
							defString = defString.replace(/[\*]/g, "<span class=\"argumentAsterisks\">*</span>");
							defString = defString.replace(/[,]/g, '<span class="argumentCommas">,</span>');
							
							// Built "Method Returns" string
							var methodReturnsCheck = [];
							var methodReturnsString = "";
							if ( methodInfo.returns.length <= 1 ) {
								methodReturnsString = methodInfo.returns[0] + ", ";
							} else if ( methodInfo.returns.length > 1 ) {
								for ( var i = 0; i < methodInfo.returns.length; i++ ) {
									var v = methodInfo.returns[i];
									if ( !_.inArray(methodReturnsCheck, v) ) {
										methodReturnsString += v + ", ";
										methodReturnsCheck.push(v);
									}
								}
							}
							methodReturnsString = methodReturnsString.substring(0, methodReturnsString.length-2);
							newSubSection.find('h4').html( 
								"<div>" +
									"<div class=\"float_left methodName\">." + 
										subSecRef.title + "( " + defString + " )" + 
									"</div>" +
									"<div class=\"float_right methodReturns\">Returns: " +
										"<span>" +
											methodReturnsString +
										"</span>" +
									"</div>" +
								"</div>" 
							);
							
							// Add Extended Description information which is hidden until user clicks on a specific method.
							methodInfo.description += "<span class=\"methodShortDescription\">" + methodInfo.description + "</span>" 
											       				 + " <span class=\"methodExtendedDescription\">" + methodInfo.desc_ext + "</span>";
							
							// Build "Method Examples" HTML
							var methodExamples = "";
							
							// Iterate over argument definitions arrays
							for ( var a in methodInfo.args ) {
								var argString = "";
								
								// Iterate over each argument within argument definition arrays
								for ( var i in methodInfo.args[a] ) {
									var methodArgs = methodInfo.args[a][i];
									
									// Alter definitions to be viewable in HTML
									switch ( $.type(methodArgs) ) {
										
										// For each array go through every value to make it HTML viewable
										case "array" :
											for ( var l in methodArgs ) {
												switch ( _.type(methodArgs[l]) ) {
													
													case "null" :
														methodArgs[l] = "null";
														break;
													
													case "undefined" :
														methodArgs[l] = "undefined";
														break;
													
													case "nan" :
														methodArgs[l] = "NaN";
														break;
													
													case "bool" :
														if ( methodArgs[l] === true ) {
															methodArgs[l] = "true";
														} else {
															methodArgs[l] = "false";
														}
														break;
													
													case "string" :
														if ( methodArgs[l] === "" ) {
															methodArgs[l] = "\"\"";
														} else {
															methodArgs[l] = "\"" + methodArgs[l] + "\"";
														}
														break;
												}
											}
											argString += "[" + methodArgs.toString() + "]";
											break;
										
										case "null" :
											argString += "null";
											break;
											
										case "string" :
											if ( methodArgs === "" ) {
												argString += "\"\"";
											} else {
												argString += "\"" + methodArgs + "\"";
											}
											break;
										
										default :
											argString += methodArgs;
									}
									argString += ", ";
								}
								
								// Output Examples HTML
								argString = argString.substring(0, argString.length-2);
								methodExamples += "_." + methodName + "(" + argString + ");\r\n" +
								">> " + methodInfo.resultString[a] + "\r\n";
							}
							
							// Build "Method Aliases" HTML
							var methodAliases = "";
							if ( 'aliases' in methodInfo ) {
								var methodAliasesString = "";
								for ( var a in methodInfo.aliases ) {
									methodAliasesString += methodInfo.aliases[a] + ", ";
								}
								methodAliasesString = methodAliasesString.substring(0, methodAliasesString.length-2);
								methodAliases =
									"<div class=\"methodAliases\">" +
										"<span class=\"title\">Aliases:  </span>" +
										"<span class=\"aliases\">" + 
											methodAliasesString +
										"</span>" +
									"</div>";									
							}
							
							// Output HTML
							newSubSection.append(
								"<div id=\"method_" + methodName + "\">" +
									"<div class=\"methodDescription\">" +
										methodInfo.description.replace(/[`]/g, function() {
											var ret = backticks[id];
											id = 1 - id;
											return ret;
										})
										.replace(/[\^]/g, function() {
											var ret = carrets[id];
											id = 1 - id;
											return ret;											
										}) +
									"</div>" +
								
									// Add Method Aliases
									methodAliases +
									
									// Add Examples Code Block
									"<div class=\"methodExamples\">" +
										"<span class=\"title\">Examples:</span>" +
										"<pre class=\"sh_javascript_dom\">" + 
											methodExamples +		
										"</pre>" +
									"</div>" +
								"</div>"						
							);

					} else {
					
						// Populate sub section title
						newSubSection.find('h4').html(subSecRef.title);
					
						// Pull the sub section content from html data
						newSubSection.append(
							$(subSectionContent[ contentIndex ]).html()
						);
					
					}
					
					// We increment the content index when it's less than content array length
					contentIndex++;
	
					/** BUILD SUB-SECTIONS INDICES **/
					
					// Create new sub section index anchors
					var a = $('<a>', newIndex)
						.attr({
							href: "#" + index + "_" + subSectionId + "_ref",
							id: subSectionId + "_index",
							title: subSecRef.title
						})
						.html(subSecRef.title);
					
					// Append new index anchor in cloned template element
					newIndex.find('#sub_section_' + lastSubSecRef.toLowerCase() + '_container').append(a.get(0));
					
					// Append sub section within section
					newSection.find('article').append( newSubSection.get(0) );
					
					// Populate subSection properties
					sections[index][subSectionIndex].id = "sub_section_" + subSectionId;
					sections[index][subSectionIndex].indexId = subSectionId + "_index";
					sections[index][subSectionIndex].ref = index + "_" + subSectionId + "_ref";
				}
			}
			
			// Set sub section properties
			sections[index].id = "section_" + sectionId;
			
			// Add sub section index element within sub section
			newSection.find('article').append( newIndex.get(0) );
			
			// Output HTML to page
			$("#content").append(newSection.get(0));
			
			// Increment global sections length property
			indexLength++;
			
			// Copy new section object onto temporary global "stack"
			sectionStack[index] = sections[index];
			
			// Push section name onto globalSectionNames stack
			globalSectionNames.push(index);
		}

		// Set length property for global sections object
		sectionStack.__length = indexLength;
		
		// Reverse the presented order of section nav links
		var navLength = $(newNav.get(0)).children().length;
		$.each( $(newNav.get(0)).children(), function(key, value) {
			$(value).parent().prepend(value);
		});
		
		// Remove trailing pipe from section nav links
		newNav.children().first().remove();
		
		// Append our nav template
		$("#nav").html( newNav.get(0) );
		
		// Give the global sections stack a copy of the section stack
		globalSections = sectionStack;
		
		// Take all <h3> tags that are within sections (the sub-titles) and place them
		// as DOM siblings before the section.
		$("article div").find("h3").each(function(index, value) {
			$(this).parent().before(this); 
		});

		// Reform sub section indices if they're a greater height than the window
		jDoc.cropOverflows();
		
		// Attach scroll event handler to newly created template
		jDoc.trackScroll();
		
		//console.log(globalSections);
	};
	 
	/**
	 * Function "crops" overflowed index divs
	 */
	jDoc.cropOverflows = function() {
		var indexDivs = $('.sub_index');
		var subIndexHeight = $(window).height();

		$.each(indexDivs, function(index, elm) {
			var target = $("#"+elm.id);
			var subIndexTopOffset = target.height;
			target.css({
				"position" : "relative",
				"max-height" : 500 + "px",
				"overflow" : "hidden"
			});
			
			// Inser overflow elipsis indicator
			//target.append('<div class="overflow_indicator">...</div>');
			
		});
		
	};
	
	// Handle dynamic navigation border layout change during scroll event
	$(document).on('scroll', function(e) {
		var doc = $(document),
			sep = $("#separator"),
			nav = $("#nav"),
			doc_pos = doc.scrollTop(),
			sep_pos = sep.position()['top'],
			nav_height = nav.height();
		if ( ( doc_pos + nav_height ) > sep_pos ) {
			sep.css({
				width: '100%',
				position: 'fixed',
				top: nav_height + 'px',
				left: 0 + 'px'
			});
		} else if ( doc_pos <= 0 ) {
			sep.css({
				width: $("#content").width(),
				position: 'absolute',
				top: $("#content").position()['top'] + 'px',
				left: $("#content").position()['left'] + 'px'
			});
		}		
	});

});