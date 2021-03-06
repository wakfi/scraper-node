const EventEmitter = require('events');
const fetch = require(`node-fetch`);
const parseTime = require(`./util/parseTime.js`);
const validProtocol = /^https?:$/;

class Scraper extends EventEmitter
{
	constructor(url, pollRate)
	{
		super();
		this.setMaxListeners(10);
		if(pollRate === undefined)
		{
			pollRate = 3600000;
		}
		try
		{
			pollRate = parseTime(pollRate);
		} catch(e) {
			if (e instanceof TypeError) 
			{
				throw new TypeError(`pollRate must be a time representation: "${pollRate}" could not be interpreted as a time`);
			} else {
				throw e;
			}
		}
		url = url.toString().toLowerCase();
		const urlObj = new URL(url);
		if(!validProtocol.test(urlObj.protocol)) throw new TypeError(`Only HTTP(S) protocols are supported`);
		
		this._url = url;
		this._pollRate = pollRate;
		this._lastResponse = null;
		Object.defineProperty(this, 'url', {get(){return this._url}, enumerable: true, configurable: true});
		Object.defineProperty(this, 'pollRate', {get(){return this._pollRate}, enumerable: true, configurable: true});
		Object.defineProperty(this, 'lastResponse', {get(){return this._lastResponse}, enumerable: true, configurable: true});

		this._pendingAt = null;
		this._pending = 0;
		this._timer = setInterval(this._scrape.bind(this), this._pollRate);
		setTimeout(this._scrape.bind(this), 0);
	}

	setURL(url)
	{
		url = url.toString().toLowerCase();
		const urlObj = new URL(url);
		if(!validProtocol.test(urlObj.protocol)) throw new TypeError(`Only HTTP(S) protocols are supported`);
		this._url = url;
	}

	setPollRate(pollRate)
	{
		try 
		{
			const newPollRate = parseTime(pollRate);
			this._pollRate = newPollRate;
			clearInterval(this._timer);
			this._timer = setInterval(this._scrape.bind(this), this._pollRate);
		} catch(e) {
			if (e instanceof TypeError) 
			{
				throw new TypeError(`pollRate must represent a duration: "${pollRate}" could not be interpreted as a time duration`);
			} else {
				throw e;
			}
		}
	}

	resume()
	{
		if(this._timer !== null) return;
		this._timer = setInterval(this._scrape.bind(this), this._pollRate);
	}

	stop()
	{
		clearInterval(this._timer);
		this._timer = null;
		this._pendingAt = null;
		this._pending = 0;
	}

	_scrape()
	{
		this._pendingAt = Date.now() + this._pending++;
		const pendingID = this._pendingAt;
		fetch(this._url).then(response =>
		{
			this._pending--;
			if(this._pendingAt !== pendingID) return;
			this._lastResponse = response;
			this.emit('scrape', response);
		})
		.catch(e =>
		{
			this._pending--;
			this.emit('error', e);
		});
	}
}

module.exports = Scraper;
