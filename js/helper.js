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
	// word is key, 
	// and value is obj of proficiency (if its a word), endWord, and children
	var trie = {}; 

	// Get Kanji list and add it to trie
	addWordsToTrie(trie, callApiSync(apikey, "kanji")["requested_information"]);
	// Get Vocabulary list and add it to trie
	addWordsToTrie(trie, callApiSync(apikey, "vocabulary")["requested_information"]["general"]);

	// Store trie
	chrome.storage.local.set({ words : trie });
	// TODO: get the kanji/vocab asynchronously
}

function addWordsToTrie(trie, items) {
	for (var index in items) {
		var cur = trie;
		var word = items[index]["character"];
		for (var i = 0; i < word.length; i++) {
			if (items[index]["user_specific"] == null) // word lesson is still pending so skip
				continue;

			// traverse down trie if it exists, else create entry
			if (!cur.hasOwnProperty(word.charAt(i)))
				cur[word.charAt(i)] = { endWord: false, proficiency: null };
			cur = cur[word.charAt(i)];

			// last word, set endWord and proficiency
			if (i + 1 == word.length) {
				cur["endWord"] = true;
				cur["proficiency"] = items[index]["user_specific"]["srs"];
			}
		}
	}
}
