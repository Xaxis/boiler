$(document).ready(function(e) {
	
	// jDoc namespace
	var jDoc = jQuery.fn;
	
	// Save a reference to all of our defined sections
	var globalSections = {};
	
	// Save a reference to all the section names in an array
	var globalSectionNames = [];
	
	// A place to reference our name
	var baseName = "";
	
	// Reference used to indicate scrolling was triggered by the scrollTo function and
	// not the user scrolling themseves (used in the trackScroll function)
	var scrollHow = "";
	
	/**
	 * When there is a hash tag in the URL expand that sectoin and make sure the tracking
	 * index is highlighted, otherwise trigger 5 pixel scroll.
	 */
	setTimeout(function() {
		if ( window.location.hash.split("#").length > 1 ) {
			var hash = window.location.hash.replace(/#/g, "");
			var sectionTarget = $("div a[name="+window.location.hash.replace(/#/g, "")+"]");
			sectionTarget.attr('href', "#" + hash);
			scrollTo({machine: true, name: hash, currentTarget: sectionTarget.get(0), preventDefault: _.identity});
		} else {
			$('html, body').animate({
				scrollTop: 5
			}, 250);
		}
	}, 1);
	
	/**
	 * Returns the offset relative to the bottom of the window of the first matched element
	 */
	jDoc.offsetBottom = function() {
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
	jDoc.center = function( how ) {
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
	
	/**
	 * Handle dynamic navigation border layout change during scroll event
	 */
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
	
	/**
	 * Handle the section's click event
	 */
	var toggleSection = function(e) {
		var duration = 350;
		var section = $(e.currentTarget);
		var description = $(e.currentTarget).find('.methodExtendedDescription, .entryExtendedDescription').show(); 
		var examples =  $(e.currentTarget).find('.methodExamples');
		var returns = $(e.currentTarget).find('.methodReturns');
		var aliases =  $(e.currentTarget).find('.methodAliases');
		var showOrNo = description.css('opacity') === "0" ? true : false;
		if ( showOrNo ) {
			$('.elipsis').remove();	
			$(e.currentTarget).addClass('open');
			description.css({position:'relative'});
			description.animate({opacity: 1}, duration);
			returns.animate({height: "toggle", opacity: "toggle"}, duration);
			aliases.animate({height: "toggle", opacity: "toggle"}, duration);
			examples.animate({height: "toggle", opacity: "toggle"}, duration);
		} else {
			$(e.currentTarget).removeClass('open');
			$(description, examples).animate({opacity: 0}, duration, function() {
				returns.animate({height: "toggle", opacity: "toggle"}, duration);
				aliases.animate({height: "toggle", opacity: "toggle"}, duration);
				examples.animate({height: "toggle", opacity: "toggle"}, duration);
				description.css({position:'absolute', top:'0'});
				description.animate({height: "toggle"}, duration);
				section.append(sectionElipsis);
			});
		}
	};
	
	/**
	 * Handle smooth scrolling to clicked links
	 */
	var scrollTo = scrollToTarget = function(e) {
		scrollHow = "machine";
		
		if ( 'machine' in e ) {
			var name = e.name;
		} else {
			e.preventDefault();
			var name = $(e.currentTarget).attr('href').replace(/^#/g, "");
		}
		var currentTarget = e.currentTarget;
		var target = $('[name="'+name+'"]');
		var padding = 0;
		var once = true;
		
		// Padding when index title nav
		if ( $(e.currentTarget).hasClass('sub_section_a') ) {
			padding = 90;
				
		// No padding when main section nav
		} else if ( $(e.currentTarget).hasClass('section_ref_nav') ) {
			padding = 0;
			
		// Padding when index links directly
		} else {
			padding = 20;
		}
		
		// Scroll to the target location at targetPosition
		var targetPosition = Math.abs(parseInt(target.offset().top)) + padding;
		$('html, body').animate({
			scrollTop: targetPosition
		}, 250, function() {
			
			// Set current hash location
			var hashTag = target.parent().find("a").get(0).name;
			window.location.hash = "#" + hashTag;

			// Expand the section after we arrive at it
			if ( once && 
			     ($(currentTarget).hasClass('sub_section_anchor') || $(currentTarget).hasClass('sub_sec_ref') || $(currentTarget).hasClass('sub_section_a')) 
					 && !$(target.parent().get(0)).hasClass('open') ) {				
								
				// Make sure the tracking index is highlighted
				if ( !$("a[href=#"+hashTag+"]").hasClass('sub_section_a') ) {
					$("a[href=#"+hashTag+"]").addClass('selected');
				}
				
				// Toggle the selected section
				var e = {currentTarget: target.parent().get(0)};
				toggleSection(e);
				once = false;
			}
		});
	};
	
	/**
	 * Bind smooth scrolling handler
	 */
	$(document).on("click", ".sub_section_anchor, .section_ref_nav, .sub_section_a", scrollTo);
	
	/**
	 * Bind event handler that allows for closing and expanding the sub section indices
	 */
	$(document).on("click", ".sub_section_a", function(e) {
		e.preventDefault();
		var target = $(e.currentTarget);
		if ( !target.hasClass('open') && target.parent().next("div").css('display') === 'none' ) {
			target.parent().next("div").animate({height: "toggle", opacity: "toggle"}, 850);
			target.addClass('open');
		} else if ( !target.hasClass('open') ) {
			target.parent().next("div").animate({height: "toggle", opacity: "toggle"}, 850);
			target.removeClass('open');			
		}
	});
		
	/**
	 * Function tracks page scroll location and associates that location to
	 * defined navigational indices.
	 */
	jDoc.trackScroll = function() {

		// Track which direction the window is scrolling
		var startPosition = $(window).scrollTop();
		var scrollDirection = "";
	
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
				
				// Iterate through informational objects to obtain positional data
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
		
		// References used to make toggle of section/sub section sub indices happen once per sub index.
		lastSubSectionSubIndex_name,
		lastSection_name,
		
		// References used to toggle changes to selected the sub section 
		thisSubSection_name,
		lastSubSection_name;
		
		// Update positional elements on page resize
		$(window).on("resize", function() {
			parentPosTop = parseInt( $("#content").position()['top'] );
			parentOffsTop = parseInt( $("#content").offset()['top'] ) + arbOffsTop;
			windowHeight = $(window).height();
		});
		
		// Handle layout changes related to section tracking during scrolling
		$(document).on('scroll', function(e) {
			
			// Track which direction we're scrolling
			var scroll = $(window).scrollTop();
			if ( scroll > startPosition ) {
				scrollDirection = "down";
			} else {
				scrollDirection = "up";
			}
			startPosition = scroll;
			
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
					
					// Get the section name
					var sectionName = gSec;
					
					// Reference currently active section element
					var sectionElm = $("#"+sectionId);
					
					// Calculate the section element offset including its height
					var sectionBottom = parseInt( sectionElm.offset()['top'] + sectionElm.height() );
					var sectionOffsTop = parseInt( sectionElm.offset()['top'] );

					// Determine the scroll range a given section has
					var sectionRange = Math.abs(sectionOffsTop - sectionBottom);
					
					// When tracking region is within the bounds of the section				
					if ( howFarScrolled >= 	sectionOffsTop && howFarScrolled <= sectionBottom ) {
						
						// Update page title
						$(document).find('head title').html(baseName + " - " + gSec);
						
						// Toggle tracking styles
						$('.navLink a').removeClass('selected');
						$("." + sectionName.toLowerCase()).addClass('selected');
						
						/** HANDLE SUB SECTION TRACKING **/
						
						// Iterate over each sub section object
						for ( var i = 0; i < globalSections[gSec].length; i++ ) {
							
							if ( jQuery.isPlainObject( globalSections[gSec][i] ) ) {
								
								// Reference the sub section element
								var subSectionElm = $("#"+globalSections[gSec][i].id);				
								var subSectionIndex = $("#"+globalSections[gSec][i].indexId);
								
								// Reference the subSection ID
								var subSection = "#sub_section_" + subSectionIndex.get(0).id.replace(/_index$/g, "");
								
								// Get the current sub section sub index
								var subSectionSubIndex = $(subSectionIndex.get(0)).parent();
	
								// This block of code makes it so the correct sub section index is open even if we have not
								// entered within its region when scrolling. Makes transitions between regions more fluid when
								// we are a couple pixels off from entering the region. Additionally we need to make sure to 
								// reload the section indices once per iteration.
								if ( sectionName !== lastSection_name ) {

									// Update the lastSection_name with current section
									lastSection_name = sectionName;
									
									// Load the intended section index
									$("#index").html($("#" + sectionId + " article aside").html());
										
									if (  scrollDirection === "down" ) {
										$("#index").find("div:first").show();
									} else if ( scrollDirection === "up" ) {
										$("#index").find("div:last").show();
									}
								}
							
								// Calculate how far a sub sections bottom is
								var subSectionBottom = parseInt( subSectionElm.offset()['top'] + subSectionElm.height() );
								var subSectionOffsTop = parseInt( subSectionElm.offset()['top'] );
								
								// When tracking region is within the bounds of the sub section
								if ( howFarScrolled >= subSectionOffsTop 
									 && howFarScrolled <= subSectionBottom ) {
									var thisSubSectionSubIndex_name = subSectionSubIndex.get(0).id;	
									var parent = subSectionIndex.parent();
									
									// Make sure the sub section sub index is open, if it's not, open it during scroll
									if ( parent.css('display') === 'none' ) {
										parent.show();
									}
										
									// Only toggle the sub section sub index when we enter the next sub index
									if ( thisSubSectionSubIndex_name !== lastSubSectionSubIndex_name ) {
									
										// Update which sub index we're in
										lastSubSectionSubIndex_name = thisSubSectionSubIndex_name;
										
										// When scrolling down reappend the indices as they were created
										if ( scrollDirection === "down" ) {
											$("#index").html($("#" + sectionId + " article aside").html());
											
										// When scrolling up restructure the order of the indices with the last selected
										// index starting at the bottom of the section.									
										} else if ( scrollDirection === "up" ) {
											
											// Each section index contains 25 elements. When that index has overflowed we append all but
											// the last 25 elements to the bottom to create the illusion of sub section "scrolling".
											if ( parent.height() >= 500 ) {
												var children = parent.find("a");
												children = children.slice(0, children.length-25);
												parent.append(children);
											}
										}
										
										// Make sub section sub index the only sub index visible and mark the title link by giving
										// the class of .open when current and remove .open when not
										$('.sub_index').each(function(index, elm) {
											if ( elm.id === thisSubSectionSubIndex_name ) {
												$(elm).show();
												$(elm).prev("h3").children("a:first").addClass('open');
											} else {
												$(elm).hide();
												$(elm).prev("h3").children("a:first").removeClass('open');
											}
										});
									}

									// When a sub section sub index is greater than 500 pixels we implement "sub scrolling" which
									// creates the illusion of scrolling a sub section's sub indices in congruence with the window scrolling.
									if ( parent.height() >= 500 ) {
									
										// Start sub section sub index scrolling when we begin to track an "overflowed" anchor. This is done by
										// appending or prepending the anchors to beginning or end of elements to create sub index "scrolling"
										if ( (subSectionIndex.get(0).offsetTop > (subSectionIndex.parent().height()) - 20) ) {
											
											// Which direction is the user scrolling?
											if ( scrollDirection === "down" ) {
												var first = parent.find("a:first");
												parent.append(first);
											} else if ( scrollDirection === "up" ) {
												if ( scrollHow === "machine" ) {
													scrollHow = "user";
													$("#index").html($("#" + sectionId + " article aside").html());
												} else {
													var last = parent.find("a:last");		
													parent.prepend(last);
												}
											}
										}
									}
									
									// Once per transition to next sub section apply stylistic changes		
									thisSubSection_name = subSection;
									if ( thisSubSection_name !== lastSubSection_name ) {
									
										// Only target a last subSection when one is defined
										if ( lastSubSection_name ) {
										
											// Toggle highlight corresponding anchor for index tracking
											$('.sub_section_anchor').removeClass('selected');
										
											// Add selected class to the index corresponding to the sub section
											subSectionIndex.addClass('selected');
										
											// Toggle section opacity to the corresponding sub section
											$(lastSubSection_name).animate({opacity: 0.3}, 250);
											$(lastSubSection_name).removeClass('section_selected');
										}
										
										// Update the last sub section name reference
										lastSubSection_name = thisSubSection_name;
										
										// Toggle section opacity to the corresponding sub section
										$(subSection).animate({opacity: 1.0}, 250);
										$(subSection).addClass('section_selected');
									}
									
								}								
							
							}
							
						}
						
					}

				}

			}

		});
		
	};
	
	/**
	 * Produces a HTML viewable argument string from arguments to be passed to a JavaScript function
	 */
	function parseArgumentString( argument, argumentString ) {
		var argumentString = "";
		
		// Parse RESULT STRING based on type
		switch ( _.type(argument) ) {
			
			// For arrays parse each value 
			case "array" :
				for ( var a in argument ) {
					switch ( _.type(argument[a]) ) {
						case "object" :
							argument[a] = JSON.stringify(argument[a]);
							argument[a] = argument[a].replace(/[\"]([0-9])[\"]/g, "\$1").replace(/\,\"/g, ', "');
							break;
						case "null" :
							argument[a] = "null";
							break;	
						case "undefined" :
							argument[a] = "undefined";
							break;		
						case "nan" :
							argument[a] = "NaN";
							break;			
						case "bool" :
							if ( argument[a] === true ) {
								argument[a] = "true";
							} else {
								argument[a] = "false";
							}
							break;		
						case "string" :
							if ( argument[a] === "" ) {
								argument[a] = "\"\"";
							} else {
								argument[a] = "\"" + argument[a] + "\"";
							}
							break;	
						case "array" :
							argument[a] = parseArgumentString(argument[a]);
							break;
					}
				}
				argumentString = "[" + argument.toString() + "]";
				break;
				
			case "object" :
				argumentString = JSON.stringify(argument);
				argumentString = argumentString.replace(/[\"]([0-9])[\"]/g, "\$1").replace(/\,\"/g, ', "').replace(/\:/g, ": ");
				break;	
			case "string" :
				if ( argument === "" ) {
					argumentString = "\"\"";
				} else {
					argumentString = "\"" + argument + "\"";
				}
				break;
			case "number" :
				argumentString = argument;
				break;
			case "undefined" :
				argumentString = "undefined";
			default :
				argumentString = argument.toString();
		}
		
		return argumentString;
	}
	
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
			var sectionTitle = index;
				
			// Give new section properly formatted Title
			var sectionId = index.toLowerCase();
			
			// Generate properly formatted nav title
			var navTitle = index;
					
			// Populate nav	
			if ( indexLength == 0 ) {
				newNav.append('<li class="navLink">'
					+ '<a href="#' + sectionId + '_ref' + '" class="'+ sectionId +' section_ref_nav selected">' 
					+ navTitle 
					+'</a></li>');
			} else {
				newNav.append('<li class="navLink">'
					+ '<a href="#' + sectionId + '_ref' + '" class="'+ sectionId +' section_ref_nav">' 
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
			newSection.find("h2").html( sectionTitle ).addClass('h2_wrapper');

			// Get index template from HTML
			var newIndex = $("#tpl_sub_index").clone();
			
			// Give new index properly formatted ID
			newIndex.attr('id', index);
			
			// This variable holds an iterations subTitle when one exists
			var subTitle = "";
			
			// Now iterate over the sub sections building them from templates. Also we build a global section 
			// object which is used to store section specific identifying and dimensional/positional information 
			// utilized by our scroll tracking logic.
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
					newIndex.append('<h3><a href="#' + subSecRef.toLowerCase() + '_ref" class="sub_section_a">'+subSecRef+'</a></h3>');
					
					// Assign subTitle a value to be used on next pass
					subTitle = subSecRef;
					
					// Create div which will hold all of the sub section sub categories
					newIndex.append('<div id="sub_section_' + subTitle.toLowerCase() + '_container" class="sub_index"></div>');
					
				} else {
					
					// When a subTitle exists insert it before the sub section and clear it
					if ( subTitle ) {
						var ref = '<a name="' + subTitle.toLowerCase() + '_ref" class="sub_sec_ref"></a>';
						newSubSection.prepend(
							'<h3 class="h3_wrapper">'+ref+subTitle+'</h3>'
						);
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
					newSubSection.find("> a").attr({
						name: index + "_" + subSectionId + "_ref"
					});
				
					
					// When sectionTitle is Methods or API or Documentation we construct different HTML that 
					// is condusive to displaying Method/Function information.
					if ( sectionTitle === 'API' ) {
							
							// Override newSubSection class
							newSubSection.attr({
								id: "sub_section_" + subSectionId,
								class: "sub_section sub_section_method section_overlay"
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
							defString = defString.replace(/([a-zA-Z0-9_]+)/g, "<span class=\"argumentDefinition\"><a>\$1</a></span>");
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
									"<div class=\"float_left methodName\">" + 
										subSecRef.title + "<span class=\"argumentParens\">( " + defString + " )</span>" + 
									"</div>" +
									"<div class=\"float_right\">" +
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
								var argString = parseArgumentString( methodInfo.args[a] );
								argString = argString.replace(/^\[|\]$/g, '').replace(/,/g, ', ');
								
								/*
								// Iterate over each argument within argument definition arrays
								for ( var i in methodInfo.args[a] ) {
									var methodArgs = methodInfo.args[a][i];
									
									// Alter definitions to be viewable in HTML
									switch ( $.type(methodArgs) ) {
										
										// For each array go through every value to make it HTML viewable
										case "array" :
											for ( var l in methodArgs ) {
												switch ( _.type(methodArgs[l]) ) {
													case "object" :
														methodArgs[l] = JSON.stringify(methodArgs[l]);
														methodArgs[l] = methodArgs[l].replace(/[\"]([0-9])[\"]/g, "\$1").replace(/\,\"/g, ', "');
														break;
													case "array" :
														if ( !_.len(methodArgs[l]) ) {
															methodArgs[l] = "[]";
														} else {
														}
														break;							
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
											argString += "[" + methodArgs.toString().replace(/,/g, ', ') + "]";
											break;
										case "object" :
											var objString = JSON.stringify(methodArgs);
											objString = objString.replace(/[\"]([0-9])[\"]/g, "\$1").replace(/\,\"/g, ', "').replace(/\:/g, ": ");
											argString += objString;
											break;				
										case "null" :
											argString += "null";
											break;
										case "undefined" :
											argString += "undefined";
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
								*/
								
								// !!! Temporary hack to get the styling to work in firefox
								if ( !methodInfo.resultString ) {
									methodInfo.resultString = [0,0,0,0,0,0,0,0,0,0,0];
								} 
								
								// Output Examples HTML
								if ( _.isArray(methodInfo.originalResults[a]) || _.isPlainObject(methodInfo.originalResults[a]) ) {
									var expandoObject = jDoc.expando(true, methodInfo.originalResults[a]);
									methodExamples += 
										'<pre class="sh_javascript_dom" contenteditable="true">' + "_." + methodName + "(" + argString + ")</pre>" +
										'<span class="result_output"> > ' + methodInfo.resultString[a].replace(/\,\"/g, ', "') + "</span>" +
										expandoObject[0].outerHTML;
								} else {
									methodExamples += 
										'<pre class="sh_javascript_dom" contenteditable="true">' + "_." + methodName + "(" + argString + ")</pre>" +
										'<span class="result_output"> > ' + methodInfo.resultString[a] + '</span><br>';
								}
							}
							
							// Build "Method Returns" HTML
							var methodReturns = 
								"<div class=\"methodReturns\">" +
									"<span class=\"title\">Returns:  </span>" +
									"<span class=\"returns\">" + 
										methodReturnsString +
									"</span>" +
								"</div>";		
								
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
								
									// Add Method Returns
									methodReturns +
									
									// Add Method Aliases
									methodAliases +
									
									// Add Examples Code Block
									"<div class=\"methodExamples\">" +
										"<span class=\"title\">Examples:</span>" +
										'<div class="codeBlock">' + 
											methodExamples +		
										'</div>' + 
									"</div>" +
								"</div>"						
							);

					} else {
						var entryName = subSecRef.title;
						var id = 0;
						var carrets = ['<a>', '</a>'];
						var backticks = ['<code>', '</code>'];
							
						// Override newSubSection class
						newSubSection.attr({
							id: "sub_section_" + subSectionId,
							class: "sub_section sub_section_entry"
						});
						
						// Add entry header
						newSubSection.find('h4').addClass('entry');
						newSubSection.find('h4').html( 
							"<div>" +
								"<div class=\"float_left entryName\">" + 
									subSecRef.title + 
								"</div>" +
							"</div>" 
						);
						
						// Add Extended Description information which is hidden until user clicks on a specific entry
						subSecRef.description += "<span class=\"entryShortDescription\">" + subSecRef.description + "</span>" 
											       			+ "<span class=\"entryExtendedDescription\"> " + subSecRef.desc_ext + "</span>";
																	
						// Output HTML
						newSubSection.append(
							'<div id="entry_' + subSectionId + '" class="entryDescription">' +
								subSecRef.description.replace(/[`]/g, function() {
									var ret = backticks[id];
									id = 1 - id;
									return ret;
								})
								.replace(/[\^]/g, function() {
									var ret = carrets[id];
									id = 1 - id;
									return ret;											
								})
								.replace(/(\<\%[0-9]\%\>)/g, function(all, pre) {
									var index = pre.match(/[0-9]/g, "\$1")[0];
									return "<div class=\"entryExamples\">" + 
										"<span class=\"title\">" + subSecRef.examples[index].title + "</span>" +
										"</div>" +
										'<div class="codeBlock">' + 
											"<pre class=\"sh_javascript_dom\">" + subSecRef.examples[index].code + "</pre>" +
											'<span class="result_output"> > ' + subSecRef.examples[index].result + '</span>' +
										'</div>'
								}) +
							"</div>"				
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
							title: subSecRef.title,
							class: 'sub_section_anchor'
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
		$("#nav").prepend(newNav.get(0));
		
		// Give the global sections stack a copy of the section stack
		globalSections = sectionStack;
		
		// Take all <h3> tags that are within sections (the sub-titles) and place them
		// as DOM siblings before the section.
		$("article div").find("h3").each(function(index, value) {
			$(this).parent().before(this); 
		});
		
		// Take all divs with class .sub_index and add the class .first to the first child
		// and add the class .last to the last child. These classes are used as boundaries for
		// the sub section sub index scrolling effect.
		$('.sub_index a:first-child').addClass('first');
		$('.sub_index a:last-child').addClass('last');

		// Set max-height, position, and overflow on all section indices
		$.each($('.sub_index'), function(index, elm) {
			$(elm).css({
				"position" : "relative",
				"max-height" : 500 + "px",
				"overflow" : "hidden"
			});
		});
		
		// Attach scroll event handler to newly created template
		jDoc.trackScroll();
	};
	
	/**
	 * Method creates expandable menus from JavaScript arrays and objects
	 * @param {element} attachTo
	 * @param {object|array} obj
	 */			
	jDoc.expando = function( attachTo, obj ) {
	
		// Nest `obj` in parent array
		var orig_obj = obj;
		if ( _.isPlainObject(obj) || _.isArray(obj) ) {
			obj = [obj];
		}
		
		var create = function( obj ) {
	
			// Create parent expando UL
			var UL = $('<ul>');
			
			// If this is the first iteration set the expando class on the parent UL
			if ( once ) {
				UL.addClass('expando');
				
				// Build first level title
				var parsedTitle = "";
				if ( _.type(orig_obj) === "array" ) {
					parsedTitle = '<span class="expando_main_title">[ ';
				} else if ( _.type(orig_obj) === "object" ) {
					parsedTitle = '<span class="expando_main_title">Object { ';
				}
				$.each(orig_obj, function(index, value) {
					parsedTitle += '<span class="expando_index">' + index + '</span>: ';
					switch ( _.type(value) ) {
						case "undefined" :
							parsedTitle += '<span class="expando_value_undefined">undefined</span>' + ', ';
							break;
						case "bool" :
							if ( value ) {
								value = "true";
							} else {
								value = "false";
							}
							parsedTitle += '<span class="expando_value_bool">'+value+'</span>' + ', ';
							break;
						case "null" :
							parsedTitle += '<span class="expando_value_null">null</span>' + ', ';
							break;
						case "number" :
							parsedTitle += '<span class="expando_value_number">'+value+'</span>' + ', ';
							break;
						case "nan" :
							parsedTitle += '<span class="expando_value_nan">'+value+'</span>' + ', ';
							break;
						case "string" :
							if ( value === "" ) {
								value = "\"\"";
							} else {
								value = "\"" + value + "\"";
							}
							parsedTitle += '<span class="expando_value_string">'+value+'</span>' + ', ';
							break;
						case "array" :
							var type = _.type(value);
							parsedTitle += type.charAt(0).toUpperCase() + type.slice(1) + '[' + value.length + ']' + ', ';;
							break;
						case "object" :
							var type = _.type(value);
							parsedTitle += type.charAt(0).toUpperCase() + type.slice(1) + ', ';;
							break;
						default :
							parsedTitle += value;
					}
				});
				parsedTitle = parsedTitle.substring(0, parsedTitle.length-2);
				if ( _.type(orig_obj) === "array" ) {
					parsedTitle += ' ]</span>';
				} else if ( _.type(orig_obj) === "object" ) {
					parsedTitle += ' }</span>';
				}
				once = false;
			}
			
			// Populate UL with LIs
			_.each(obj, function(index, value) {
				
				// Call method recursively for every array and object
				if ( _.isArray(value) || _.isPlainObject(value) ) {
					
					// Build title for menu when it is closed based on the type it represents (array or object)
					var type = _.type(value);
					var title = type;
					
					if ( parsedTitle ) {
						title = parsedTitle;
					} else {
						if ( title === "array") {
							title = title.charAt(0).toUpperCase() + title.slice(1) + '[' + value.length + ']';
						} else if ( title === "object" ) {
							title = title.charAt(0).toUpperCase() + title.slice(1);
						}
					}
					
					// Modify positional CSS
					var LI = $('<li>')
						.css({
							'position': 'relative'
						})
						.addClass('expando_'+type);
					
					// Append menu HTML and data
					if ( parsedTitle ) {
						LI.append(
							'<div class="expando_arrow expando_arrow_right toggled"></div>'
							+ '<span class="expando_title">' + title + '</span>'
						);
					} else {
						LI.append(
							'<div class="expando_arrow expando_arrow_right toggled"></div>' +
							'<span class="expando_index">' + index + '</span>: ' 
							+ '<span class="expando_title">' + title + '</span>'
						);
					}
					
					// Recurse to return value
					LI.append(create(value));
					
					// Append LI in parent UL
					UL.append(LI);
				} else {
					var parsedValue = "";
					switch ( _.type(value) ) {
						case "undefined" :
							parsedValue = '<span class="expando_value_undefined">undefined</span>';
							break;
						case "bool" :
							if ( value ) {
								value = "true";
							} else {
								value = "false";
							}
							parsedValue = '<span class="expando_value_bool">'+value+'</span>';
							break;
						case "null" :
							parsedValue = '<span class="expando_value_null">null</span>';
							break;
						case "number" :
							parsedValue = '<span class="expando_value_number">'+value+'</span>';
							break;
						case "nan" :
							parsedValue = '<span class="expando_value_nan">'+value+'</span>';
							break;
						case "string" :
							if ( value === "" ) {
								value = "\"\"";
							} else {
								value = "\"" + value + "\"";
							}
							parsedValue = '<span class="expando_value_string">'+value+'</span>';
							break;
						default :
							parsedValue = value;
					}
					UL.append('<li><span class="expando_index">' + index + '</span>: ' + parsedValue + '</li>');
				}
				
			});
			
			return UL;
		};
		
		// When element is passed append created menus to it
		if ( attachTo ) {
			var once = true;
			var menus = create(obj);
			return menus;
		} else {
			
			// Initially, create the top level container
			var container = $('<div class="expando_parent">')
				.css({
					width 			: "800px",
					height 			: "800px",
					border 			: "1px solid black",
					background 	: "#FFF",
					"z-index" 	: "9999",
					position 		: "fixed",
					top 				: "50px",
					left 				: "50px",
					display			: "none"
				});
		
			// Return the created menus
			var once = true;
			var menus = create(obj);
			
			// Insert expando HTML
			container.append(menus);
			$("body").append(container);
		}
	
	}
	
});