import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gnlyyisxfncrsiehhvnn.supabase.co";
const SUPABASE_KEY = "sb_publishable_-uIIPeG5B7YrByAhE2nc6Q_9iJJX4F3";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Google Fonts - Syne (볼드하고 디자인된 느낌)
const FONT_LINK = document.createElement("link");
FONT_LINK.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap";
FONT_LINK.rel = "stylesheet";
document.head.appendChild(FONT_LINK);
import { Copy, Check, Plus, X, Tag, Edit3, Trash2, Search, Lock } from "lucide-react";

const ADMIN_PASSWORD = "khw0508";

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

const INITIAL_TAGS = ["업무", "마케팅", "개발", "기획", "언어", "기타"];
const AI_TOOLS = [
  { id: "all", label: "전체 공통", emoji: "✦" },
  { id: "chatgpt", label: "ChatGPT", emoji: "🤖" },
  { id: "claude", label: "Claude", emoji: "🔮" },
  { id: "gemini", label: "Gemini", emoji: "✨" },
  { id: "midjourney", label: "Midjourney", emoji: "🎨" },
  { id: "dalle", label: "DALL-E", emoji: "🖼️" },
  { id: "stable", label: "Stable Diffusion", emoji: "🌈" },
];

const COLORS = ["#FFF9C4", "#E8F5E9", "#FCE4EC", "#E3F2FD", "#F3E5F5", "#FFF3E0", "#F0F4F8", "#2D4EFF", "#1A33CC", "#0A1FA8", "#6B82FF", "#B8CAFF"];

function getTextColor(hexColor) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#1A1A1A" : "#FFFFFF";
}

function lightenColor(hexColor, amount = 0.6) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);
  return "#" + [newR, newG, newB].map(v => v.toString(16).padStart(2, "0")).join("");
}

const RESPONSIVE_CSS = `

  .promfrom-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
    width: 100%;
    box-sizing: border-box;
  }
  .promfrom-grid > * {
    min-width: 0;
  }
  @media (max-width: 600px) {
    .promfrom-grid { grid-template-columns: 1fr; gap: 12px; }
  }
  @media (max-width: 600px) {
    body { padding: 0 !important; }
  }
`;

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [form, setForm] = useState({ title: "", content: "", tags: [], color: COLORS[0], aiTool: [], source: "", description: "" });
  const [newTagInput, setNewTagInput] = useState("");
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [formTagInput, setFormTagInput] = useState("");
  const [showFormTagInput, setShowFormTagInput] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = RESPONSIVE_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Supabase 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: promptsData } = await supabase.from("prompts").select("*").order("id", { ascending: false });
    const { data: tagsData } = await supabase.from("tags").select("*").order("order", { ascending: true });
    if (promptsData) setPrompts(promptsData.map(p => ({ ...p, aiTool: p.ai_tool || [], tags: p.tags || [], createdAt: p.created_at ? p.created_at.split("T")[0] : "" })));
    if (tagsData) setCustomTags(tagsData.map(t => t.name));
    setLoading(false);
  };

  const allTags = ["전체", ...customTags];

  const filtered = prompts.filter((p) => {
    const matchTag = selectedTag === "전체" || (Array.isArray(p.tags) ? p.tags.includes(selectedTag) : p.tag === selectedTag);
    const matchSearch = p.title.includes(searchQuery) || p.content.includes(searchQuery);
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

  const handleAddFormTag = async () => {
    const trimmed = formTagInput.trim();
    if (!trimmed) return;
    if (!customTags.includes(trimmed)) {
      await supabase.from("tags").insert([{ name: trimmed, order: customTags.length }]);
      await loadData();
    }
    if (!form.tags.includes(trimmed)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setFormTagInput("");
    setShowFormTagInput(false);
  };

  const handleAddTag = async () => {
    const trimmed = newTagInput.trim();
    if (!trimmed || customTags.includes(trimmed)) return;
    await supabase.from("tags").insert([{ name: trimmed, order: customTags.length }]);
    await loadData();
    setNewTagInput("");
    setShowNewTagInput(false);
  };

  const handleDeleteTag = async (tagToDelete, e) => {
    e?.stopPropagation();
    const affectedCount = prompts.filter(p => Array.isArray(p.tags) ? p.tags.includes(tagToDelete) : p.tag === tagToDelete).length;
    if (affectedCount > 0) {
      const ok = window.confirm('"' + tagToDelete + '" 태그를 사용 중인 프롬프트가 ' + affectedCount + '개 있어요.\n삭제하면 해당 프롬프트에서 이 태그가 제거됩니다. 계속할까요?');
      if (!ok) return;
    }
    await supabase.from("tags").delete().eq("name", tagToDelete);
    // 해당 태그 사용중인 프롬프트에서도 제거
    const affected = prompts.filter(p => Array.isArray(p.tags) ? p.tags.includes(tagToDelete) : p.tag === tagToDelete);
    for (const p of affected) {
      const newTags = (p.tags || []).filter(t => t !== tagToDelete);
      await supabase.from("prompts").update({ tags: newTags }).eq("id", p.id);
    }
    await loadData();
    if (selectedTag === tagToDelete) setSelectedTag("전체");
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const payload = {
      title: form.title,
      content: form.content,
      tags: form.tags,
      color: form.color,
      ai_tool: form.aiTool,
      source: form.source,
      description: form.description,
      author: "관리자",
    };
    if (editingPrompt) {
      await supabase.from("prompts").update(payload).eq("id", editingPrompt.id);
    } else {
      await supabase.from("prompts").insert([{ ...payload, id: Date.now() }]);
    }
    await loadData();
    setShowWriteForm(false);
    setEditingPrompt(null);
    setForm({ title: "", content: "", tags: [], color: COLORS[0], aiTool: [], source: "", description: "" });
  };

  const handleEdit = (prompt, e) => {
    e?.stopPropagation();
    setEditingPrompt(prompt);
    setForm({ title: prompt.title, content: prompt.content, tags: Array.isArray(prompt.tags) ? prompt.tags : (prompt.tag ? [prompt.tag] : []), color: prompt.color, aiTool: Array.isArray(prompt.aiTool) ? prompt.aiTool : (prompt.aiTool && prompt.aiTool !== "all" ? [prompt.aiTool] : []), source: prompt.source || "", description: prompt.description || "" });
    setShowFormTagInput(false);
    setFormTagInput("");
    setShowWriteForm(true);
    setSelectedPrompt(null);
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (confirm("이 프롬프트를 삭제할까요?")) {
      await supabase.from("prompts").delete().eq("id", id);
      await loadData();
      setSelectedPrompt(null);
    }
  };

  const openWriteForm = () => {
    setEditingPrompt(null);
    setForm({ title: "", content: "", tags: [], color: COLORS[0], aiTool: [], source: "", description: "" });
    setShowFormTagInput(false);
    setFormTagInput("");
    setShowWriteForm(true);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 40, height: 40, border: "3px solid #E8ECFF", borderTop: "3px solid #2D4EFF", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: "#2D4EFF", fontWeight: 700, fontSize: 14 }}>불러오는 중...</span>
    </div>
  );

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoText}>프롬프롬</span>
            <span style={styles.logoSub}>prompt bookmark</span>
            <span style={styles.logoTagline}>쓸만한 프롬프트, 찾지 말고 꺼내 쓰세요<span style={{color:"#2D4EFF", fontWeight:700, marginLeft:2}}>_</span></span>
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
                <button style={styles.btnIcon} onClick={openWriteForm}>
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
          {allTags.map((tag) => (
            <div key={tag} style={styles.tagItem}>
              <button
                style={{ ...styles.tagBtn, ...(selectedTag === tag ? styles.tagBtnActive : {}) }}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
              {isAdminMode && tag !== "전체" && (
                <button style={styles.tagDeleteBtn} onClick={(e) => handleDeleteTag(tag, e)}>
                  <X size={9} />
                </button>
              )}
            </div>
          ))}
          {isAdminMode && (
            <button style={styles.tagAddBtn} onClick={() => setShowNewTagInput(true)}>
              <Plus size={13} /> 태그 추가
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main style={styles.main}>
        <div className="promfrom-grid">
          {filtered.map((prompt) => (
            <div
              key={prompt.id}
              style={{ ...styles.card, background: prompt.color }}
              onClick={() => setSelectedPrompt(prompt)}
            >
              {(prompt.tags?.length > 0 || prompt.tag) && (
                <div style={styles.cardTagRow}>
                  {(prompt.tags?.length > 0 ? prompt.tags : [prompt.tag]).map(t => (
                    <span key={t} style={{ ...styles.cardTagChip, color: getTextColor(prompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.8)" : "#555", background: getTextColor(prompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)" }}>{t}</span>
                  ))}
                </div>
              )}
              <h3 style={{ ...styles.cardTitle, color: getTextColor(prompt.color) }}>{prompt.title}</h3>
              <p style={{ ...styles.cardPreview, color: getTextColor(prompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.75)" : "#555" }}>{prompt.content}</p>
              <div style={styles.cardFooter}>
                <span style={{ ...styles.cardAuthor, color: getTextColor(prompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.6)" : "#999" }}>{isAdminMode ? `${prompt.author} · ${prompt.createdAt}` : prompt.author}</span>
                <div style={styles.cardActions}>
                  {isAdminMode && (
                    <>
                      <button style={{ ...styles.iconBtn, color: getTextColor(prompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.8)" : "#555", background: getTextColor(prompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)" }} onClick={(e) => handleEdit(prompt, e)}>
                        <Edit3 size={13} />
                      </button>
                      <button style={{ ...styles.iconBtn, color: getTextColor(prompt.color) === "#FFFFFF" ? "rgba(255,100,100,0.9)" : "#e53935", background: getTextColor(prompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)" }} onClick={(e) => handleDelete(prompt.id, e)}>
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                  <button
                    style={{ ...styles.copyBtn, ...(copiedId === prompt.id ? styles.copyBtnDone : {}), background: copiedId === prompt.id ? (getTextColor(prompt.color) === "#FFFFFF" ? "#fff" : "#4CAF50") : (getTextColor(prompt.color) === "#FFFFFF" ? "#fff" : "#2D4EFF"), color: getTextColor(prompt.color) === "#FFFFFF" ? "#2D4EFF" : "#fff", fontWeight: 700 }}
                    onClick={(e) => handleCopy(prompt, e)}
                  >
                    {copiedId === prompt.id ? <><Check size={12} /> 복사됨</> : <><Copy size={12} /> 복사</>}
                  </button>
                </div>
              </div>
              {(Array.isArray(prompt.aiTool) ? prompt.aiTool.length > 0 : (prompt.aiTool && prompt.aiTool !== "all")) && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: getTextColor(prompt.color) === "#FFFFFF" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: getTextColor(prompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.75)" : "#888", letterSpacing: "0.03em" }}>
                    {(Array.isArray(prompt.aiTool) ? prompt.aiTool : [prompt.aiTool]).map(id => AI_TOOLS.find(a => a.id === id)).filter(Boolean).map(t => `${t.emoji} ${t.label}`).join(", ")}
                  </span>
                </div>
              )}
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
            <button style={{ ...styles.modalClose, background: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", color: getTextColor(selectedPrompt.color) }} onClick={() => setSelectedPrompt(null)}><X size={18} /></button>
            {(selectedPrompt.tags?.length > 0 || selectedPrompt.tag) && (
              <div style={styles.modalTagRowMulti}>
                {(selectedPrompt.tags?.length > 0 ? selectedPrompt.tags : [selectedPrompt.tag]).map(t => (
                  <span key={t} style={{ ...styles.modalTagChip, color: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.85)" : "#444", background: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.07)" }}>{t}</span>
                ))}
              </div>
            )}
            <h2 style={{ ...styles.modalTitle, color: getTextColor(selectedPrompt.color) }}>{selectedPrompt.title}</h2>
            {selectedPrompt.description && (
              <p style={{ fontSize: 13, color: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.85)" : "#666", lineHeight: 1.7, marginBottom: 14 }}>
                {selectedPrompt.description}
              </p>
            )}
            <pre style={{ ...styles.modalContent, color: "#1A1A1A", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(255,255,255,0.4)" }}>{selectedPrompt.content}</pre>
            <div style={styles.modalFooter}>
              <span style={{ ...styles.cardAuthor, color: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.6)" : "#999" }}>{isAdminMode ? `${selectedPrompt.author} · ${selectedPrompt.createdAt}` : selectedPrompt.author}</span>
              <div style={{ display: "flex", gap: 8 }}>
                {isAdminMode && (
                  <>
                    <button style={{ ...styles.btnSecondary, background: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "#fff", color: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "#fff" : "#333", border: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "1px solid rgba(255,255,255,0.3)" : "1px solid #ddd" }} onClick={(e) => handleEdit(selectedPrompt, e)}>
                      <Edit3 size={13} /> 수정
                    </button>
                    <button style={{ ...styles.btnDanger, background: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "#fff", color: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,150,150,0.95)" : "#e53935", border: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "1px solid rgba(255,150,150,0.4)" : "1px solid #ffcdd2" }} onClick={(e) => handleDelete(selectedPrompt.id, e)}>
                      <Trash2 size={13} /> 삭제
                    </button>
                  </>
                )}
                <button
                  style={{ ...styles.copyBtnLarge, ...(copiedId === selectedPrompt.id ? styles.copyBtnDone : {}), background: copiedId === selectedPrompt.id ? (getTextColor(selectedPrompt.color) === '#FFFFFF' ? '#fff' : '#4CAF50') : (getTextColor(selectedPrompt.color) === '#FFFFFF' ? '#fff' : '#2D4EFF'), color: copiedId === selectedPrompt.id ? (getTextColor(selectedPrompt.color) === '#FFFFFF' ? '#2D4EFF' : '#fff') : (getTextColor(selectedPrompt.color) === '#FFFFFF' ? '#2D4EFF' : '#fff'), fontWeight: 700, border: 'none' }}
                  onClick={(e) => handleCopy(selectedPrompt, e)}
                >
                  {copiedId === selectedPrompt.id ? <><Check size={14} /> 복사됨!</> : <><Copy size={14} /> 클립보드에 복사</>}
                </button>
              </div>
            </div>
              {(Array.isArray(selectedPrompt.aiTool) ? selectedPrompt.aiTool.length > 0 : (selectedPrompt.aiTool && selectedPrompt.aiTool !== "all")) && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.7)" : "#888", letterSpacing: "0.03em" }}>
                    {(() => {
                      const tools = (Array.isArray(selectedPrompt.aiTool) ? selectedPrompt.aiTool : [selectedPrompt.aiTool]).map(id => AI_TOOLS.find(a => a.id === id)).filter(Boolean);
                      return tools.map(t => `${t.emoji} ${t.label}`).join(", ") + "에서 활용하기 좋은 프롬프트예요";
                    })()}
                  </span>
                </div>
              )}
              {selectedPrompt.source && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.6)" : "#aaa" }}>출처: </span>
                  <span style={{ fontSize: 11, color: getTextColor(selectedPrompt.color) === "#FFFFFF" ? "rgba(255,255,255,0.7)" : "#888" }}>{selectedPrompt.source}</span>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div style={styles.overlay} onClick={() => { setShowAdminLogin(false); setAdminError(""); }}>
          <div style={styles.loginModal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowAdminLogin(false)}><X size={18} /></button>
            <h2 style={styles.loginTitle}>관리자 로그인</h2>
            <p style={styles.loginDesc}>관리자만 프롬프트를 작성·수정·삭제할 수 있어요.</p>
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
          </div>
        </div>
      )}

      {/* New Tag Modal */}
      {showNewTagInput && (
        <div style={styles.overlay} onClick={() => setShowNewTagInput(false)}>
          <div style={styles.loginModal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowNewTagInput(false)}><X size={18} /></button>
            <h2 style={styles.loginTitle}>태그 추가</h2>
            <input
              style={styles.loginInput}
              placeholder="새 태그 이름 (예: 일상, 학습)"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              autoFocus
            />
            <button style={styles.loginBtn} onClick={handleAddTag}>추가하기</button>
          </div>
        </div>
      )}

      {/* Write / Edit Form Modal */}
      {showWriteForm && (
        <div style={styles.overlay} onClick={() => {
          const isDirty = editingPrompt
            ? (form.title !== editingPrompt.title || form.content !== editingPrompt.content)
            : (form.title.trim() || form.content.trim());
          if (isDirty) {
            if (!window.confirm("작성 중인 내용이 있어요. 정말 닫을까요?")) return;
          }
          setShowWriteForm(false);
          setEditingPrompt(null);
        }}>
          <div style={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => {
              const isDirty = editingPrompt
                ? (form.title !== editingPrompt.title || form.content !== editingPrompt.content)
                : (form.title.trim() || form.content.trim());
              if (isDirty) {
                if (!window.confirm("작성 중인 내용이 있어요. 정말 닫을까요?")) return;
              }
              setShowWriteForm(false);
              setEditingPrompt(null);
            }}><X size={18} /></button>
            <h2 style={styles.formTitle}>{editingPrompt ? "프롬프트 수정" : "새 프롬프트 작성"}</h2>

            <label style={styles.label}>제목</label>
            <input
              style={styles.input}
              placeholder="프롬프트 제목"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <label style={styles.label}>활용법 <span style={{fontWeight:400, color:"#aaa"}}>(선택사항)</span></label>
            <input
              style={styles.input}
              placeholder="이 프롬프트 활용법을 간단히 설명해주세요"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label style={styles.label}>내용</label>
            <textarea
              style={styles.textarea}
              placeholder="프롬프트 내용을 입력하세요. [대괄호]로 사용자가 채울 부분을 표시해주세요."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />

            <label style={styles.label}>AI 툴</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
              {AI_TOOLS.filter(ai => ai.id !== "all").map(ai => (
                <button
                  key={ai.id}
                  type="button"
                  style={{ ...styles.tagChip, ...(Array.isArray(form.aiTool) && form.aiTool.includes(ai.id) ? styles.tagChipActive : {}) }}
                  onClick={() => {
                    const current = Array.isArray(form.aiTool) ? form.aiTool : [];
                    const updated = current.includes(ai.id) ? current.filter(a => a !== ai.id) : [...current, ai.id];
                    setForm({ ...form, aiTool: updated });
                  }}
                >
                  {ai.emoji} {ai.label}
                </button>
              ))}
            </div>

            <label style={styles.label}>태그 <span style={{fontWeight:400, color:"#aaa"}}>(선택사항)</span></label>
            <div style={styles.tagPickerBox}>
              {customTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  style={{ ...styles.tagChip, ...(form.tags.includes(t) ? styles.tagChipActive : {}) }}
                  onClick={() => { const has = form.tags.includes(t); setForm({ ...form, tags: has ? form.tags.filter(x => x !== t) : [...form.tags, t] }); }}
                >
                  {t}
                </button>
              ))}
              {showFormTagInput ? (
                <div style={styles.tagInlineInputRow}>
                  <input
                    style={styles.tagInlineInput}
                    placeholder="새 태그 이름"
                    value={formTagInput}
                    onChange={(e) => setFormTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddFormTag(); }
                      if (e.key === "Escape") { setShowFormTagInput(false); setFormTagInput(""); }
                    }}
                    autoFocus
                  />
                  <button type="button" style={styles.tagInlineConfirm} onClick={handleAddFormTag}>추가</button>
                  <button type="button" style={styles.tagInlineCancel} onClick={(e) => { e.stopPropagation(); setShowFormTagInput(false); setFormTagInput(""); }}>취소</button>
                </div>
              ) : (
                <button type="button" style={styles.tagChipAdd} onClick={(e) => { e.stopPropagation(); setShowFormTagInput(true); }}>
                  <Plus size={12} /> 새 태그
                </button>
              )}
            </div>

            <label style={styles.label}>카드 색상</label>
            <div style={styles.colorRow}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  style={{ ...styles.colorDot, background: c, border: form.color === c ? "2.5px solid #333" : "2px solid transparent" }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>

            <label style={styles.label}>출처 <span style={{fontWeight:400, color:"#aaa"}}>(선택사항)</span></label>
            <input
              style={styles.input}
              placeholder="참고한 링크나 출처를 입력하세요"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />

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
  root: { minHeight: "100vh", width: "100%", background: "#F0F4FF", fontFamily: "'Noto Sans KR', sans-serif", overflowX: "hidden" },
  header: { background: "#fff", borderBottom: "1px solid #EBEBEB", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1600, margin: "0 auto", padding: "16px clamp(12px, 4vw, 32px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  logo: { display: "flex", flexDirection: "column" },
  logoText: { fontSize: 24, fontWeight: 900, color: "#1A1A1A", letterSpacing: "-1px" },
  logoSub: { fontSize: 9, color: "#2D4EFF", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 },
  logoTagline: { fontSize: 11, color: "#AAA", marginTop: 4, letterSpacing: "0" },
  headerRight: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "#F0F4FF", borderRadius: 8, padding: "8px 14px", border: "1px solid #C8D4FF" },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#333", width: 160 },
  adminBadgeRow: { display: "flex", alignItems: "center", gap: 8 },
  adminBadge: { fontSize: 11, background: "#F0F4FF", color: "#2D4EFF", padding: "4px 10px", borderRadius: 6, fontWeight: 700, border: "1px solid #C8D4FF" },
  btnIcon: { display: "flex", alignItems: "center", gap: 6, background: "#2D4EFF", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnGhost: { display: "flex", alignItems: "center", gap: 6, background: "transparent", color: "#2D4EFF", border: "1px solid #C8D4FF", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  tagRow: { maxWidth: 1600, margin: "0 auto", padding: "0 clamp(12px, 4vw, 32px) 12px", display: "flex", gap: 6, overflowX: "auto", alignItems: "center", flexWrap: "wrap" },
  tagItem: { position: "relative", display: "flex", alignItems: "center", gap: 2 },
  tagBtn: { padding: "5px 16px", borderRadius: 20, border: "1px solid #D4DCFF", background: "#fff", color: "#7B8FD4", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 },
  tagBtnActive: { background: "#2D4EFF", color: "#fff", border: "1px solid #2D4EFF", fontWeight: 700 },
  tagDeleteBtn: { background: "#ffeded", border: "none", borderRadius: "50%", width: 18, height: 18, minWidth: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e53935", flexShrink: 0, padding: 0 },
  tagAddBtn: { display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 20, border: "1px dashed #bbb", background: "transparent", color: "#999", fontSize: 12, cursor: "pointer" },
  tagPickerBox: { display: "flex", flexWrap: "wrap", gap: 8, padding: "14px", background: "#F0F4FF", borderRadius: 10, border: "1px solid #D4DCFF", marginTop: 2, alignItems: "center" },
  tagChip: { padding: "5px 14px", borderRadius: 20, border: "1px solid #D4DCFF", background: "#fff", color: "#555", fontSize: 12, cursor: "pointer", fontWeight: 500 },
  tagChipActive: { background: "#2D4EFF", color: "#fff", border: "1px solid #2D4EFF" },
  tagChipAdd: { display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 20, border: "1px dashed #bbb", background: "transparent", color: "#999", fontSize: 12, cursor: "pointer" },
  tagInlineInputRow: { display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap", minWidth: 0 },
  tagInlineInput: { padding: "6px 12px", borderRadius: 20, border: "1px solid #2D4EFF", fontSize: 12, outline: "none", width: 120, minWidth: 0, boxSizing: "border-box" },
  tagInlineConfirm: { background: "#2D4EFF", color: "#fff", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" },
  tagInlineCancel: { background: "#eee", color: "#666", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" },
  main: { width: "100%", maxWidth: 1600, margin: "0 auto", padding: "28px clamp(12px, 4vw, 24px)", boxSizing: "border-box" },
  grid: {},
  card: { borderRadius: 14, padding: "18px 18px 14px", cursor: "pointer", boxShadow: "0 2px 12px rgba(45,78,255,0.08)", border: "1px solid rgba(45,78,255,0.1)", transition: "box-shadow 0.2s" },
  cardTag: { display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#1A1A1A", marginBottom: 8, lineHeight: 1.4 },
  cardPreview: { fontSize: 12, color: "#555", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 12 },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardAuthor: { fontSize: 10, color: "#999" },
  cardActions: { display: "flex", gap: 6, alignItems: "center" },
  iconBtn: { background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#555", display: "flex" },
  copyBtn: { display: "flex", alignItems: "center", gap: 4, background: "#2D4EFF", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  copyBtnDone: { background: "#4CAF50" },
  copyBtnLarge: { display: "flex", alignItems: "center", gap: 6, background: "#2D4EFF", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  empty: { gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#7B8FD4", fontSize: 15 },
  overlay: { position: "fixed", inset: 0, background: "rgba(10,15,50,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 },
  modal: { borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, position: "relative", boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(255,255,255,0.3)", maxHeight: "85vh", overflowY: "auto", display: "flex", flexDirection: "column" },
  modalClose: { position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.1)", border: "none", borderRadius: 6, padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, lineHeight: 1 },
  modalTagRow: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#666", marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#1A1A1A", marginBottom: 14 },
  modalContent: { fontSize: 14, color: "#333", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.5)", borderRadius: 10, padding: 16, marginBottom: 16, fontFamily: "inherit", overflowY: "auto", flex: 1 },
  modalFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  btnSecondary: { display: "flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" },
  btnDanger: { display: "flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #ffcdd2", color: "#e53935", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" },
  loginModal: { background: "#fff", borderRadius: 20, padding: "36px 32px 32px", width: "100%", maxWidth: 380, position: "relative", boxShadow: "0 20px 60px rgba(45,78,255,0.15)", overflow: "visible" },
  loginTitle: { fontSize: 20, fontWeight: 800, marginBottom: 6 },
  loginDesc: { fontSize: 13, color: "#888", marginBottom: 20 },
  loginInput: { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #D4DCFF", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 8 },
  loginBtn: { width: "100%", padding: "13px", background: "#2D4EFF", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 },
  errorText: { fontSize: 12, color: "#e53935", marginBottom: 4 },
  formModal: { background: "#fff", borderRadius: 20, padding: "40px 32px 32px", width: "100%", maxWidth: 520, position: "relative", boxShadow: "0 20px 60px rgba(45,78,255,0.15)", maxHeight: "90vh", overflowY: "auto" },
  formTitle: { fontSize: 18, fontWeight: 800, marginBottom: 20 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, marginTop: 14 },
  input: { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid #D4DCFF", fontSize: 14, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid #D4DCFF", fontSize: 13, outline: "none", boxSizing: "border-box", minHeight: 140, resize: "vertical", lineHeight: 1.7, fontFamily: "inherit" },
  formRow: { display: "flex", gap: 16, alignItems: "flex-start", marginTop: 4 },
  select: { padding: "9px 12px", borderRadius: 8, border: "1px solid #E0DDD6", fontSize: 13, outline: "none", width: "100%" },
  colorRow: { display: "flex", gap: 6, marginTop: 6 },
  colorDot: { width: 24, height: 24, borderRadius: "50%", cursor: "pointer" },
  saveBtn: { width: "100%", padding: "13px", background: "#2D4EFF", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 20 },
  cardTagRow: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  cardTagChip: { fontSize: 10, color: "#555", background: "rgba(0,0,0,0.08)", borderRadius: 10, padding: "2px 8px", fontWeight: 600 },
  modalTagRowMulti: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  modalTagChip: { fontSize: 12, color: "#444", background: "rgba(0,0,0,0.07)", borderRadius: 12, padding: "3px 10px", fontWeight: 600 },
};
