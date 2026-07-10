import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Link } from 'react-router-dom';
import './AdminPage.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export default function AdminPage() {
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [content, setContent] = useState('');
  const [sha, setSha] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });
  const editorRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/files`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const loadFile = async (file) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/file?path=${file.path}`);
      const data = await res.json();
      setContent(data.content);
      setSha(data.sha);
      setCurrentFile(file);
      setIsPreview(false);
    } catch (err) {
      console.error('Failed to load file:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!currentFile) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentFile.path,
          content,
          sha,
          message: `Update ${currentFile.name}`,
        }),
      });
      const data = await res.json();
      if (data.sha) setSha(data.sha);
      showToast('saved');
    } catch (err) {
      showToast('save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const createFile = async () => {
    const name = prompt('note name (without .md):');
    if (!name) return;
    const path = name.endsWith('.md') ? name : `${name}.md`;
    try {
      const res = await fetch(`${API_BASE}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          content: `---\ntitle: ${name}\ndate: ${new Date().toISOString().split('T')[0]}\n---\n\n# ${name}\n`,
          message: `Create ${path}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadFiles();
        await loadFile({ path, name });
        showToast('created');
      }
    } catch (err) {
      showToast('create failed', 'error');
    }
  };

  const deleteFile = async () => {
    if (!currentFile) return;
    if (!confirm(`delete ${currentFile.name}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentFile.path,
          sha,
          message: `Delete ${currentFile.name}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentFile(null);
        setContent('');
        setSha('');
        await loadFiles();
        showToast('deleted');
      }
    } catch (err) {
      showToast('delete failed', 'error');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const insertMarkdown = (syntax) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newText = before + syntax.replace('$1', selected) + after;
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + syntax.indexOf('$1');
      textarea.selectionEnd = start + syntax.indexOf('$1') + selected.length;
    }, 0);
  };

  return (
    <div className="admin-app">
      <aside className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <FileIcon />
            </div>
            <span className="sidebar-title">notes</span>
          </div>
        </div>

        <div className="sidebar-actions">
          <button className="btn-new" onClick={createFile}>
            + new
          </button>
        </div>

        <div className="search-wrapper">
          <input
            className="search-input"
            type="text"
            placeholder="search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="file-list">
          {filteredFiles.length === 0 ? (
            <div className="empty-state">
              {files.length === 0 ? '// no notes yet\n// click + new to create' : '// no matches'}
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div
                key={file.path}
                className={`file-item ${currentFile?.path === file.path ? 'active' : ''}`}
                onClick={() => loadFile(file)}
              >
                <span className="file-dot" />
                <span className="file-name">{file.name.replace('.md', '')}</span>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <span className="file-count">{files.length} files</span>
          <div className="footer-actions">
            <Link to="/" className="view-link">
              read
            </Link>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        {!showSidebar && (
          <button className="show-sidebar-btn" onClick={() => setShowSidebar(true)}>
            <MenuIcon />
          </button>
        )}

        {currentFile ? (
          <>
            <div className="toolbar">
              <div className="toolbar-left">
                <span className="current-file-icon" />
                <span className="current-file">{currentFile.name.replace('.md', '')}</span>
              </div>
              <div className="toolbar-center">
                <button
                  className={`toolbar-btn ${!isPreview ? 'active' : ''}`}
                  onClick={() => setIsPreview(false)}
                >
                  edit
                </button>
                <button
                  className={`toolbar-btn ${isPreview ? 'active' : ''}`}
                  onClick={() => setIsPreview(true)}
                >
                  preview
                </button>
              </div>
              <div className="toolbar-right">
                <div className="markdown-tools">
                  <button onClick={() => insertMarkdown('**$1**')} title="bold">B</button>
                  <button onClick={() => insertMarkdown('*$1*')} title="italic">I</button>
                  <button onClick={() => insertMarkdown('~~$1~~')} title="strikethrough">S</button>
                  <button onClick={() => insertMarkdown('`$1`')} title="code">&lt;/&gt;</button>
                  <button onClick={() => insertMarkdown('\n```\n$1\n```\n')} title="code block">{'{ }'}</button>
                  <button onClick={() => insertMarkdown('[$1](url)')} title="link">link</button>
                  <button onClick={() => insertMarkdown('![alt](url)')} title="image">img</button>
                  <button onClick={() => insertMarkdown('\n> $1\n')} title="quote">quote</button>
                  <button onClick={() => insertMarkdown('\n- $1\n')} title="list">list</button>
                </div>
                <button
                  className="btn-save"
                  onClick={saveFile}
                  disabled={saving}
                >
                  {saving ? 'saving...' : 'save'}
                </button>
                <button className="btn-delete" onClick={deleteFile}>
                  <TrashIcon />
                </button>
              </div>
            </div>

            <div className="editor-container">
              {loading ? (
                <div className="loading">loading...</div>
              ) : isPreview ? (
                <div className="preview">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  ref={editorRef}
                  className="editor"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="> start writing... (Ctrl+S to save)"
                  spellCheck={false}
                />
              )}
            </div>
          </>
        ) : (
          <div className="welcome">
            <div className="welcome-content">
              <div className="welcome-icon">
                <FileIcon />
              </div>
              <h1>// admin</h1>
              <p>create, edit, and manage your notes</p>
              <div className="welcome-features">
                <div className="feature">
                  <span className="feature-dot" />
                  markdown editor
                </div>
                <div className="feature">
                  <span className="feature-dot" />
                  live preview
                </div>
                <div className="feature">
                  <span className="feature-dot" />
                  github sync
                </div>
              </div>
              <button className="btn-start" onClick={createFile}>
                + new note
              </button>
            </div>
          </div>
        )}
      </main>

      <div id="toast" className="toast hidden"></div>
    </div>
  );
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => {
    toast.className = 'toast hidden';
  }, 2000);
}
