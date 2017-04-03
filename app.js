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
var link = {};

function check_url_valid(url2check) {
    if (validUrl.isUri(url2check)){
        return true;
    } else {
		error.error = true;
		error.description = url2check + ' is not a valid url';
        return false;
    }
}

function url_seed(url2scrap, urlFather, depth) {
	//console.log(url2scrap);
	request({url: url2scrap, encoding: 'binary'}, function(err, resp, body){
		if(!err && resp.statusCode == 200){
			
			var $ = cheerio.load(body);
			var title = $('title').text();
			var description;
			var meta = $('meta')
			var keys = Object.keys(meta)
			keys.forEach(function(key){	
				try {
					if (meta[key].attribs.name === 'description') {
					  console.log(meta[key].attribs.content);
					  description = meta[key].attribs.content;
					}
				}
				catch (e) {
				}
			});
			
			link = {'url': url2scrap,'title':title,'description':description,'father_url':urlFather,'deep':depth};
			links.push(link);
			//console.log(link);
			
			$('a').each(function(){
				var next_link = $(this).attr('href');
				//link = {'url': $(this).attr('href'),'father_url':url2scrap, 'deep': depth};
				
				if (depth <= argv.depth ) { // TODO add a condition to check if the url is already in the links array to avoid infinit recursive loops
					depth++;
					console.log(next_link + urlFather + depth);
					url_seed(next_link, urlFather,depth);
				} 
			});
			// console.log(links);
		} else {
			error.error = true;
			error.description = url2scrap + ':: ' + err.message; // TODO check err message or resp.status
		}
		//console.log(link);

	});
}
 

if (command === 'crawl') {
	var url2seed = argv.url;
	if (check_url_valid(url2seed)) {
		// we let the user know the app started
		console.log('crwal started at: ' + url2seed + ' ' + argv.depth + ' levels deep');
		url_seed(url2seed, url2seed, 0);
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

	setTimeout(function() {
		print_csv();
		console.log('thanks for using urlcrawl');
		}, 6000);
	//console.log(links);
	//console.log(link);

} else {
	console.log('sorry, we couldn\'t crawl the url: ' +  url2seed + ' because ' + error.description);
}

function print_csv() {
		var fields = ['url', 'title','description','father_url','deep'];
		var json2csv = require('json2csv');
		try {
		  var result = json2csv({ data: links, fields: fields });
		  console.log(result);
		} catch (err) {
		  console.error(err);
		}	
}
