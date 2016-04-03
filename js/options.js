// See https://developer.chrome.com/extensions/options

var chromeBg = chrome.extension.getBackgroundPage();

// Bind stuff
document.addEventListener("DOMContentLoaded", fillOptions);
document.getElementById("save-btn").onclick = saveOptions;
document.getElementById("exclude-btn").onclick = function() {
	chrome.tabs.create({
		url: "../html/exclude_list.html"
	});
}
document.getElementById("hl-color").onkeyup = updatePreview;
document.getElementById("hl-opacity").onkeyup = updatePreview;
document.getElementById("hl-opacity").onkeypress = function(e) { return e.charCode >= 48 && e.charCode <= 57 };
document.getElementById("hl-preview").onclick = function() {
	var target = document.getElementById("color-picker")
	var hex = "#" + document.getElementById("hl-color").value;
	target.value = chromeBg.isHex(hex) ? hex : "#00ffff";
	target.click();
}
document.getElementById("color-picker").oninput = function() { 
	document.getElementById("hl-color").value = this.value.replace("#", "");
	updatePreview();
}




// Saves options to chrome.storage
function saveOptions() {	
	var apikey = document.getElementById("apikey").value.trim();
	var color = document.getElementById("hl-color").value.trim();
	var proficiency = document.getElementById("proficiency").value;
	var opacity = document.getElementById("hl-opacity").value.trim();

	// Check valid hexadecimal (including shorthand hex)
	if (!chromeBg.isHex(color)) {
		warnTextInput('hl-color');
	} else { undoWarnTextInput('hl-color') };

	// Ensure opacity is number between 0-100. Else set to 100.
	if (!isNumRange(opacity, 0, 100))
		opacity = "100";

	setOptionsMessage("", "<div class='loading'></div>");
	chrome.storage.sync.set({
		apikey: apikey,
		hlColor: color,
		hlOpacity: opacity,
		minProf: proficiency
	}, function() {
		chromeBg.testApi(apikey, function(success, message) {
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
				setOptionsMessage("success", "Options Saved.", 4000);
			}
		});
	});
}


// Fill in the saved options
function fillOptions() {
	// Sync variables, providing default values of element does not exist
	chrome.storage.sync.get({
		apikey: '',
		hlColor: '00ffff',
		hlOpacity: 100,
		minProf: 'apprentice'
	}, function(items) {
		document.getElementById('apikey').value = items.apikey;
		document.getElementById('hl-color').value = items.hlColor;
		document.getElementById('proficiency').value = items.minProf;
		document.getElementById('hl-opacity').value = items.hlOpacity;

		setPreview(items.hlColor, items.hlOpacity);

		if (!chromeBg.isHex(items.hlColor)) {
			warnTextInput('hl-color');
		}
	});
}



/*
 * Adds the message to the #status element in popup.html
 * type: "success" or "error"
 * msg: the string to put into the element
 * timeout: how long msg lasts. If <= 0, then msg doesn't clear
 */
function setOptionsMessage(type, msg, timeout) {
	timeout = timeout || 0;
	var status = document.getElementById("status");
	status.innerHTML = msg;
	status.className += " " + type;
	if (timeout > 0) {
		setTimeout(function() {
			status.innerHTML = '';
			var regex = new RegExp("(?:^|\\s)(success|error)(?!\\S)", "g");
			status.className = status.className.replace(regex, "").trim();
		}, timeout);
	}
}

function updatePreview() {
	var cl = document.getElementById('hl-color').value.trim();
	var op = document.getElementById('hl-opacity').value.trim();
	setPreview(cl, op);
}

function setPreview(color, opacity) {
	// Fill preview box
	var rgb = chromeBg.isHex(color) ? chromeBg.hexToRgb(color) : { r: 255, g: 255, b: 255 };
	var cssOpacity = isNaN(opacity) ? 1 : (opacity / 100);
	document.getElementById('hl-preview').style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${cssOpacity})`;
}

// return true if string is num in range [min, max]
function isNumRange(str, min, max) {
	if (str == "" || isNaN(str))
		return false;
	var n = parseInt(str);
	return n >= min && n <= max;
}

function warnTextInput(id) {
	document.getElementById(id).style.borderColor = "red";
}

function undoWarnTextInput(id) {
	document.getElementById(id).style.borderColor = "gray";
}