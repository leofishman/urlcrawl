var request = require('request'),
	cheerio = require('cheerio');

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

var error = {};
error.error = false;

var links = [];

function check_url_valid(url2check) {
    if (validUrl.isUri(url2check)){
        return true;
    } else {
		error.error = true;
		error.description = url2check + ' is not a valid url';
        return false;
    }
}

function url_seed(url2scrap) {
	request({url: url2scrap, encoding: 'binary'}, function(err, resp, body){
		if(!err && resp.statusCode == 200){
			var $ = cheerio.load(body);
			$('a').each(function(){
				//console.log($(this).attr('href'));
				link = {'url': $(this).attr('href'),'father_url':url2scrap, 'deep': depth};
				if (depth < argv.depth) {
					depth++;
					url_seed(link.url);
				} 
				links.push(link);
				console.log(link);
			});
			console.log(links);
		} else {
			error.error = true;
			error.description = url2scrap + ':: ' + err.message;
		}
	});
}
 

if (command === 'crawl') {
	var url2seed = argv.url;
	if (check_url_valid(url2seed)) {
		// we let the user know the app started
		console.log('crwal started at: ' + url2seed + ' ' + argv.depth + ' levels deep');
		// create the first link in the links array
		depth = 0;
		var link = {'url': url2seed,'description':'we start crawling from here','father_url':url2seed,'deep':depth};
		links.push(link);
	} else {
		//console.log(url2seed + ' is in invalid url');
		console.log(error);
	} 
} else {
		error.error = true;
		error.description = command + ' command not found :(';		
		console.log(error);
}

// we let the user know the app finished as soon as we can make it work asyncronic
if (!error.error) {
	url_seed(url2seed);
	//console.log(links);
	//console.log(link);
	console.log('thanks for using urlcrawl');
} else {
	console.log('sorry, we couldn\'t crawl the url: ' +  url2seed + ' because ' + error.description);
}

