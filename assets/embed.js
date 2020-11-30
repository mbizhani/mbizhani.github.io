/*
The original script is from https://github.com/yusanshi/embed-like-gist/blob/master/embed.js
*/
embed();

function embed() {
	const params = (new URL(document.currentScript.src)).searchParams;
	const target = new URL(params.get("target"));
	const style = "default"/* params.get("style")*/;
	const trickyDarkStyle = ["an-old-hope", "androidstudio", "arta", "codepen-embed", "darcula", "dracula", "far", "gml", "hopscotch", "hybrid", "monokai", "monokai-sublime", "nord", "obsidian", "ocean", "railscasts", "rainbow", "shades-of-purple", "sunburst", "vs2015", "xt256", "zenburn"]; // dark styles without 'dark', 'black' or 'night' in its name
	const isDarkStyle = style.includes("dark") || style.includes("black") || style.includes("night") || trickyDarkStyle.includes(style);
	const showBorder = true/*params.get("showBorder") === "on"*/;
	const showLineNumbers = true/*params.get("showLineNumbers") === "on"*/;
	const showFileMeta = true/*params.get("showFileMeta") === "on"*/;
	const lineSplit = target.hash.split("-");
	const startLine = target.hash !== "" && lineSplit[0].replace("#L", "") || -1;
	const endLine = target.hash !== "" && lineSplit.length > 1 && lineSplit[1].replace("L", "") || startLine;
	const tabSize = target.searchParams.get("ts") || 8;
	const pathSplit = target.pathname.split("/");
	const user = pathSplit[1];
	const repository = pathSplit[2];
	const branch = pathSplit[4];
	const file = pathSplit.slice(5, pathSplit.length).join("/");
	const fileExtension = file.split('.')[file.split('.').length - 1];
	const rawFileURL = `https://raw.githubusercontent.com/${user}/${repository}/${branch}/${file}`;
	// The id where code will be embeded. In order to support a single `target` embedded for multiple times,
	// we use a random string to avoid duplicated id.
	const containerId = Math.random().toString(36).substring(2);

	// Reserving space for code area should be done in early time
	// or the div may not be found later
	document.write(`
<div id="${containerId}"></div>
<link rel="stylesheet" href="/assets/highlight/styles/${style}.css">
<link rel="stylesheet" href="/assets/highlight/embed.css">
`);

	const HLJSURL = "/assets/highlight/highlight.pack.js";
	const HLJSNumURL = "/assets/highlight/highlight-line-numbers.min.js";

	const loadHLJS = (typeof hljs != "undefined" && typeof hljs.highlightBlock != "undefined") ?
		Promise.resolve() : loadScript(HLJSURL);

	let loadHLJSNum;
	if (showLineNumbers) {
		// hljs-num should be loaded only after hljs is loaded
		loadHLJSNum = loadHLJS.then(() =>
			(typeof hljs != "undefined" && typeof hljs.lineNumbersBlock != "undefined") ?
				Promise.resolve() : loadScript(HLJSNumURL)
		)
	}

	const fetchFile = fetch(rawFileURL).then((response) => {
		if (response.ok) {
			return response.text();
		} else {
			return Promise.reject(`${response.status} ${response.statusText}`);
		}
	});

	Promise
		.all(showLineNumbers ? [fetchFile, loadHLJS, loadHLJSNum] : [fetchFile, loadHLJS])
		.then((result) => {
			const targetDiv = document.getElementById(containerId);
			embedCodeToTarget(targetDiv, result[0], showBorder, showLineNumbers, showFileMeta, isDarkStyle, target.href, rawFileURL, fileExtension, startLine, endLine, tabSize);
		}).catch((error) => {
		const errorMsg = `Failed to process ${rawFileURL}\n${error}`;
		const targetDiv = document.getElementById(containerId);
		embedCodeToTarget(targetDiv, errorMsg, showBorder, showLineNumbers, showFileMeta, isDarkStyle, target.href, rawFileURL, 'plaintext', -1, -1, tabSize);
	});
}

function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = src;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

function embedCodeToTarget(targetDiv, codeText, showBorder, showLineNumbers, showFileMeta, isDarkStyle, fileURL, rawFileURL, lang, startLine, endLine, tabSize, pathname) {
	const fileContainer = document.createElement("div");
	fileContainer.style.margin = "1em 0";

	const code = document.createElement("code");
	code.style.padding = "1rem";

	if (showFileMeta) {
		code.style.borderRadius = "0.3rem 0.3rem 0 0";
	} else {
		code.style.borderRadius = "0.3rem";
	}
	if (showBorder) {
		if (!isDarkStyle) {
			code.style.border = "1px solid #ddd";
		} else {
			code.style.border = "1px solid #555";
		}
	}
	code.classList.add(lang);
	if (startLine > 0) {
		codeTextSplit = codeText.split("\n");
		code.textContent = codeTextSplit.slice(startLine - 1, endLine).join("\n");
	} else {
		code.textContent = codeText;
	}
	if (typeof hljs != "undefined" && typeof hljs.highlightBlock != "undefined") {
		//hljs.configure({languages: [lang]});
		hljs.highlightBlock(code);
	}
	if (typeof hljs != "undefined" && typeof hljs.lineNumbersBlock != "undefined" && showLineNumbers) {
		hljs.lineNumbersBlock(code, {
			singleLine: true,
			startFrom: startLine > 0 ? Number.parseInt(startLine) : 1
		});
	}

	// Not use a real `pre` to avoid style being overwritten
	// Simulate a real one by using its default style
	const customPre = document.createElement("div");
	customPre.style.whiteSpace = "pre";
	customPre.style.tabSize = tabSize;
	customPre.appendChild(code);
	fileContainer.appendChild(customPre);

	if (showFileMeta) {

		const meta = document.createElement("div");
		meta.innerHTML = `
			<a target="_blank" href="${rawFileURL}" style="float:right">view raw</a>
			<a target="_blank" href="${fileURL}">GitHub: ${rawFileURL.substring(34)}</a>`;
		meta.classList.add("file-meta");
		if (!isDarkStyle) {
			meta.classList.add("file-meta-light");
			if (showBorder) {
				meta.style.border = "1px solid #ddd";
				meta.style.borderTop = "0";
			}
		} else {
			meta.classList.add("file-meta-dark");
			if (showBorder) {
				meta.style.border = "1px solid #555";
				meta.style.borderTop = "0";
			}
		}
		fileContainer.appendChild(meta);
	}
	targetDiv.innerHTML = "";
	targetDiv.appendChild(fileContainer);
}