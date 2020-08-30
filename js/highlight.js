var hlColor, excludeList, hlOpacity, wordList;

chrome.storage.sync.get({
	hlColor: '',
	hlOpacity: 100
}, function(items) {
	hlColor = items.hlColor;
	hlOpacity = items.hlOpacity;

	chrome.storage.local.get({
		words: [],
		excludeList: []
	}, function(localItems) {
		excludeList = localItems.excludeList;
		wordList = localItems.words;
		if (!isExcludedSite() && containsJapanese($("body").text())) {
			hlColor = isHex(hlColor) ? hlColor : '#00ffff';
			
			if (wordList.length > 0) {
				var regex = new RegExp(wordList.join("|"), "g");
				var ignored = ["script", "textarea", "style"];
				$("body, body *").not(ignored.join(", ")).replaceText(regex, wrapText);
				replaceDynamicContent(regex, ignored);
			}
		} else { console.log("WKH", "Ignore page"); }
	});
});


function replaceDynamicContent(regex, nots) {
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	var observer = new MutationObserver(function(mutations, observer) {
		for (var i = 0; i < mutations.length; i++) {
			var nodes = mutations[i].addedNodes;
			for (var j = 0; j < nodes.length; j++) {
				var $node = $(nodes[j]);
				if (!$node.hasClass("wkh-hl")) {
					if (nodes[j].nodeType == 3) // text node
						$node.parent().replaceText(regex, wrapText);
					else
						$node.add($node.find("*")).not(nots.join(", ")).replaceText(regex, wrapText);
				}
			}
		}

		fixFlexColumn();
	});
	observer.observe(document, {
		childList: true,
		subtree: true
	});

	// Copied from: https://davidwalsh.name/javascript-debounce-function
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	// to fix this: https://stackoverflow.com/questions/63651056/how-to-make-a-nodetype-node-element-node-acts-like-nodetype-node-text-n
	var fixFlexColumn = debounce(() => {
		document.querySelectorAll('.wkh-hl').forEach(({ parentElement }) => {
			const { display, flexDirection, alignItems } = window.getComputedStyle(
				parentElement
			);
			if (display === 'flex' && flexDirection === 'column') {
				parentElement.style.flexDirection = 'row';
				parentElement.style.justifyContent = alignItems.startsWith('flex-')
					? alignItems
					: 'center';
			}
		});
	}, 100, true);
}


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
	var hlWrap = $("<mark>").html(str).addClass("wkh-hl");
	// TODO: change text color if needed (so not similar to hlColor)
	var rgb = hexToRgb(hlColor);
	var opacity = hlOpacity / 100;
	hlWrap = hlWrap.css({
		"background-color": "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+opacity+")",
		"color": "inherit"
	});
	return hlWrap.wrap("<span>").parent().html();
}


