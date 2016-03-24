// See https://developer.chrome.com/extensions/options

// Saves options to chrome.storage
function saveOptions() {	
	var apikey = document.getElementById("apikey").value;
	// TODO: check alphanumeric apikey

	chrome.storage.sync.set({
		apikey: apikey
	}, function() {
		// TODO: Test if working API key (and user exists), and display error msg if it doesn't work
		// TODO: if apikey works, then update the user's info (lvl, vocab, etc)
		// callApi(apikey, "kanji", function(res) {
			// console.log('asd');
			// console.log(res);
		// });
		updateWordList(apikey);
		
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}


// Fill in the saved options
function fillOptions() {
	// Sync variables, providing default values of element does not exist
	chrome.storage.sync.get({
		apikey: ''
	}, function(items) {
		document.getElementById('apikey').value = items.apikey;
	});
}
document.addEventListener('DOMContentLoaded', fillOptions);
document.getElementById('save-btn').addEventListener('click', saveOptions);
