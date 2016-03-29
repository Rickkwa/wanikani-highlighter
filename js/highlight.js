var hlColor, excludeList;

getExcludeList(function(eList) {
	excludeList = eList;
	if (!isExcludedSite() && containsJapanese($("body").text())) {
		getHighlightColorHex(function(cl) {
			hlColor = isHex(cl) ? cl : '#00ffff';

			getWordList(function(wordList) {
				var regex = new RegExp(wordList.join("|"), "g");
				$("*").replaceText(regex, wrapText);
			});
		});
	} else { console.log("WKH", "Ignore page"); }
});

// TODO: How to handle dynamic content?


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
			console.log("true exclude", ei.site, ei.type, curSite);
			return true;
		}
	}
	console.log("false exclude", curSite);
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
	var hlWrap = $("<span>").html(str).addClass("wkh-highlight");
	// TODO: change text color if needed (so not similar to hlColor)
	var rgb = hexToRgb(hlColor);
	var opacity = 0.3;
	hlWrap = hlWrap.css({
		"background-color": "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+opacity+")"
	});
	return hlWrap.wrap("<span>").parent().html();
}

// http://stackoverflow.com/a/5624139/2079781
function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
