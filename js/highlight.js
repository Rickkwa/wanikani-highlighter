if (!isExcludedSite() && containsJapanese($("body").text())) {
	getWordList(function(wordList) {
		console.log(wordList);
		var regex = new RegExp(wordList.join("|"), "g");
		$("body *").replaceText(regex, wrapText);
	});
} else { console.log("WKH", "Ignore page"); }


// TODO: How to handle dynamic content?


// Return whether the current page is in the exclude list
function isExcludedSite() {
	return false;
}

function containsJapanese(str) {
	// http://stackoverflow.com/questions/15033196/using-javascript-to-check-whether-a-string-contains-japanese-characters-includi
	// Exclude punctuations, full width roman chars/half width katakana, and rare

	return str.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/);
}

function wrapText(str) {
	var hlColor = "cyan";
	var hlWrap = $("<span>").html(str).addClass("wkh-highlight");
	hlWrap = hlWrap.css("background-color", hlColor);
	// TODO: change text color if needed (so not similar to hlColor)
	return hlWrap.wrap("<span>").parent().html();
}

