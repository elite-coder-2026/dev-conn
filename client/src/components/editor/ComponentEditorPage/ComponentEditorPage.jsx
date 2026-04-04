import { useState, useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import './ComponentEditorPage.css'

const TABS = [
  { id: 'html', label: 'HTML',       lang: html },
  { id: 'css',  label: 'SCSS',       lang: css  },
  { id: 'js',   label: 'JavaScript', lang: () => javascript() },
]

const DEFAULTS = {
  html: `<div class="btn-wrap">
  <button class="btn">Click me</button>
</div>`,
  css: `* { margin: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }

body {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f0f2f5;
}

.btn {
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  border: none;
  border-radius: 9999px;
  background: #5B4FE9;
  cursor: pointer;
  transition: background 150ms ease;
}

.btn:hover { background: #4A3FD6; }`,
  js: `document.querySelector('.btn').addEventListener('click', () => {
  alert('Button clicked!')
})`,
}

function buildPreviewDoc(htmlCode, cssCode, jsCode) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>${cssCode}</style>
</head>
<body>
${htmlCode}
<script>${jsCode}<\/script>
</body>
</html>`
}

function parseComponentCode(content) {
  const codeMatch = content.match(/```html\n([\s\S]*?)```/)
  if (!codeMatch) return null
  const doc = codeMatch[1]
  const cssMatch  = doc.match(/<style>([\s\S]*?)<\/style>/)
  const jsMatch   = doc.match(/<script>([\s\S]*?)<\/script>/)
  const bodyMatch = doc.match(/<body>\n?([\s\S]*?)\n?<script>/)
  return {
    css:  cssMatch  ? cssMatch[1].trim()  : '',
    js:   jsMatch   ? jsMatch[1].trim()   : '',
    html: bodyMatch ? bodyMatch[1].trim() : '',
  }
}

function parseComponentMeta(content) {
  const get = key => { const m = content.match(new RegExp(`^${key}: (.+)$`, 'm')); return m ? m[1].trim() : '' }
  return { name: get('Component'), version: get('Version'), license: get('License'), deps: get('Dependencies') }
}

function extractDescription(content) {
  const beforeCode = content.split('```html')[0]
  return beforeCode
    .split('\n')
    .filter(l => l.trim() && !/^(Component|Version|Author|License|Dependencies):/.test(l))
    .join(' ')
    .trim()
}

export default function ComponentEditorPage({ currentUser = {} }) {
  const [activeTab,   setActiveTab]   = useState('html')
  const [preview,     setPreview]     = useState('')
  const [compName,    setCompName]    = useState('')
  const [version,     setVersion]     = useState('1.0.0')
  const [license,     setLicense]     = useState('MIT')
  const [deps,        setDeps]        = useState('')
  const [desc,        setDesc]        = useState('')
  const [docs,        setDocs]        = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')
  const [components,  setComponents]  = useState([])

  const containerRef = useRef(null)
  const viewsRef     = useRef({})
  const docsRef      = useRef(DEFAULTS)

  useEffect(() => {
    if (!containerRef.current) return

    TABS.forEach(({ id, lang }) => {
      const parent = document.createElement('div')
      parent.dataset.tab = id
      parent.style.display = id === 'html' ? 'block' : 'none'
      containerRef.current.appendChild(parent)

      const view = new EditorView({
        doc: DEFAULTS[id],
        extensions: [basicSetup, lang(), oneDark],
        parent,
        dispatch(tr) {
          view.update([tr])
          if (tr.docChanged) docsRef.current[id] = view.state.doc.toString()
        },
      })
      viewsRef.current[id] = { view, parent }
    })

    return () => {
      Object.values(viewsRef.current).forEach(({ view, parent }) => {
        view.destroy()
        parent.remove()
      })
      viewsRef.current = {}
    }
  }, [])

  useEffect(() => {
    fetch('/api/feed/components', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(setComponents)
      .catch(() => {})
  }, [])

  function handleLoad(row) {
    const code = parseComponentCode(row.content)
    const meta = parseComponentMeta(row.content)
    if (!code) return
    Object.entries(code).forEach(([id, text]) => {
      const entry = viewsRef.current[id]
      if (!entry) return
      entry.view.dispatch({ changes: { from: 0, to: entry.view.state.doc.length, insert: text } })
      docsRef.current[id] = text
    })
    setCompName(meta.name)
    setVersion(meta.version || '1.0.0')
    setLicense(meta.license || 'MIT')
    setDeps(meta.deps)
    setPreview('')
  }

  function switchTab(id) {
    Object.values(viewsRef.current).forEach(({ parent }) => {
      parent.style.display = 'none'
    })
    viewsRef.current[id].parent.style.display = 'block'
    viewsRef.current[id].view.focus()
    setActiveTab(id)
  }

  function handleRender() {
    setPreview(buildPreviewDoc(
      docsRef.current.html,
      docsRef.current.css,
      docsRef.current.js,
    ))
  }

  async function handleSave() {
    const htmlCode = docsRef.current.html
    const cssCode  = docsRef.current.css
    const jsCode   = docsRef.current.js

    if (!compName.trim()) { setError('Component name is required'); return }
    setError('')
    setSaving(true)

    const lines = [
      `Component: ${compName.trim()}`,
      `Version: ${version.trim()}`,
      `Author: ${currentUser.name} (${currentUser.handle})`,
      `License: ${license.trim()}`,
    ]
    if (deps.trim()) lines.push(`Dependencies: ${deps.trim()}`)
    if (desc.trim()) lines.push(`\n${desc.trim()}`)
    if (docs.trim()) lines.push(`\n## Documentation\n${docs.trim()}`)

    lines.push(`\n\`\`\`html\n${buildPreviewDoc(htmlCode, cssCode, jsCode)}\n\`\`\``)

    try {
      const res = await fetch('/api/posts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: lines.join('\n') }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Save failed'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Could not reach the server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="comp-editor">

      <div className="comp-editor__header">
        <h1 className="comp-editor__title">Component Editor</h1>
      </div>

      <div className="comp-editor__editor-wrap">
        <div className="comp-editor__tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`comp-editor__tab${activeTab === t.id ? ' comp-editor__tab--active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="comp-editor__codemirror" ref={containerRef} />
        <div className="comp-editor__editor-actions">
          <button className="comp-editor__render-btn" onClick={handleRender}>
            Render preview
          </button>
        </div>
      </div>

      {preview && (
        <div className="comp-editor__preview-wrap">
          <div className="comp-editor__section-label">
            Preview
            <button className="comp-editor__preview-close" onClick={() => setPreview('')}>✕</button>
          </div>
          <iframe
            className="comp-editor__preview"
            srcDoc={preview}
            sandbox="allow-scripts"
            title="Component preview"
          />
        </div>
      )}

      <div className="comp-editor__meta-card">
        <div className="comp-editor__meta-label">Component details</div>

        <div className="comp-editor__fields">
          <div className="comp-editor__field-row">
            <div className="comp-editor__field">
              <label className="comp-editor__label">Component name *</label>
              <input
                className="comp-editor__input"
                type="text"
                placeholder="e.g. GradientButton"
                value={compName}
                onChange={e => setCompName(e.target.value)}
              />
            </div>
            <div className="comp-editor__field">
              <label className="comp-editor__label">Version</label>
              <input
                className="comp-editor__input"
                type="text"
                placeholder="1.0.0"
                value={version}
                onChange={e => setVersion(e.target.value)}
              />
            </div>
            <div className="comp-editor__field">
              <label className="comp-editor__label">License</label>
              <input
                className="comp-editor__input"
                type="text"
                placeholder="MIT"
                value={license}
                onChange={e => setLicense(e.target.value)}
              />
            </div>
          </div>

          <div className="comp-editor__field-row">
            <div className="comp-editor__field">
              <label className="comp-editor__label">Author</label>
              <input
                className="comp-editor__input"
                type="text"
                value={currentUser.name ? `${currentUser.name} (${currentUser.handle})` : ''}
                readOnly
              />
            </div>
            <div className="comp-editor__field">
              <label className="comp-editor__label">Dependencies</label>
              <input
                className="comp-editor__input"
                type="text"
                placeholder="e.g. Vanilla JS, GSAP"
                value={deps}
                onChange={e => setDeps(e.target.value)}
              />
            </div>
          </div>

          <div className="comp-editor__field">
            <label className="comp-editor__label">Description</label>
            <textarea
              className="comp-editor__textarea"
              placeholder="What does this component do?"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={2}
            />
          </div>

          <div className="comp-editor__field">
            <label className="comp-editor__label">Documentation (Markdown)</label>
            <textarea
              className="comp-editor__textarea comp-editor__textarea--docs"
              placeholder={`## Usage\n\nDescribe how to use this component...\n\n## Props\n\n| Prop | Type | Description |\n|------|------|-------------|`}
              value={docs}
              onChange={e => setDocs(e.target.value)}
              rows={10}
              spellCheck={false}
            />
          </div>
        </div>

        {error && <p className="comp-editor__error">{error}</p>}

        <div className="comp-editor__save-row">
          <button
            className="comp-editor__save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save component'}
          </button>
        </div>
      </div>

      {components.length > 0 && (
        <div className="comp-editor__library">
          <div className="comp-editor__library-label">Component library</div>
          <div className="comp-editor__library-grid">
            {components.map(row => (
              <div key={row.id} className="comp-editor__lib-card">
                <div className="comp-editor__lib-name">{parseComponentMeta(row.content).name}</div>
                <div className="comp-editor__lib-author">@{row.author_handle.replace(/^@/, '')}</div>
                <div className="comp-editor__lib-desc">{extractDescription(row.content)}</div>
                <button className="comp-editor__lib-load" onClick={() => handleLoad(row)}>Load</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
