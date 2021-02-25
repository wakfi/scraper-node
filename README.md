# scraper-node
[![NPM version](http://img.shields.io/npm/v/scraper-node.svg)](https://www.npmjs.org/package/scraper-node)
[![License](https://img.shields.io/npm/l/express.svg)](https://github.com/wakfi/scraper-node/blob/master/LICENSE)
[![NPM downloads](http://img.shields.io/npm/dt/scraper-node.svg)](https://www.npmjs.org/package/scraper-node)
[![downloads per month](http://img.shields.io/npm/dm/scraper-node.svg)](https://www.npmjs.org/package/scraper-node)

Easily scrape any webpage! The `scraper-node` module will periodically send a request to the URL you provide. Upon receiving a response, the scraper emits an event with the response.

# Installation
```sh
npm install scraper-node
```

# Example Usage
```js
const Scraper = require('scraper-node');
const scraper = new Scraper('https://www.example.com');

scraper.on('scrape', response => {
	console.log(`${response.status} ${response.statusText}`);
});

scraper.on('error', error => {
	console.error(error.stack);
});

scraper.setPollRate('30m');
```  
The response being emitted from a scrape is a [node-fetch](https://www.npmjs.com/package/node-fetch) response object. You can work with it just as you would a fetch response from [node-fetch](https://www.npmjs.com/package/node-fetch).

## API

### Class: Scraper

#### new Scraper(url[, pollRate])
Construct a new Scraper instance. Arguments:
- url: The desired URL to scrape
- pollRate: Optional interval between scrapes. If none is provided, this defaults to 1 hour. This can be provided as a value in milliseconds, however a [time string](#time-string) can also be accepted.

Throws a `TypeError` if pollRate is neither a number nor a [time string](#time-string). Throws a `TypeError` for invalid URLs. Throws a `TypeError` if the URL protocol is not either of HTTP or HTTPS.  

#### scraper.url
The URL being scraped. Read-only.

#### scraper.pollRate
Time between scrapes, as a number in milliseconds. Read-only.

#### scraper.lastResponse
Response object from the last successful scrape. Read-only.

#### scraper.setURL(url)
Change the URL being scraped. Throws a `TypeError` for invalid URLs. Throws a `TypeError` if the URL protocol is not either of HTTP or HTTPS.

#### scraper.setPollRate(pollRate)
Change the time interval between scrapes. Throws a `TypeError` if pollRate is neither a number nor a [time string](#time-string).

#### scraper.stop()
Stop the scraper from scraping the URL.

#### scraper.resume()
If the scraper has been stopped using [`scraper.stop()`](https://github.com/wakfi/scraper-node/new/main#scraperstop), resume scraping. The next scrape will occur after the duration of the current poll rate. Does nothing if scraping has not been stopped.

### Events
- `'scrape'`: emited when the target URL returns a response, providing the response as an argument
- `'error'`: emited when there an error occurs during the fetch. Note that this is *not* the same as 4xx and 5xx response codes, which will be returned as standard responses through the `scrape` event

### Time String
A string of the form "1y 1w 1d 1h 1m 1s 1ms". Any time unit may be omitted, however the relative order of terms may not be changed. Spaces between terms are optional.
- y  = years
- w  = weeks
- d  = days
- h  = hours
- m  = minutes
- s  = seconds
- ms = milliseconds

The string "2h 30m 59s" would represent 2 hours, 30 minutes, and 59 seconds; when converted into milliseconds for the poll rate this is `9059000`.

## License
Licensed under MIT  
Copyright (c) 2020 Walker Gray
