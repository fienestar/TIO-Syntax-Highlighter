(async () => {
    const language_table = {
        'apl': 'text/apl',
        'cpp': 'text/x-c++src',
        'c': 'text/x-csrc',
        'python3': 'text/x-python',
        'python2': 'text/x-python',
        'javascript': 'text/javascript',
        'ecmascript': 'text/ecmascript',
        'typescript': 'text/typescript',
    }

    function loadCSS(href) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.type = 'text/css'
        link.href = href
        link.crossOrigin = 'anonymous'
        link.referrerPolicy = 'no-referrer'
        document.head.appendChild(link)
        return link
    }

    function loadJS(src) {
        return new Promise(resolve => {
            const script = document.createElement('script')
            script.src = src
            script.crossOrigin = 'anonymous'
            script.referrerPolicy = 'no-referrer'
            script.addEventListener('load', () => resolve())
            document.body.appendChild(script)
        })
    }

    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.css')
    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/theme/material-darker.min.css')
    await loadJS('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.js')
    await loadJS('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/addon/mode/loadmode.min.js')
    await loadJS('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/meta.min.js')
    
    CodeMirror.modeURL = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/%N/%N.min.js";

    function waitLoadable() {
        return new Promise(resolve => {
            const interpreter_toggle = document.getElementById("toggle-interpreter")
            if (interpreter_toggle.checked === true)
                resolve()
            else {
                const interval_id = setInterval(() => {
                    if(interpreter_toggle.checked === true){
                        clearInterval(interval_id)
                        resolve()
                    }
                }, 250)
            }
        })
    }

    await waitLoadable()

    const box = document.createElement('div')
    box.id = 'code-box'
    const code = document.getElementById('code')
    code.parentElement.insertBefore(box, code)
    box.appendChild(code)

    function getMode() {
        if (typeof languageId === 'undefined')
            return 'null'
        const language = languageId.split('-')[0]
        const mode = language_table[language] ?? 'text/x-' + language;
        const info = CodeMirror.findModeByMIME(mode);
        if (info && editor_exists_flag)
            CodeMirror.autoLoadMode(editor, info.mode)
        return mode
    }

    let editor_exists_flag = false
    const editor = CodeMirror.fromTextArea(code, {
        theme: 'material-darker',
        lineNumbers: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
        mode: getMode(),
        indentUnit: 4,
        lineWrapping: true,
        tabSize: 4,
        extraKeys: {
            'Tab': () => { },
        },
        indentWithTabs: true
    });
    editor_exists_flag = true
    getMode()

    function updateByteCount(code) {
        const encoding = languages[languageId].encoding
        const characterCount = countBytes(code, "SBCS");
        const byteCount = countBytes(code, encoding);

        $("#code-info").textContent = pluralization(characterCount, "char");
        $("#code-info").textContent += ", " + pluralization(byteCount, "byte") + " (" + encoding + ")";
    }

    editor.on('change', instance => {
        updateByteCount(instance.getValue())
    })

    const run_element = document.getElementById('run')
    let old_run_onclick = run_element.onclick
    run_element.onclick = () => {
        $('#code').value = editor.getValue()
        old_run_onclick()
    }

    const lang_example_element = document.getElementById("lang-example")
    let old_lang_example_onclick = lang_example_element.onclick
    lang_example_element.onclick = () => {
        old_lang_example_onclick()
        editor.setValue($('#code').value)
    }

    new MutationObserver(() => {
        editor.setOption('mode', getMode());
    }).observe(document.getElementById('lang-link'), {
        attributes: true
    })
})()
