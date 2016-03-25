// Other js files can use functions defined in a background js file
// (in our case, helper is also a background)
// so in options.js, for example, we can do chrome.extension.getBackgroundPage().testApi(apikey)
// Thus, no need to load helper.js from a separate html file
// But, the background files won't auto update. Need to reload extension.
// http://stackoverflow.com/questions/5443202/call-a-function-in-background-from-popup

var wordsPoll = null;
function pollNewData() {
	chrome.storage.sync.get({
		apikey: 'null'
	}, function(items) {
		testApi(items.apikey, function(success, message) {
			if (success) {
				// Update user info, and do again after some time
				updateWords(items.apikey);
			}
			// Set polling to happen in intervals
			wordsPoll = setTimeout(pollNewData, 1 * 60 * 60 * 1000); // 1 hour
		});
	});
}
pollNewData();


function restartPollNewData() {
	clearTimeout(wordsPoll);
	pollNewData();
}