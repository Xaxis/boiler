<?php

// Set error reporting
ini_set('error_reporting', 0);

// Reference data sent from client
$method = empty($_POST['method']) ? false : $_POST['method'];
$files = empty($_POST['files']) ? false : $_POST['files'];
$dirs = empty($_POST['dirs']) ? false : $_POST['dirs'];
$types = empty($_POST['types']) ? false : $_POST['types'];

// Save all output to be sent to the client here 
$output = false;

// Respond to a given "method" request
switch ( $method ) {

	// We should only call the register method initially when we're establishing 
	// which files we would like to track. Doing so will make things faster (like
	// when we're registering multiple files recursively, these files only need to 
	// be searched for and found one time.
	case 'register' :

		$output = parseFilesToJSON(
			array_merge( 
				getFiles( $files ),
				recursiveGetFilesByType( $dirs, $types )
			)
		);

		// Send back to client
		echo $output;

		break;

	case 'poll' :
		break;
}

/**
 * Function parses found files into proper JSON string
 * @param {Array} files The files to parse
 * @return {String} JSON string
 */
function parseFilesToJSON( $files ) {

	if ( is_string($files) ) {
		$files_arr = explode(" ", $files);
	} else {
		$files_arr = $files;
	}

	// Place to store files modification times
	$files_m_time = array();

	// Iterate over all files
	foreach ( $files_arr as $file ) {

		// Get time file was last modified
		$m_time = filemtime( $file );

		// Associate timestamp to file and push into array
		array_push( $files_m_time, 
				array( 'name' => $file,
					   'm_time' => $m_time 
			) 
		);
	}

	// JSONify and return results
	return json_encode( $files_m_time );
}

/**
 * Function retrieves all specified files
 * @param {String} paths Paths of files 
 * @return {String} JSON string
 */
function getFiles( $paths ) {

	$paths = is_string($paths) ? explode(" ", $paths) : $paths;
	$files = array();

	foreach ( $paths as $path ) {

		// Get all files
		$files_arr = glob( $path );

		// Place all files in array
		foreach ( $files_arr as $filename ) {
			array_push($files, $filename);
		}
	}

	// JSONify and return results
	return $files;
}
//$files = getFiles('index.html refresh.js refresh.css', 'css');

/**
 * Function recursively retrieves all files in a directory structure
 * of a specified type (file extension).
 * @param {String} path The directory path to search
 * @param {String} type A space delimited list of file extentions 
 *		-Such as: "css js php"
 *		-Passing "*" will return all file types
 * @return {Array} Paths to files
 */
function recursiveGetFilesByType( $paths, $types ) {
	$types = explode(" ", $types);
	$files = array();
	$paths = is_string($paths) ? explode(" ", $paths) : $paths;

	// Iterate over each directory path
	foreach ( $paths as $path ) {

		// If a path is empty use the current working directory
		$path = !empty($path) ? $path : getcwd();

		// Reference directories to iterate		
		$directories = new RecursiveDirectoryIterator($path);

		// Iterate over each directory pushing files of $type onto return array
		foreach ($dir = new RecursiveIteratorIterator($directories) as $filename => $file) {
			if ( $types[0] == "*" ) {
				array_push($files, $filename);
			}
			else if ( in_array(strtolower(array_pop(explode('.', $filename))), $types) ) {
				array_push($files, $filename);
			}
		}

	}

	return $files;
}
//$files = recursiveGetFilesByType('../../../../../themes', 'css');
?>