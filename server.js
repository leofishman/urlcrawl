var express = require('express');
var app = express();

app.use(express.static('public'));
app.get('/index.htm', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
})



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
var links2scrap = [];
var link = {};
var max_depth = argv.depth
var exist = false;

function check_url_valid(url2check) {
    if (validUrl.isUri(url2check)){
        return true;
    } else {
		//error.error = true;
		error.description = url2check + ' is not a valid url';
        return false;
    }
}

function urlExist(urlCheck){
	// I check if the url 2 is already crawled
	exist = false
	var urlSearch = links.filter(function ( urlSearch ) {
		if (urlSearch.url === urlCheck) {
			exist = true;
		}
	});
	return exist;
}

function url_seed(url2scrap, urlFather, depth) {
	//console.log(url2scrap);

	if (!urlExist(url2scrap)){
		request({url: url2scrap, encoding: 'binary'}, function(err, resp, body){
			if(!err && resp.statusCode == 200){
				
				var $ = cheerio.load(body);
				var title = $('title').text();
				var description = '';
				var meta = $('meta')
				var keys = Object.keys(meta)
				keys.forEach(function(key){	
					try {
						if (meta[key].attribs.name === 'description') {
						// console.log(meta[key].attribs.content);
						description = meta[key].attribs.content;
						}
					}
					catch (e) {
					}
				});
				
				link = {'url': url2scrap,'title':title,'description':description,'father_url':urlFather,'deep':depth};
				if (!urlExist(url2scrap)){ 
					links.push(link)
				};
				//console.log(link);
				depth++;
				if (depth <= max_depth) {
					$('a').each(function(){
						var next_link = $(this).attr('href');
						//link = {'url': $(this).attr('href'),'father_url':url2scrap, 'deep': depth};
						//console.log('depth: ' + depth + '  max_depth: ' + max_depth);
						if (depth <= max_depth && check_url_valid(next_link)) { // TODO add a condition to check if the url is already in the links array to avoid infinit recursive loops
							//console.log(next_link);
							//console.log(next_link + urlFather + depth);
						//	if (!urlExist(url2scrap)){url_seed(next_link, url2scrap,depth)};
						url_seed(next_link, url2scrap,depth);
						//	if (!urlExist(url2scrap)){links2scrap.push(next_link, url2scrap,depth)};
						} 
					});
				}
				// console.log(links);
			} else {
				//error.error = true;
				error.description = url2scrap + ':: '; //+ resp.statusCode.toString(); // TODO check err message or resp.status
			}
			
			//console.log(link);

		});
	}
}
 

if (command === 'crawl') {
	var url2seed = argv.url;
	if (check_url_valid(url2seed)) {
		// we let the user know the app started
		console.log('crwal started at: ' + url2seed + ' ' + max_depth + ' levels deep');
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
		
		print_csv();//console.log(links2scrap);
		console.log('thanks for using urlcrawl');
		console.log(error.description);
		}, 3000);
	//console.log(links);
	//console.log(link);
	

} else {
	console.log('sorry, we couldn\'t crawl the url: ' +  url2seed + ' because ' + error.description);
}

function save_csv(file) {
	fs = require('fs');
	
var stream = fs.createWriteStream("my_file.csv");
stream.once('open', function(fd) {
	
	for (var i = 0; i < file.length; i++) {
	  stream.write(file[i]);
	 // console.log(i + ' ' + file[i]);
	}	
  
  stream.end();
});	
	
	
	
	fs.writeFile('public/links.csv', file, 'latin1', function (err, data) {
	  if (err) return console.log(err);
	  console.log(data);
	});
	console.log(' 166 file' + file);
}

function print_csv() {
		var fields = ['url', 'title','description','father_url','deep'];
		var json2csv = require('json2csv');
		try {
		  var result = json2csv({ data: links, fields: fields });
		  save_csv(result);
		  console.log(' 174 result: ' + result);
		  return result
		} catch (err) {
		  console.error(err);
		}	
}

function print_table(){
	response_html = '<div class="table"><h3>' + links[0].url + ' Total links: ' + (links.length - 1) + ' <table border="1"><tr><td><strong>url</strong></td><td><strong>title</strong></td><td><strong>description</strong></td><td><strong>father url</strong></td><td><strong>deep</strong></td></tr>';
	for (var i = 1; i < links.length; i++) {
		response_html += '<tr><td>' + links[i].url + '</td><td>' + links[i].title + '</td><td>' + links[i].description + '</td><td>' + links[i].father_url + '</td><td>' + links[i].deep + '</td></tr>';
	
	}
	response_html += '</table></div>';
	return response_html;
}

app.get('/process', function (req, res) {
   // Prepare output in JSON format
   response = {
      url:req.query.url,
      depth:req.query.depth
      
   };
  // console.log(response);
   //res.end(JSON.stringify(response));
   url2seed = response.url;
   max_depth = response.depth;
   url_seed(url2seed, url2seed, 0);
   
   	setTimeout(function() {
		print_csv();
		res.send(print_table());//console.log(links2scrap);
		console.log('thanks for using urlcrawl');
		console.log(error.description);
		}, 21000);
   
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("web scrap app listening at http://%s:%s", host, port)

})
