import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Link, useSearchParams } from 'react-router-dom';
import './ReadPage.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const NoteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export default function ReadPage() {
  const [files, setFiles] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [noteLoading, setNoteLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    const notePath = searchParams.get('note');
    if (notePath && files.length > 0) {
      const file = files.find(f => f.path === notePath);
      if (file) loadNote(file);
    }
  }, [searchParams, files]);

  const loadFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/files`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNote = async (file) => {
    setNoteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/file?path=${file.path}`);
      const data = await res.json();
      setNoteContent(data.content);
      setCurrentNote(file);
    } catch (err) {
      console.error('Failed to load note:', err);
    } finally {
      setNoteLoading(false);
    }
  };

  const openNote = (file) => {
    setSearchParams({ note: file.path });
  };

  const goBack = () => {
    setSearchParams({});
    setCurrentNote(null);
    setNoteContent('');
  };

  const extractTitle = (content) => {
    const match = content.match(/^---[\s\S]*?title:\s*(.+?)[\s\S]*?---/);
    if (match) return match[1].trim();
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();
    return null;
  };

  const extractDate = (content) => {
    const match = content.match(/^---[\s\S]*?date:\s*(.+?)[\s\S]*?---/);
    return match ? match[1].trim() : null;
  };

  const extractExcerpt = (content) => {
    const cleaned = content.replace(/^---[\s\S]*?---\n*/m, '').replace(/^#\s+.+\n*/m, '').trim();
    const firstParagraph = cleaned.split('\n\n')[0];
    return firstParagraph.length > 120 ? firstParagraph.substring(0, 120) + '...' : firstParagraph;
  };

  const sortedFiles = [...files].sort((a, b) => {
    const contentA = a.name || '';
    const contentB = b.name || '';
    return contentB.localeCompare(contentA);
  });

  if (currentNote) {
    return (
      <div className="read-page">
        <header className="read-header">
          <div className="read-header-inner">
            <button className="back-btn" onClick={goBack}>
              <span className="bracket">[</span>
              <BackIcon />
              <span>返回列表</span>
              <span className="bracket">]</span>
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </header>

        <article className="read-article">
          {noteLoading ? (
            <div className="read-loading">加载中...</div>
          ) : (
            <div className="read-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {noteContent}
              </ReactMarkdown>
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="read-page">
      <header className="read-header">
        <div className="read-header-inner">
          <Link to="/" className="site-logo">
            <NoteIcon />
            <span className="bracket">[</span>
            <span>笔记</span>
            <span className="bracket">]</span>
          </Link>
          <div className="header-actions">
            <Link to="/admin" className="admin-link">
              <span className="bracket">[</span>
              管理
              <span className="bracket">]</span>
            </Link>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="read-main">
        {loading ? (
          <div className="read-loading">加载中...</div>
        ) : sortedFiles.length === 0 ? (
          <div className="read-empty">
            <div className="empty-icon">
              <NoteIcon />
            </div>
            <h2>
              <span className="bracket">//</span> 还没有笔记
            </h2>
            <p>
              <Link to="/admin">
                <span className="bracket">[</span>去管理页面<span className="bracket">]</span>
              </Link> 创建第一篇笔记
            </p>
          </div>
        ) : (
          <div className="note-grid">
            {sortedFiles.map((file) => (
              <article
                key={file.path}
                className="note-card"
                onClick={() => openNote(file)}
              >
                <div className="note-card-header">
                  <span className="bracket">&gt;</span>
                  <h2 className="note-title">
                    {file.name.replace('.md', '')}
                  </h2>
                </div>
                <div className="note-meta">
                  <span className="bracket">//</span>
                  <span>{file.name.replace('.md', '')}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="read-footer">
        <p>
          <span className="bracket">/*</span> 基于 GitHub 的免费笔记系统 <span className="bracket">*/</span>
        </p>
      </footer>
    </div>
  );
}
