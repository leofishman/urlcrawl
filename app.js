// we let the user know the app started
console.log('starting url crawl on:');
var error = {};
error.error = false
// in order to check validities of url, spetialy the seed
var validUrl = require('valid-url');

// yargs to read commands and parameters
var argv = require('yargs')
	.command('crawl', 'Create a new crawl seed', function (yargs) {
		yargs.options({
			url: {
				demand: true,
				alias: 'u',
				description: 'url to crawl, must begin with http(s)://',
				type: 'string'
			},
			depth: {
				demand: false,
				default: 3,
				alias: 'd',
				description: 'how deep shall we go nesting from the original usrl seed? (default = 3)',
				type: 'number'
			}			
		}).help('help');
	})
	.help('help')
	.argv;
var command = argv._[0];



function check_url_valid(url2check) {
    if (validUrl.isUri(url2check)){
        return true;
    } else {
		error.error = true;
		error.description = url2check + ' is not a valid url';
        return false;
    }
}

if (command === 'crawl') {
	var url2seed = argv.url;
	if (check_url_valid(url2seed)) {
		console.log('crwal started at: ' + url2seed + ' ' + argv.depth + ' levels deep');
	} else {
		//console.log(url2seed + ' is in invalid url');
		console.log(error);
	} 
} else {
		error.error = true;
		error.description = command + ' command not found :(';		
		console.log(error);
}


/*
var url2check = "https://google";

if (check_url_valid(url2check)) {
	console.log(url2check + ' is a valid url');
} else {
	console.log(url2check + ' is an invalid url');
}
* */

 
// we let the user know the app finished
if (!error.error) {
	console.log('thanks for using urlcrawl');
} else {
	console.log('sorry, we couldn\'t crawl the url: ' +  url2seed + ' because ' + error.description);
}

