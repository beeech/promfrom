import { useState, useEffect } from "react";
import { Copy, Check, Plus, X, Tag, Edit3, Trash2, Search, Lock } from "lucide-react";

const ADMIN_PASSWORD = "promfrom2024";

const INITIAL_PROMPTS = [
  {
    id: 1,
    title: "이메일 요약",
    content: "다음 이메일을 읽고 핵심 내용을 3줄로 요약해줘. 요청사항이 있으면 따로 표시해줘:\n\n[이메일 내용 붙여넣기]",
    author: "관리자",
    tag: "업무",
    color: "#FFF9C4",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    title: "회의록 작성",
    content: "다음 회의 내용을 바탕으로 회의록을 작성해줘. 형식: 일시, 참석자, 주요 논의사항, 결정사항, 다음 액션아이템:\n\n[회의 내용]",
    author: "관리자",
    tag: "업무",
    color: "#E8F5E9",
    createdAt: "2024-01-02",
  },
  {
    id: 3,
    title: "SNS 캡션 생성",
    content: "다음 내용을 인스타그램 캡션으로 바꿔줘. 이모지 포함, 해시태그 5개, 톤은 친근하고 트렌디하게:\n\n[주제나 내용]",
    author: "관리자",
    tag: "마케팅",
    color: "#FCE4EC",
    createdAt: "2024-01-03",
  },
  {
    id: 4,
    title: "코드 리뷰 요청",
    content: "다음 코드를 리뷰해줘. 버그, 성능 개선점, 가독성 개선사항을 각각 나눠서 알려줘:\n\n```\n[코드 붙여넣기]\n```",
    author: "관리자",
    tag: "개발",
    color: "#E3F2FD",
    createdAt: "2024-01-04",
  },
  {
    id: 5,
    title: "아이디어 브레인스토밍",
    content: "다음 주제로 창의적인 아이디어 10개를 제안해줘. 실현 가능성보다 다양성에 초점을 맞춰줘:\n\n주제: [주제 입력]",
    author: "관리자",
    tag: "기획",
    color: "#F3E5F5",
    createdAt: "2024-01-05",
  },
  {
    id: 6,
    title: "번역 (영→한)",
    content: "다음 영어 텍스트를 자연스러운 한국어로 번역해줘. 직역보다 의역을 우선하고, 전문 용어는 원문을 괄호 안에 표기해줘:\n\n[영어 텍스트]",
    author: "관리자",
    tag: "언어",
    color: "#FFF3E0",
    createdAt: "2024-01-06",
  },
];

const TAGS = ["전체", "업무", "마케팅", "개발", "기획", "언어", "기타"];
const COLORS = ["#FFF9C4", "#E8F5E9", "#FCE4EC", "#E3F2FD", "#F3E5F5", "#FFF3E0", "#F0F4F8"];

export default function App() {
  const [prompts, setPrompts] = useState(() => {
    const saved = localStorage.getItem("promfrom-prompts");
    return saved ? JSON.parse(saved) : INITIAL_PROMPTS;
  });
  const [selectedTag, setSelectedTag] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", tag: "업무", color: COLORS[0] });

  useEffect(() => {
    localStorage.setItem("promfrom-prompts", JSON.stringify(prompts));
  }, [prompts]);

  const filtered = prompts.filter((p) => {
    const matchTag = selectedTag === "전체" || p.tag === selectedTag;
    const matchSearch =
      p.title.includes(searchQuery) || p.content.includes(searchQuery);
    return matchTag && matchSearch;
  });

  const handleCopy = (prompt, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAdminLogin = () => {
    if (adminInput === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminInput("");
      setAdminError("");
    } else {
      setAdminError("비밀번호가 틀렸어요.");
    }
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editingPrompt) {
      setPrompts(prompts.map((p) => p.id === editingPrompt.id ? { ...p, ...form } : p));
    } else {
      setPrompts([{ id: Date.now(), ...form, author: "관리자", createdAt: new Date().toISOString().split("T")[0] }, ...prompts]);
    }
    setShowWriteForm(false);
    setEditingPrompt(null);
    setForm({ title: "", content: "", tag: "업무", color: COLORS[0] });
  };

  const handleEdit = (prompt, e) => {
    e?.stopPropagation();
    setEditingPrompt(prompt);
    setForm({ title: prompt.title, content: prompt.content, tag: prompt.tag, color: prompt.color });
    setShowWriteForm(true);
    setSelectedPrompt(null);
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    if (confirm("삭제할까요?")) {
      setPrompts(prompts.filter((p) => p.id !== id));
      setSelectedPrompt(null);
    }
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoText}>프롬프롬</span>
            <span style={styles.logoSub}>prompt bookmark</span>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.searchBox}>
              <Search size={14} color="#999" />
              <input
                style={styles.searchInput}
                placeholder="프롬프트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isAdminMode ? (
              <div style={styles.adminBadgeRow}>
                <span style={styles.adminBadge}>관리자 모드</span>
                <button style={styles.btnIcon} onClick={() => { setShowWriteForm(true); setEditingPrompt(null); setForm({ title: "", content: "", tag: "업무", color: COLORS[0] }); }}>
                  <Plus size={16} /> 새 프롬프트
                </button>
                <button style={styles.btnGhost} onClick={() => setIsAdminMode(false)}>로그아웃</button>
              </div>
            ) : (
              <button style={styles.btnGhost} onClick={() => setShowAdminLogin(true)}>
                <Lock size={13} /> 관리자
              </button>
            )}
          </div>
        </div>
        {/* Tag Filter */}
        <div style={styles.tagRow}>
          {TAGS.map((tag) => (
            <button
              key={tag}
              style={{ ...styles.tagBtn, ...(selectedTag === tag ? styles.tagBtnActive : {}) }}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      {/* Main Grid */}
      <main style={styles.main}>
        <div style={styles.grid}>
          {filtered.map((prompt) => (
            <div
              key={prompt.id}
              style={{ ...styles.card, background: prompt.color }}
              onClick={() => setSelectedPrompt(prompt)}
            >
              <div style={styles.cardTag}>
                <Tag size={10} />
                {prompt.tag}
              </div>
              <h3 style={styles.cardTitle}>{prompt.title}</h3>
              <p style={styles.cardPreview}>{prompt.content}</p>
              <div style={styles.cardFooter}>
                <span style={styles.cardAuthor}>{prompt.author} · {prompt.createdAt}</span>
                <div style={styles.cardActions}>
                  {isAdminMode && (
                    <>
                      <button style={styles.iconBtn} onClick={(e) => handleEdit(prompt, e)} title="수정">
                        <Edit3 size={13} />
                      </button>
                      <button style={styles.iconBtn} onClick={(e) => handleDelete(prompt.id, e)} title="삭제">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                  <button
                    style={{ ...styles.copyBtn, ...(copiedId === prompt.id ? styles.copyBtnDone : {}) }}
                    onClick={(e) => handleCopy(prompt, e)}
                  >
                    {copiedId === prompt.id ? <><Check size={12} /> 복사됨</> : <><Copy size={12} /> 복사</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={styles.empty}>프롬프트가 없어요 😢</div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedPrompt && (
        <div style={styles.overlay} onClick={() => setSelectedPrompt(null)}>
          <div style={{ ...styles.modal, background: selectedPrompt.color }} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setSelectedPrompt(null)}><X size={18} /></button>
            <div style={styles.modalTagRow}>
              <Tag size={12} />{selectedPrompt.tag}
            </div>
            <h2 style={styles.modalTitle}>{selectedPrompt.title}</h2>
            <pre style={styles.modalContent}>{selectedPrompt.content}</pre>
            <div style={styles.modalFooter}>
              <span style={styles.cardAuthor}>{selectedPrompt.author} · {selectedPrompt.createdAt}</span>
              <div style={{ display: "flex", gap: 8 }}>
                {isAdminMode && (
                  <>
                    <button style={styles.btnSecondary} onClick={(e) => handleEdit(selectedPrompt, e)}>
                      <Edit3 size={13} /> 수정
                    </button>
                    <button style={styles.btnDanger} onClick={(e) => handleDelete(selectedPrompt.id, e)}>
                      <Trash2 size={13} /> 삭제
                    </button>
                  </>
                )}
                <button
                  style={{ ...styles.copyBtnLarge, ...(copiedId === selectedPrompt.id ? styles.copyBtnDone : {}) }}
                  onClick={(e) => handleCopy(selectedPrompt, e)}
                >
                  {copiedId === selectedPrompt.id ? <><Check size={14} /> 복사됨!</> : <><Copy size={14} /> 클립보드에 복사</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div style={styles.overlay} onClick={() => { setShowAdminLogin(false); setAdminError(""); }}>
          <div style={styles.loginModal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowAdminLogin(false)}><X size={18} /></button>
            <h2 style={styles.loginTitle}>관리자 로그인</h2>
            <p style={styles.loginDesc}>관리자만 프롬프트를 작성·수정할 수 있어요.</p>
            <input
              style={styles.loginInput}
              type="password"
              placeholder="비밀번호 입력"
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              autoFocus
            />
            {adminError && <p style={styles.errorText}>{adminError}</p>}
            <button style={styles.loginBtn} onClick={handleAdminLogin}>로그인</button>
            <p style={styles.loginHint}>초기 비밀번호: promfrom2024</p>
          </div>
        </div>
      )}

      {/* Write / Edit Form Modal */}
      {showWriteForm && (
        <div style={styles.overlay} onClick={() => { setShowWriteForm(false); setEditingPrompt(null); }}>
          <div style={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => { setShowWriteForm(false); setEditingPrompt(null); }}><X size={18} /></button>
            <h2 style={styles.formTitle}>{editingPrompt ? "프롬프트 수정" : "새 프롬프트 작성"}</h2>
            <label style={styles.label}>제목</label>
            <input
              style={styles.input}
              placeholder="프롬프트 제목"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <label style={styles.label}>내용</label>
            <textarea
              style={styles.textarea}
              placeholder="프롬프트 내용을 입력하세요. [대괄호]로 사용자가 채울 부분을 표시해주세요."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <div style={styles.formRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>태그</label>
                <select style={styles.select} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                  {TAGS.filter(t => t !== "전체").map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>카드 색상</label>
                <div style={styles.colorRow}>
                  {COLORS.map((c) => (
                    <div
                      key={c}
                      style={{ ...styles.colorDot, background: c, border: form.color === c ? "2px solid #333" : "2px solid transparent" }}
                      onClick={() => setForm({ ...form, color: c })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button style={styles.saveBtn} onClick={handleSave}>
              {editingPrompt ? "수정 완료" : "저장하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#F7F6F2", fontFamily: "'Noto Sans KR', sans-serif" },
  header: { background: "#fff", borderBottom: "1px solid #E8E4DC", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  logo: { display: "flex", flexDirection: "column", gap: 0 },
  logoText: { fontSize: 22, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.5px" },
  logoSub: { fontSize: 10, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase" },
  headerRight: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "#F5F4F0", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8E4DC" },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#333", width: 160 },
  adminBadgeRow: { display: "flex", alignItems: "center", gap: 8 },
  adminBadge: { fontSize: 11, background: "#1A1A1A", color: "#fff", padding: "3px 8px", borderRadius: 4, fontWeight: 600 },
  btnIcon: { display: "flex", alignItems: "center", gap: 6, background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnGhost: { display: "flex", alignItems: "center", gap: 6, background: "transparent", color: "#666", border: "1px solid #E0DDD6", borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer" },
  tagRow: { maxWidth: 1200, margin: "0 auto", padding: "0 24px 12px", display: "flex", gap: 8, overflowX: "auto" },
  tagBtn: { padding: "5px 14px", borderRadius: 20, border: "1px solid #E0DDD6", background: "transparent", color: "#666", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" },
  tagBtnActive: { background: "#1A1A1A", color: "#fff", border: "1px solid #1A1A1A" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
  card: { borderRadius: 12, padding: "18px 18px 14px", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" },
  cardTag: { display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#1A1A1A", marginBottom: 8, lineHeight: 1.4 },
  cardPreview: { fontSize: 12, color: "#555", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 12 },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" },
  cardAuthor: { fontSize: 10, color: "#999" },
  cardActions: { display: "flex", gap: 6, alignItems: "center" },
  iconBtn: { background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#555", display: "flex" },
  copyBtn: { display: "flex", alignItems: "center", gap: 4, background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" },
  copyBtnDone: { background: "#4CAF50" },
  copyBtnLarge: { display: "flex", alignItems: "center", gap: 6, background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  empty: { gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#999", fontSize: 15 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 },
  modal: { borderRadius: 16, padding: 28, width: "100%", maxWidth: 540, position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalClose: { position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.08)", border: "none", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex" },
  modalTagRow: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#666", marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#1A1A1A", marginBottom: 14 },
  modalContent: { fontSize: 14, color: "#333", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.5)", borderRadius: 10, padding: 16, marginBottom: 16, fontFamily: "inherit" },
  modalFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  btnSecondary: { display: "flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" },
  btnDanger: { display: "flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #ffcdd2", color: "#e53935", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" },
  loginModal: { background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380, position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  loginTitle: { fontSize: 20, fontWeight: 800, marginBottom: 6 },
  loginDesc: { fontSize: 13, color: "#888", marginBottom: 20 },
  loginInput: { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #E0DDD6", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 8 },
  loginBtn: { width: "100%", padding: "12px", background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 },
  loginHint: { fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12 },
  errorText: { fontSize: 12, color: "#e53935", marginBottom: 4 },
  formModal: { background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 520, position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" },
  formTitle: { fontSize: 18, fontWeight: 800, marginBottom: 20 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, marginTop: 14 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #E0DDD6", fontSize: 14, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #E0DDD6", fontSize: 13, outline: "none", boxSizing: "border-box", minHeight: 140, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" },
  formRow: { display: "flex", gap: 16, alignItems: "flex-start", marginTop: 4 },
  select: { padding: "9px 12px", borderRadius: 8, border: "1px solid #E0DDD6", fontSize: 13, outline: "none", width: "100%" },
  colorRow: { display: "flex", gap: 6, marginTop: 6 },
  colorDot: { width: 24, height: 24, borderRadius: "50%", cursor: "pointer" },
  saveBtn: { width: "100%", padding: "12px", background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 20 },
};
