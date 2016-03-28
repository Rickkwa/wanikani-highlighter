/*******************
Chrome Storage Getters/Setters
*/
function getHighlightColorHex(callback) {
	chrome.storage.sync.get({
		hlColor: ''
	}, function(items) {
		callback("#" + items.hlColor);
	});
}

function getApikey(callback) {
	chrome.storage.sync.get({
		apikey: ''
	}, function(items) {
		callback(items.apikey);
	});
}


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
	var kanji = callApiSync(apikey, "kanji")["requested_information"];
	var vocab = callApiSync(apikey, "vocabulary")["requested_information"]["general"];

	chrome.storage.sync.get({
		minProf: ''
	}, function(items) {
		var words = {};

		addWords(words, kanji, items.minProf);
		addWords(words, vocab, items.minProf);

		chrome.storage.local.set({ words: words });
		// TODO: make words be stored in background.js instead of chrome storage?
	});
}

function addWords(words, wkItems, minProf) {
	var profRank = ["apprentice", "guru", "master", "enlighten", "burned"];
	var minProfIndex = profRank.indexOf(minProf) == -1 ? 0 : profRank.indexOf(minProf);

	for (var index in wkItems) {
		if (wkItems[index]["user_specific"] == null)
			continue;
		var w = wkItems[index]["character"];
		if (profRank.indexOf(wkItems[index]["user_specific"]["srs"]) >= minProfIndex) {
			words[w] = { proficiency: wkItems[index]["user_specific"]["srs"] };
		}
	}
}

// return an array of kanji/vocab from our words
function getWordList(callback) {
	var result = [];
	chrome.storage.local.get({
		words: []
	}, function(items) {
		result = Object.keys(items.words);

		// Sort by length of string in descending order
		result.sort(function(a, b) {
			return b.length - a.length;
		})

		callback(result);
	});
}


/*******************
Non-project Specific
*/
function isHex(str) {
	if (str.startsWith("#"))
		str = str.substring(1);
	return /^[0-9A-Fa-f]{6}$/g.test(str) || /^[0-9A-Fa-f]{3}$/g.test(str);
}
