// chrome.storage.sync.remove("excludeList");

// Populate current exclude list
var curExcludeList;
chrome.storage.sync.get({
	excludeList: []
}, function(items) {
	curExcludeList = items.excludeList;
	updateExcludeView();
});

var curFilter = "";

function updateExcludeView() {
	var container = document.getElementById("list-items");
	var html = "";
	for (var i = 0; i < curExcludeList.length; i++) {
		var item = curExcludeList[i];
		if (passFilter(item.site, curFilter)) {
			var date = new Date(item.dateAdded);
			var dateString = date.toDateString().substring(3).trim();
			html += "<div class='list-row'>\n";
			html += "<span class='list-chk'><input type='checkbox' value='" + i + "'/></span>\n";
			html += "<span class='list-site'>" + item.site + "</span>\n";
			html += "<span class='list-type'>" + item.type + "</span>\n";
			html += "<span class='list-date'>" + dateString + "</span>\n";
			html += "</div>";
		}
	}
	if (html == "")
		html = "<div style='padding: 10px'>There are no items</div>";
	container.innerHTML = html;

	bindItemCheckboxes();
}


document.getElementById("add-btn").onclick = function() {
	// Get textbox value
	var val = document.getElementById("exclude-url").value.trim();
	// Strip everything before and including :// (if any) and the www.
	val = val.replace(/.*:\/\//gi, "");
	val = val.replace(/^(www\.)/i, "");

	if (document.getElementsByName("exclude-type")[0].checked) { // Site exclusion
		// strip everything after and including first /
		val = val.replace(/\/.*/gi, ""); 
	}

	if (val.length > 1) {
		var findIndex = objArrayIndexOf(curExcludeList, "site", val);

		var newItem = {
			site: val,
			dateAdded: Date.now(),
			type: document.getElementsByName("exclude-type")[0].checked ? "site" : "page"
		};

		if (findIndex != -1) // Update existing site
			curExcludeList[findIndex] = newItem;
		else
			curExcludeList.push(newItem);

		// Save
		chrome.storage.sync.set({
			excludeList: curExcludeList
		}, function() {
			// Update table
			updateExcludeView();
			document.getElementById("exclude-url").value = "";
		});
	}
}

document.getElementById("remove-btn").onclick = function() {
	// Get all the checked items
	var checkedBoxes = getCheckedItemCheckboxes();

	var msg = "Are you sure you want to remove " + (checkedBoxes.length == 1 ? "this" : "these");
	msg += " " + (checkedBoxes.length == 1 ? "item" : checkedBoxes.length + " items") + "?";

	if (checkedBoxes.length > 0 && confirm(msg)) {
		// Delete by setting to null and then filtering out the nulls afterwards
		for (var i = 0; i < checkedBoxes.length; i++) {
			curExcludeList.splice(checkedBoxes[i].value, 1, null);
		}
		curExcludeList = curExcludeList.filter(function (item) {
			return item != null;
		});

		// Save
		chrome.storage.sync.set({
			excludeList: curExcludeList
		}, function() {
			// Update table
			updateExcludeView();
			document.getElementById("list-select-all").checked = false;
		});
	}
}

// Bind filter
document.getElementById("filter-btn").onclick = function() {
	curFilter = document.getElementById("list-filter-txt").value.trim();
	updateExcludeView();
}

// Bind Enter Key to trigger filter
document.getElementById("list-filter-txt").onkeypress = function(e) {
	e = e || window.event;
	if (e.keyCode == 13) {
		document.getElementById("filter-btn").click();
		return false;
	}
	return true;
};

// Bind select all
document.getElementById("list-select-all").onchange = function() {
	var checkboxes = getItemCheckboxes();
	for (var i = 0; i < checkboxes.length; i++) {
		checkboxes[i].checked = this.checked;
	}
}


// Bind all checkbox to un-check select all if they get un-checked
function bindItemCheckboxes() {
	var itemCheckCallback = function() {
		if (!this.checked)
			document.getElementById("list-select-all").checked = false;
	}
	var checkboxes = getItemCheckboxes();
	for (var i = 0; i < checkboxes.length; i++) {
		checkboxes[i].onchange = itemCheckCallback;
	}
}


/**************
Helper function
*/

function getItemCheckboxes() {
	return _itemCheckboxFilter(true, true);
}

function getCheckedItemCheckboxes() {
	return _itemCheckboxFilter(true, false);
}

function _itemCheckboxFilter(includeChecked, includeUnchecked) {
	var listChks = document.getElementsByClassName("list-chk");
	var result = [];
	for (var i = 0; i < listChks.length; i++) {
		var checkbox = listChks[i].getElementsByTagName("input")[0];
		if (!checkbox.id || checkbox.id != "list-select-all") {
			if (includeChecked && checkbox.checked || includeUnchecked && !checkbox.checked)
				result.push(checkbox);
		}
	}
	return result;
}

function passFilter(str, filterStr) {
	// return true if the string is 'a part' of the filter filterStr in a fuzzy manner
	// Fuzzy meaning that every char in filterStr appears in str. 
	// And for every character ch in filterStr, the next character after ch must also appear somewhere after the ch occurring in str.

	str = str.toLowerCase();
	filterStr = filterStr.toLowerCase();

	var start = 0, foundIndex;
	for (var i = 0; i < filterStr.length; i++) {
		foundIndex = str.indexOf(filterStr.charAt(i), start);
		if (foundIndex == -1)
			return false;
		start = foundIndex + 1;
	}
	return true;
}

function objArrayIndexOf(arrOfObj, key, searchVal) {
	for (var index in arrOfObj) {
		if (arrOfObj[index][key] == searchVal)
			return index;
	}
	return -1;
}