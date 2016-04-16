// Other js files can use functions defined in a background js file
// (in our case, helper is also a background)
// so in options.js, for example, we can do chrome.extension.getBackgroundPage().testApi(apikey)
// Thus, no need to load helper.js from a separate html file
// But, the background files won't auto update. Need to reload extension.
// http://stackoverflow.com/questions/5443202/call-a-function-in-background-from-popup

var firstRun = true;
var wordsPoll = null;
function pollNewData() {
	chrome.storage.sync.get({
		apikey: 'null'
	}, function(items) {
		testApi(items.apikey, function(success, message) {
			if (success)
				updateWords(items.apikey);
			else if (firstRun)
				clearWords(); // only clear when opening browser (if wanikani server goes down, don't want to be clearing their words)

			// Set polling to happen in intervals
			wordsPoll = setTimeout(pollNewData, 1 * 60 * 60 * 1000); // 1 hour

			firstRun = false;
		});
	});
}
pollNewData(); // after this, firstRun will be false

function restartPollNewData() {
	clearTimeout(wordsPoll);
	pollNewData();
}