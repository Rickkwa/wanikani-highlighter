// See https://developer.chrome.com/extensions/options

var chromeBg = chrome.extension.getBackgroundPage();

// Saves options to chrome.storage
function saveOptions() {	
	var apikey = document.getElementById("apikey").value.trim();
	var color = document.getElementById("hl-color").value.trim();

	// Check valid hexadecimal (including shorthand hex)
	if (!chromeBg.isHex(color)) {
		warnTextInput('hl-color');
	} else { undoWarnTextInput('hl-color') };

	chrome.storage.sync.set({
		apikey: apikey,
		hlColor: color
	}, function() {
		chromeBg.testApi(apikey, function(success, message) { // TODO: Can move this outside of chrome.storage.sync.set?
			if (!success && apikey.length != 0) {
				setOptionsMessage("error", message);
				warnTextInput('apikey');
			}
			else {
				if (apikey.length != 0) {
					// Update words + reset polling timer
					chromeBg.restartPollNewData();
					undoWarnTextInput('apikey')
				}
				// TODO?: Move "Options saved" to top so it runs instantly (before testApi)
				setOptionsMessage("success", "Options Saved.", 2000);
			}
		});
	});
}


// Fill in the saved options
function fillOptions() {
	// Sync variables, providing default values of element does not exist
	chrome.storage.sync.get({
		apikey: '',
		hlColor: '00ffff'
	}, function(items) {
		document.getElementById('apikey').value = items.apikey;
		document.getElementById('hl-color').value = items.hlColor;

		if (!chromeBg.isHex(items.hlColor)) {
			warnTextInput('hl-color');
		}
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

function warnTextInput(id) {
	document.getElementById(id).style.borderColor = "red";
}

function undoWarnTextInput(id) {
	document.getElementById(id).style.borderColor = "inherit";
}