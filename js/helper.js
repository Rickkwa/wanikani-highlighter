
/*******************
WaniKani API Handling
*/

// Standard async api call
function callApi(apikey, request, s_cb, e_cb) {
	wkApiCall(apikey, request, s_cb, e_cb, true);
}

// Synchronous api call just in case
function callApiSync(apikey, request) {
	var result;
	wkApiCall(apikey, request, function(r) {
		result = r;
	}, {}, false);
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
				// TODO: test this
				e_cb(xhr.status);
			}
		}
	}
	xhr.send();
}