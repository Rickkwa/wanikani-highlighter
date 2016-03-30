var hlColor, excludeList, hlOpacity;

chrome.storage.sync.get({
	hlColor: '',
	hlOpacity: 100,
	excludeList: []
}, function(items) {
	hlColor = items.hlColor;
	hlOpacity = items.hlOpacity;
	excludeList = items.excludeList;

	if (!isExcludedSite() && containsJapanese($("body").text())) {
		hlColor = isHex(hlColor) ? hlColor : '#00ffff';

		getWordList(function(wordList) {
			var regex = new RegExp(wordList.join("|"), "g");
			$("body, body *:not(script):not(textarea):not(style)").replaceText(regex, wrapText);
		});
	} else { console.log("WKH", "Ignore page"); }
});


// Return whether the current page is in the exclude list
function isExcludedSite() {
	// Get current site with http(s) and www. stripped off
	var curSite = window.location.href;
	curSite = curSite.replace(/.*:\/\//gi, "");
	curSite = curSite.replace(/^(www\.)/i, "");
	for (var i = 0; i < excludeList.length; i++) {
		var ei = excludeList[i];
		// Create regex
		var regex, mods = "i", regSite = regEscape(ei.site);
		regex = new RegExp("^" + regSite + (ei.type == "site" ? "(\/.*)*" : "\/?") + "$", mods);

		// Test regex
		if (regex.test(curSite)) {
			return true;
		}
	}
	return false;

	// http://stackoverflow.com/a/3561711/2079781
	function regEscape(s) {
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}
}

function containsJapanese(str) {
	// http://stackoverflow.com/questions/15033196/using-javascript-to-check-whether-a-string-contains-japanese-characters-includi
	// Exclude punctuations, full width roman chars/half width katakana, and rare

	return /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(str);
}

function wrapText(str) {
	// var hlColor = "#00ffff"; // cyan
	var hlWrap = $("<mark>").html(str).addClass("wkh-highlight");
	// TODO: change text color if needed (so not similar to hlColor)
	var rgb = hexToRgb(hlColor);
	var opacity = hlOpacity / 100;
	hlWrap = hlWrap.css({
		"background-color": "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+opacity+")"
	});
	return hlWrap.wrap("<span>").parent().html();
}


