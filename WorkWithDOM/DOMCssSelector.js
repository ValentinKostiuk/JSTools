(function (global){
	"use strict";
	function recursiveNodes (e) {//return array of parent nodes
		var n;
		if (e.nodeName && e.parentNode && e !== document.body) {
			n = recursiveNodes(e.parentNode);
		} else {
			n = new Array();
		}
		n.push(e);
		return n;
	}
	function escapeCssNames (name) { //escapes special css characters
		if (name) {
			try {
				return name.replace(/\\/g, '\\\\').replace(/[\#\;\&\,\.\+\*\~\'\:\"\!\^\$\[\]\(\)\=\>\|\/]/g, function(e) {
					return '\\' + e;
				}).replace(/\s+/, '');
			} catch (e) {
				if (window.console) {
					console.log('---');
					console.log("exception in escapeCssNames");
					console.log(name);
					console.log('---');
				}
				return '';
			}
		} else {
			return '';
		}
	}
	function childElementNumber (elem) { //return position of elem in tree
		var count;
		count = 0;
		while (elem.previousSibling && (elem = elem.previousSibling)) {
			if (elem.nodeType === 1) {
				count++;
			}
		}
		return count;
	}
	function siblingsWithoutTextNodes (e) { //ignore text nodes
		var filtered_nodes, node, nodes, _i, _len;
		nodes = e.parentNode.childNodes;
		filtered_nodes = [];
		for (_i = 0, _len = nodes.length; _i < _len; _i++) {
			node = nodes[_i];
			if (node.nodeName.substring(0, 1) === "#") {
				continue;
			}
			if (node === e) {
				break;
			}
			filtered_nodes.push(node);
		}
		return filtered_nodes;
	}
	function cssDescriptor (node) { //returns css path to node
		var cssName, escaped, path, text, _i, _len, _ref;
		path = node.nodeName.toLowerCase();
		escaped = node.id && escapeCssNames(new String(node.id));
		if (escaped && escaped.length > 0) {
			path += '#' + escaped;
		}
		if (node.className) {
			_ref = node.className.split(" ");
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				cssName = _ref[_i];
				escaped = escapeCssNames(cssName);
				if (cssName && escaped.length > 0) {
					path += '.' + escaped;
				}
			}
		}
		if (node.nodeName.toLowerCase() !== "body") {
			path += ':nth-child(' + (childElementNumber(node) + 1) + ')';
		}
		return path;
	}
	function cleanCss (css) {
		var cleaned_css, last_cleaned_css;
		cleaned_css = css;
		last_cleaned_css = null;
		while (last_cleaned_css !== cleaned_css) {
			last_cleaned_css = cleaned_css;
			cleaned_css = cleaned_css.replace(/(^|\s+)(\+|\~)/, '').replace(/(\+|\~)\s*$/, '').replace(/>/g, ' > ').replace(/\s*(>\s*)+/g, ' > ').replace(/,/g, ' , ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\s*,$/g, '').replace(/^\s*,\s*/g, '').replace(/\s*>$/g, '').replace(/^>\s*/g, '').replace(/[\+\~\>]\s*,/g, ',').replace(/[\+\~]\s*>/g, '>').replace(/\s*(,\s*)+/g, ' , ');
		}
		return cleaned_css;
	}
	function pathOf (elem) { //main function returns full css path to element
		var e, j, path, siblings, _i, _len, _ref;
		path = "";
		_ref = recursiveNodes(elem);
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			e = _ref[_i];
			if (e) {
				siblings = siblingsWithoutTextNodes(e);
				if (e.nodeName.toLowerCase() !== "body") {
					j = siblings.length - 2 < 0 ? 0 : siblings.length - 2;
					while (j < siblings.length) {
						if (siblings[j] === e) {
							break;
						}
						j++;
					}
				}
				path += cssDescriptor(e) + " > ";
			}
		}
		return cleanCss(path);
	}
	global.getCssPathFor = pathOf;
	////////////////////////TODO:make simplify css function, shall use in cssDescriptor function/////////////////
	////////////////////////TODO:try to replace nth-child(n) with first-child + * + * /////////////////
})(window);

window.onload = function(){
	document.body.onclick = function (e){
		console.log(window.getCssPathFor(e.target));
		console.log(document.querySelectorAll(window.getCssPathFor(e.target)));
	}
};