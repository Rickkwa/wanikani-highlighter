// See https://developer.chrome.com/extensions/options

var chromeBg = chrome.extension.getBackgroundPage();

// Saves options to chrome.storage
function saveOptions() {	
	var apikey = document.getElementById("apikey").value.trim();

	chrome.storage.sync.set({
		apikey: apikey
	}, function() {
		chromeBg.testApi(apikey, function(success, message) {
			if (!success && apikey.length != 0) {
				setOptionsMessage("error", message);
			}
			else {
				// if (apikey.length != 0) {
					// updateWordList(apikey);
				// }
				setOptionsMessage("success", "Options Saved.", 2000);
			}
		});
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
document.addEventListener("DOMContentLoaded", fillOptions);
document.getElementById("save-btn").addEventListener("click", saveOptions);


/*
 * Adds the message to the #status element in popup.html
 * type: "success" or "error"
 * msg: the string to put into the element
 * timeout: how long msg lasts. If <= 0, then msg doesn't clear
 */
function setOptionsMessage(type, msg, timeout) {
	timeout = timeout || 0;
	var status = document.getElementById("status");
	status.textContent = msg;
	status.className += " " + type;
	if (timeout > 0) {
		setTimeout(function() {
			status.textContent = '';
			var regex = new RegExp("(?:^|\\s)(success|error)(?!\\S)", "g");
			status.className = status.className.replace(regex, "");
		}, timeout);
	}
}