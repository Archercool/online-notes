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

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const NoteIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
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
      showToast('已保存');
    } catch (err) {
      showToast('保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const createFile = async () => {
    const name = prompt('新笔记名称（不含 .md 后缀）：');
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
        showToast('已创建');
      }
    } catch (err) {
      showToast('创建失败', 'error');
    }
  };

  const deleteFile = async () => {
    if (!currentFile) return;
    if (!confirm(`确定删除 ${currentFile.name}？`)) return;
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
        showToast('已删除');
      }
    } catch (err) {
      showToast('删除失败', 'error');
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
              <NoteIcon />
            </div>
            <span className="sidebar-title">
              <span className="bracket">[</span>
              笔记管理
              <span className="bracket">]</span>
            </span>
          </div>
        </div>

        <div className="sidebar-actions">
          <button className="btn-new" onClick={createFile}>
            <span className="bracket">+</span>
            新建笔记
          </button>
        </div>

        <div className="search-wrapper">
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            className="search-input"
            type="text"
            placeholder="搜索笔记..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="file-list">
          {filteredFiles.length === 0 ? (
            <div className="empty-state">
              {files.length === 0 ? '还没有笔记\n点击上方按钮创建' : '没有匹配的笔记'}
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
          <span className="file-count">{files.length} 篇笔记</span>
          <div className="footer-actions">
            <Link to="/" className="view-link" title="查看阅读页面">
              <span className="bracket">[</span>
              阅读
              <span className="bracket">]</span>
            </Link>
            <button className="theme-toggle" onClick={toggleTheme} title="切换主题">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        {!showSidebar && (
          <button className="show-sidebar-btn" onClick={() => setShowSidebar(true)} title="展开侧边栏">
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
                  编辑
                </button>
                <button
                  className={`toolbar-btn ${isPreview ? 'active' : ''}`}
                  onClick={() => setIsPreview(true)}
                >
                  预览
                </button>
              </div>
              <div className="toolbar-right">
                <div className="markdown-tools">
                  <button onClick={() => insertMarkdown('**$1**')} title="粗体">B</button>
                  <button onClick={() => insertMarkdown('*$1*')} title="斜体"><em>I</em></button>
                  <button onClick={() => insertMarkdown('~~$1~~')} title="删除线"><s>S</s></button>
                  <button onClick={() => insertMarkdown('`$1`')} title="行内代码">&lt;/&gt;</button>
                  <button onClick={() => insertMarkdown('\n```\n$1\n```\n')} title="代码块">{'{ }'}</button>
                  <button onClick={() => insertMarkdown('[$1](url)')} title="链接">链接</button>
                  <button onClick={() => insertMarkdown('![alt](url)')} title="图片">图片</button>
                  <button onClick={() => insertMarkdown('\n> $1\n')} title="引用">引用</button>
                  <button onClick={() => insertMarkdown('\n- $1\n')} title="列表">列表</button>
                </div>
                <button
                  className="btn-save"
                  onClick={saveFile}
                  disabled={saving}
                >
                  <span className="bracket">[</span>
                  {saving ? '保存中...' : '保存'}
                  <span className="bracket">]</span>
                </button>
                <button className="btn-delete" onClick={deleteFile} title="删除笔记">
                  <TrashIcon />
                </button>
              </div>
            </div>

            <div className="editor-container">
              {loading ? (
                <div className="loading">
                  <span className="bracket">&gt;</span> 加载中...
                </div>
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
                  placeholder="> 开始写作... (Ctrl+S 保存)"
                  spellCheck={false}
                />
              )}
            </div>
          </>
        ) : (
          <div className="welcome">
            <div className="welcome-content">
              <div className="welcome-icon">
                <NoteIcon />
              </div>
              <h1>
                <span className="bracket">[</span>
                笔记管理
                <span className="bracket">]</span>
              </h1>
              <p>
                <span className="bracket">//</span> 在这里创建、编辑和管理你的笔记
              </p>
              <div className="welcome-features">
                <div className="feature">
                  <span className="feature-dot" />
                  <span className="bracket">&gt;</span> 创建和编辑 Markdown 笔记
                </div>
                <div className="feature">
                  <span className="feature-dot" />
                  <span className="bracket">&gt;</span> 实时预览渲染效果
                </div>
                <div className="feature">
                  <span className="feature-dot" />
                  <span className="bracket">&gt;</span> 自动保存到 GitHub
                </div>
              </div>
              <button className="btn-start" onClick={createFile}>
                <span className="bracket">[</span>
                创建第一篇笔记
                <span className="bracket">]</span>
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
