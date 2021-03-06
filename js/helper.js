/*******************
WaniKani API Handling
*/

// Test API is online and that the API key is correct
function testApi(apikey, callback) {
	if (apikey.length != 32 || !/^[a-z0-9]+$/i.test(apikey)) {
		callback(false, "Invalid API key.");
		return;
	}

	callApi(apikey, "", function(res) {
		if (!res.hasOwnProperty("error"))
			callback(true, null);
		else
			callback(false, res["error"]["message"]);
	}, function(status) {
		callback(false, "Could not establish a connection to WaniKani.");
	});
}

// Standard async api call
function callApi(apikey, request, s_cb, e_cb) {
	wkApiCall(apikey, request, s_cb, e_cb, true);
}

// Synchronous api call just in case
function callApiSync(apikey, request) {
	var result;
	var cb = function(r) {
		result = r;
	};

	wkApiCall(apikey, request, cb, cb, false);
	return result;
}

// Doing the actual nitty gritty of the API call
function wkApiCall(apikey, request, s_cb, e_cb, async) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://www.wanikani.com/api/user/" + apikey + "/" + request, async);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				if (typeof s_cb == "function")
					s_cb(JSON.parse(xhr.responseText));
			}
			else if (typeof e_cb == "function") {
				e_cb(xhr.status);
			}
		}
	}
	xhr.send();
}

/*******************
Backend storage of the words
*/

function updateWords(apikey) {
	chrome.storage.sync.get({
		minProf: '',
		targetType: 'all'
	}, function(items) {
		var words = [];

		if (items.targetType == 'all' || items.targetType == 'kanji') {
			var kanji = callApiSync(apikey, "kanji")["requested_information"];
			addWords(words, kanji, items.minProf);
		}
		if (items.targetType == 'all' || items.targetType == 'vocab') {
			var vocab = callApiSync(apikey, "vocabulary")["requested_information"]["general"];
			addWords(words, vocab, items.minProf);
		}

		// Sort by length of string in descending order
		words.sort((a, b) => b.length - a.length);

		chrome.storage.local.set({ words: words });
		// TODO: make words be stored in background.js instead of chrome storage?
	});
}

function clearWords() {
	chrome.storage.local.set({ words: [] });
}

function addWords(words, wkItems, minProf) {
	var profRank = ["apprentice", "guru", "master", "enlighten", "burned"];
	var minProfIndex = !profRank.includes(minProf) ? 0 : profRank.indexOf(minProf);

	for (var index in wkItems) {
		if (wkItems[index]["user_specific"] == null)
			continue;
		var w = wkItems[index]["character"];
		if (profRank.indexOf(wkItems[index]["user_specific"]["srs"]) >= minProfIndex && !words.includes(w)) {
			words.push(w);
		}
	}
}


/*******************
Non-project Specific
*/
function isHex(str) {
	if (str.startsWith("#"))
		str = str.substring(1);
	return /^[0-9A-Fa-f]{6}$/g.test(str) || /^[0-9A-Fa-f]{3}$/g.test(str);
}

// http://stackoverflow.com/a/5624139/2079781
function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
