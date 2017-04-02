// we let the user know the app started
console.log('starting url crawl on:');

// in order to check validities of url, spetialy the seed
var validUrl = require('valid-url');

function check_url_valid(url2check) {
    if (validUrl.isUri(url2check)){
        return true;
    } else {
        return false;
    }
}

var url2check = "https://google";

if (check_url_valid(url2check)) {
	console.log(url2check + ' is a valid url');
} else {
	console.log(url2check + ' is an invalid url');
}

// we let the user know the app finished
console.log('thanks for using urlcrawl');






