import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [content, setContent] = useState('');
  const [sha, setSha] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const editorRef = useRef(null);

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
    <div className="app">
      {/* 侧边栏 */}
      <aside className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>📝 在线笔记</h2>
          <button className="icon-btn" onClick={() => setShowSidebar(false)} title="收起">
            ◀
          </button>
        </div>

        <div className="sidebar-actions">
          <button className="btn btn-primary" onClick={createFile}>
            + 新建笔记
          </button>
        </div>

        <input
          className="search-input"
          type="text"
          placeholder="搜索笔记..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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
                <span className="file-icon">📄</span>
                <span className="file-name">{file.name.replace('.md', '')}</span>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <span className="file-count">{files.length} 篇笔记</span>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="main">
        {!showSidebar && (
          <button className="icon-btn show-sidebar-btn" onClick={() => setShowSidebar(true)} title="展开">
            ▶
          </button>
        )}

        {currentFile ? (
          <>
            {/* 工具栏 */}
            <div className="toolbar">
              <div className="toolbar-left">
                <span className="current-file">📄 {currentFile.name}</span>
              </div>
              <div className="toolbar-center">
                <button
                  className={`toolbar-btn ${!isPreview ? 'active' : ''}`}
                  onClick={() => setIsPreview(false)}
                >
                  ✏️ 编辑
                </button>
                <button
                  className={`toolbar-btn ${isPreview ? 'active' : ''}`}
                  onClick={() => setIsPreview(true)}
                >
                  👁️ 预览
                </button>
              </div>
              <div className="toolbar-right">
                <div className="markdown-tools">
                  <button onClick={() => insertMarkdown('**$1**')} title="粗体">B</button>
                  <button onClick={() => insertMarkdown('*$1*')} title="斜体"><em>I</em></button>
                  <button onClick={() => insertMarkdown('~~$1~~')} title="删除线"><s>S</s></button>
                  <button onClick={() => insertMarkdown('`$1`')} title="行内代码">&lt;/&gt;</button>
                  <button onClick={() => insertMarkdown('\n```\n$1\n```\n')} title="代码块">{'{ }'}</button>
                  <button onClick={() => insertMarkdown('[$1](url)')} title="链接">🔗</button>
                  <button onClick={() => insertMarkdown('![alt](url)')} title="图片">🖼️</button>
                  <button onClick={() => insertMarkdown('\n> $1\n')} title="引用">❝</button>
                  <button onClick={() => insertMarkdown('\n- $1\n')} title="列表">☰</button>
                </div>
                <button
                  className="btn btn-success"
                  onClick={saveFile}
                  disabled={saving}
                >
                  {saving ? '保存中...' : '💾 保存'}
                </button>
                <button className="btn btn-danger" onClick={deleteFile}>
                  🗑️
                </button>
              </div>
            </div>

            {/* 编辑/预览区 */}
            <div className="editor-container">
              {loading ? (
                <div className="loading">加载中...</div>
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
                  placeholder="开始写作... (Ctrl+S 保存)"
                  spellCheck={false}
                />
              )}
            </div>
          </>
        ) : (
          <div className="welcome">
            <div className="welcome-content">
              <h1>📝 在线笔记</h1>
              <p>基于 GitHub 仓库的免费在线笔记系统</p>
              <div className="welcome-features">
                <div className="feature">✅ Markdown 实时编辑</div>
                <div className="feature">✅ GitHub 自动备份</div>
                <div className="feature">✅ 全文搜索</div>
                <div className="feature">✅ 免费无限存储</div>
              </div>
              <button className="btn btn-primary btn-large" onClick={createFile}>
                创建第一篇笔记
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Toast 提示 */}
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
