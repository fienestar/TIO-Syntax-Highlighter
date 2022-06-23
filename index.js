const script = document.createElement('script');
script.src = chrome.runtime.getURL('syntax-highlight.js');
script.onload = () => script.remove()

document.body.appendChild(script);
