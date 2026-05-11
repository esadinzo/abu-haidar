import React, { useState, useEffect, useRef, useMemo } from 'react';
import './index.css';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  X, 
  Image as ImageIcon, 
  Music, 
  Type, 
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  supabase,
  fetchServices, fetchRecordings,
  upsertService, upsertRecording,
  deleteService, deleteRecording,
  reorderServices, reorderRecordings,
  uploadFile
} from './supabase.js';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BASE = import.meta.env.BASE_URL;

const Navbar = ({ onPrivacyClick, onTermsClick, theme, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(() => Math.floor(Math.random() * 2000) + 3000);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors(prev => {
        const change = Math.floor(Math.random() * 5) - 1; // Fluctuates naturally
        return prev + change;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className={scrolled ? 'glass' : ''}>
      <div className="container nav-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href="#" className="nav-logo">الشيخ الروحاني</a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#4caf50', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(76, 175, 80, 0.3)', backdropFilter: 'blur(5px)', whiteSpace: 'nowrap' }}>
            <span style={{ width: '6px', height: '6px', background: '#4caf50', borderRadius: '50%', animation: 'pulse 2s infinite', flexShrink: 0 }}></span>
            زوار الآن: <strong style={{color: '#fff', fontSize: '0.85rem', paddingRight: '2px'}}>{liveVisitors}</strong>
          </span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <button onClick={toggleTheme} className="theme-toggle-btn" title={theme==='dark'?'الوضع النهاري':'الوضع الليلي'}>
            {theme==='dark'?'☀️':'🌙'}
          </button>
          <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        <div className={`menu-overlay ${isMenuOpen ? 'show' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
        <ul className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <div className="mobile-menu-header">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 'normal' }}>أهلاً بك في الموقع الرسمي لـ</span>
            الشيخ أبو حيدر الشمري
          </div>
          <li><a href="#home" onClick={() => setIsMenuOpen(false)}><span className="nav-icon">🏠</span> الرئيسية</a></li>
          <li><a href="#services" onClick={() => setIsMenuOpen(false)}><span className="nav-icon">✨</span> خدماتنا</a></li>
          <li><a href="#audio-library" onClick={() => setIsMenuOpen(false)}><span className="nav-icon">🎙️</span> المكتبة الصوتية</a></li>
          <li><a href="#about" onClick={() => setIsMenuOpen(false)}><span className="nav-icon">📜</span> من نحن</a></li>
          <li><a href="#contact" onClick={() => setIsMenuOpen(false)}><span className="nav-icon">📞</span> اتصل بنا</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); onTermsClick && onTermsClick(); }}><span className="nav-icon">⚖️</span> شروط الاستخدام</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); onPrivacyClick && onPrivacyClick(); }}><span className="nav-icon">🔒</span> سياسة الخصوصية</a></li>
        </ul>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section id="home" className="hero">
    <div className="container glass-card" style={{ maxWidth: '800px', border: 'none', background: 'transparent', boxShadow: 'none' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem' }}>الخبير أبو حيدر الشمري</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem', color: 'var(--text-main)' }}>
        نحن هنا لنمد لك يد العون في أصعب اللحظات. نقدم استشارات روحانية شرعية متخصصة، 
        <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}> بحلول واقعية وخبرة تمتد لعقود </span> 
        في إصلاح ذات البين وتحقيق الاستقرار النفسي والأسري.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="#services" className="btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>استكشف خدماتنا</a>
        <a href="#contact" className="btn-secondary" style={{ padding: '12px 30px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '30px', textDecoration: 'none' }}>تواصل معنا سرّاً</a>
      </div>
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
        <span>✅ خصوصية تامة</span>
        <span>✅ استشارات شرعية</span>
        <span>✅ رد سريع عبر واتساب</span>
      </div>
    </div>
  </section>
);

const TrustBar = () => (
  <div style={{ background: 'rgba(212, 175, 55, 0.05)', padding: '1.5rem 0', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem', textAlign: 'center' }}>
      <div>
        <div style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 'bold' }}>+15 سنة</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>خبرة في المجال</div>
      </div>
      <div>
        <div style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 'bold' }}>+500</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>عائلة مستفيدة</div>
      </div>
      <div>
        <div style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 'bold' }}>100%</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>خصوصية وسرية</div>
      </div>
      <div>
        <div style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 'bold' }}>24/7</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>دعم عبر واتساب</div>
      </div>
    </div>
  </div>
);

const TiptapEditor = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-inner',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="tiptap-wrapper">
      <div className="tiptap-toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}><b>B</b></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}><i>I</i></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}>• List</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

const SortableItem = ({ id, children, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-item-wrapper">
      {!disabled && (
        <div className="drag-handle" {...attributes} {...listeners}>
          <GripVertical size={18} />
        </div>
      )}
      {children}
    </div>
  );
};

const AdminPanel = ({ 
  services, setServices, 
  recordings, setRecordings, 
  onClose, BASE 
}) => {
  const [activeTab, setActiveTab] = useState('services');
  const [editingItem, setEditingItem] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDragEnd = async (event, items, setItems, reorderFn) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    try { await reorderFn(reordered.map(i => i.id)); } catch(e) { console.error(e); }
  };

  const addItem = () => {
    if (activeTab === 'services') {
      const newItem = { title: 'خدمة جديدة', desc: 'وصف الخدمة هنا...', icon: '✨', img: '', order: services.length };
      setEditingItem({ type: 'service', data: newItem, isNew: true });
    } else {
      const newItem = { src: '', title: 'تسجيل جديد', description: 'وصف التسجيل هنا...', order: recordings.length };
      setEditingItem({ type: 'audio', data: newItem, isNew: true });
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const folder = type === 'image' ? 'images' : 'audio';
      const publicUrl = await uploadFile(file, folder);
      const key = type === 'image' ? 'img' : 'src';
      setEditingItem(prev => ({ ...prev, data: { ...prev.data, [key]: publicUrl } }));
    } catch (err) {
      console.error(err);
      alert('فشل رفع الملف: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      if (activeTab === 'services') {
        await deleteService(id);
        setServices(prev => prev.filter(s => s.id !== id));
      } else {
        await deleteRecording(id);
        setRecordings(prev => prev.filter(r => r.id !== id));
      }
    } catch(e) { alert('فشل الحذف: ' + e.message); }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem.type === 'service') {
        const saved = await upsertService(editingItem.data);
        if (editingItem.isNew) setServices(prev => [...prev, saved]);
        else setServices(prev => prev.map(s => s.id === saved.id ? saved : s));
      } else {
        const saved = await upsertRecording(editingItem.data);
        if (editingItem.isNew) setRecordings(prev => [...prev, saved]);
        else setRecordings(prev => prev.map(r => r.id === saved.id ? saved : r));
      }
      setEditingItem(null);
    } catch(e) { alert('فشل الحفظ: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="admin-overlay"
    >
      <div className="admin-container glass">
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={24} className="text-accent" />
            <h2 style={{ margin: 0, color: 'var(--accent)' }}>لوحة التحكم</h2>
          </div>
          <button onClick={onClose} className="close-btn"><X /></button>
        </div>

        <div className="admin-tabs">
          <button 
            className={activeTab === 'services' ? 'active' : ''} 
            onClick={() => setActiveTab('services')}
          >
            <ImageIcon size={18} /> الخدمات
          </button>
          <button 
            className={activeTab === 'audio' ? 'active' : ''} 
            onClick={() => setActiveTab('audio')}
          >
            <Music size={18} /> المكتبة الصوتية
          </button>
        </div>

        <div className="admin-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-main)' }}>{activeTab === 'services' ? 'إدارة الخدمات' : 'إدارة التسجيلات'}</h3>
            <button onClick={addItem} className="add-btn"><Plus size={18} /> إضافة جديد</button>
          </div>

          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={(e) => handleDragEnd(e,
              activeTab === 'services' ? services : recordings,
              activeTab === 'services' ? setServices : setRecordings,
              activeTab === 'services' ? reorderServices : reorderRecordings
            )}
          >
            <SortableContext 
              items={activeTab === 'services' ? services.map(s => s.id) : recordings.map(r => r.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="items-list">
                {(activeTab === 'services' ? services : recordings).map((item) => (
                  <SortableItem key={item.id} id={item.id}>
                    <div className="admin-item-card">
                      <div className="item-info">
                        <strong>{item.title}</strong>
                        <p>{item.desc || item.description}</p>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => setEditingItem({ type: activeTab === 'services' ? 'service' : 'audio', data: item })} className="edit-btn"><Edit3 size={16} /></button>
                        <button onClick={() => deleteItem(item.id)} className="delete-btn"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="admin-footer">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>✅ البيانات محفوظة في السحابة وتظهر لجميع الزوار.</p>
          <button onClick={onClose} className="btn-save"><Save size={18} /> تم</button>
        </div>
      </div>

      <AnimatePresence>
        {editingItem && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="edit-modal-overlay"
          >
            <div className="edit-modal glass">
              <h3>{editingItem.type === 'service' ? 'تعديل الخدمة' : 'تعديل التسجيل'}</h3>
              <form onSubmit={saveEdit}>
                {uploading && <div className="upload-indicator">⏳ جارٍ رفع الملف...</div>}
                <div className="form-group">
                  <label>العنوان</label>
                  <input 
                    type="text" 
                    value={editingItem.data.title} 
                    onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                    required 
                  />
                </div>
                {editingItem.type === 'service' && (
                  <>
                    <div className="form-group">
                      <label>الأيقونة (إيموجي)</label>
                      <input 
                        type="text" 
                        value={editingItem.data.icon} 
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, icon: e.target.value } })}
                      />
                    </div>
                    <div className="form-group">
                      <label>صورة الخدمة</label>
                      <div className="file-upload-zone">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, 'image')} 
                          id="img-upload"
                        />
                        <label htmlFor="img-upload" className="file-label">
                          <ImageIcon size={20} /> اختر صورة من جهازك
                        </label>
                        {editingItem.data.img && (
                          <div className="file-preview">
                            <span className="text-xs opacity-50">تم اختيار ملف</span>
                          </div>
                        )}
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>أو أدخل رابطاً مباشراً:</label>
                        <input 
                          type="text" 
                          value={editingItem.data.img} 
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, img: e.target.value } })}
                        />
                      </div>
                    </div>
                  </>
                )}
                {editingItem.type === 'audio' && (
                  <div className="form-group">
                    <label>الملف الصوتي</label>
                    <div className="file-upload-zone">
                      <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={(e) => handleFileUpload(e, 'audio')} 
                        id="audio-upload"
                      />
                      <label htmlFor="audio-upload" className="file-label">
                        <Music size={20} /> اختر ملف صوتي من جهازك
                      </label>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>أو أدخل رابطاً مباشراً:</label>
                      <input 
                        type="text" 
                        value={editingItem.data.src} 
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, src: e.target.value } })}
                      />
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label>الوصف</label>
                  <TiptapEditor 
                    content={editingItem.type === 'service' ? editingItem.data.desc : editingItem.data.description} 
                    onChange={(html) => {
                      const key = editingItem.type === 'service' ? 'desc' : 'description';
                      setEditingItem({ ...editingItem, data: { ...editingItem.data, [key]: html } });
                    }}
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem' }} disabled={saving || uploading}>
                    {saving ? '⏳ جارٍ الحفظ...' : '💾 حفظ للجميع'}
                  </button>
                  <button type="button" onClick={() => setEditingItem(null)} className="btn-cancel" disabled={saving || uploading}>إلغاء</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Services = ({ servicesList }) => {
  const [views, setViews] = useState(() => {
    const initialViews = {};
    servicesList.forEach(s => {
      initialViews[s.id] = Math.floor(Math.random() * 5000) + 1000;
    });
    return initialViews;
  });
  
  const [animatingViews, setAnimatingViews] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const ids = servicesList.map(s => s.id);
      if (ids.length === 0) return;
      const numToUpdate = Math.floor(Math.random() * 4) + 1;
      const newlyAnimated = {};
      const updates = {};

      for (let i = 0; i < numToUpdate; i++) {
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        const increment = Math.floor(Math.random() * 3) + 1;
        updates[randomId] = increment;
        newlyAnimated[randomId] = true;
      }

      setViews(prev => {
        const newViews = { ...prev };
        for (const [id, inc] of Object.entries(updates)) {
          newViews[id] = (newViews[id] || 1200) + inc;
        }
        return newViews;
      });

      setAnimatingViews(newlyAnimated);
      setTimeout(() => setAnimatingViews({}), 600);

    }, 4000);

    return () => clearInterval(interval);
  }, [servicesList.length]);

  const handleServiceClick = (title) => {
    // تتبع النقرة لجوجل (في حال تم تفعيل كود التتبع)
    if (window.gtag) {
      window.gtag('event', 'contact_whatsapp', {
        'event_category': 'Engagement',
        'event_label': title
      });
    }

    const whatsappNumber = "905365756894";
    const text = `السلام عليكم شيخنا الفاضل،\nأود طلب خدمة: ${title}\nحالتي هي: `;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="services">
      <div className="container">
        <h2 className="section-title">خدماتنا الروحانية</h2>
        <div className="services-grid">
          {servicesList.map(s => <ServiceCard key={s.id} s={s} handleServiceClick={handleServiceClick} animatingViews={animatingViews} views={views} />)}
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ s, handleServiceClick, animatingViews, views }) => {
  return (
    <div className="glass-card" onClick={() => handleServiceClick(s.title)} style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
      <div style={{ width: '100%', height: '110px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={s.img} alt={s.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '0.8rem', flexGrow: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <span className="service-icon" style={{ position: 'absolute', top: '-20px', right: '1rem', background: 'var(--primary)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>{s.icon}</span>
        <h3 style={{ color: 'var(--accent)', marginBottom: '0.2rem', fontSize: '0.82rem', marginTop: '0.5rem', lineHeight: '1.3', fontWeight: '800' }}>{s.title}</h3>
        <div 
          className="service-desc"
          style={{ color: 'var(--text-muted)', fontSize: '0.68rem', lineHeight: '1.4', marginBottom: '0.6rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: s.desc }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#4caf50', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '6px', height: '6px', background: '#4caf50', borderRadius: '50%', display: 'inline-block', marginRight: '3px', animation: 'pulse 2s infinite' }}></span>
          </span>
          <span style={{ 
            fontWeight: 'bold', 
            display: 'inline-block',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: animatingViews[s.id] ? 'scale(1.3) translateY(-2px)' : 'scale(1) translateY(0)',
            color: animatingViews[s.id] ? '#ffeb3b' : 'inherit',
            textShadow: animatingViews[s.id] ? '0 0 8px rgba(255, 235, 59, 0.6)' : 'none'
          }}>
            {views[s.id]}
          </span> 
          <span style={{ color: 'var(--text-muted)' }}>يتصفحون الآن</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); handleServiceClick(s.title); }}
          style={{ marginTop: '0.6rem', width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'linear-gradient(45deg, var(--accent), #b5952f)', color: '#111', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 10px rgba(212, 175, 55, 0.2)' }}
          onMouseOver={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 15px rgba(212, 175, 55, 0.4)'; }}
          onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 10px rgba(212, 175, 55, 0.2)'; }}
        >
          تواصل معنا
        </button>
      </div>
    </div>
  );
};

const About = () => {
  return (
    <section id="about" style={{ position: 'relative', overflow: 'hidden', padding: '4rem 0' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="section-title">من نحن</h2>
        
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          {/* Animated Glow Behind the card */}
          <div style={{
            position: 'absolute',
            top: '-5px', left: '-5px', right: '-5px', bottom: '-5px',
            background: 'linear-gradient(45deg, rgba(212, 175, 55, 0.5), transparent, rgba(181, 149, 47, 0.5), transparent)',
            backgroundSize: '400% 400%',
            borderRadius: '20px',
            filter: 'blur(15px)',
            opacity: 0.6,
            animation: 'gradientFlow 8s ease infinite, float 6s ease-in-out infinite'
          }}></div>
          
          <div className="glass-card" style={{ 
            textAlign: 'center', 
            position: 'relative',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            animation: 'float 6s ease-in-out infinite',
            background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(0,0,0,0.85))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '2', color: 'var(--text-main)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              نحن نقدم استشارات وخدمات مبنية على أسس علمية وتقليدية توارثناها عبر الأجيال. 
              <br/><br/>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>الأستاذ أبو حيدر الشمري</span> يكرس خبرته لمساعدة الناس في التغلب على الصعاب الحياتية، 
              سواء كانت مشاكل أسرية، ضغوطات نفسية، أو تعثر في المسار المهني. 
              <br/><br/>
              نسعى دائماً لبناء جسور الثقة مع كل من يقصدنا.
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
};

const FAQ = () => {
  const faqs = [
    { q: "هل الاستشارات سرية؟", a: "نعم، نحن نضمن خصوصية تامة وسرية مطلقة لجميع البيانات والحالات التي نتعامل معها." },
    { q: "كيف تتم عملية التواصل؟", a: "بمجرد الضغط على زر الواتساب، سيتم توجيهك للمحادثة المباشرة مع الشيخ أبو حيدر لشرح حالتك." },
    { q: "كم تستغرق الجلسة الأولى؟", a: "الجلسة الاستشارية الأولى تهدف لتشخيص الحالة وفهم المعوقات، وتستغرق عادة من 15 إلى 30 دقيقة." },
    { q: "هل الخدمات متوفرة خارج السعودية؟", a: "نعم، نقدم خدماتنا لجميع الإخوة والأخوات في كافة دول العالم عبر التواصل الإلكتروني." }
  ];

  return (
    <section id="faq" style={{ padding: '4rem 0', background: 'rgba(212, 175, 55, 0.03)' }}>
      <div className="container">
        <h2 className="section-title">الأسئلة الشائعة</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, i) => (
            <details key={i} className="glass-card" style={{ marginBottom: '1rem', cursor: 'pointer', padding: '1rem' }}>
              <summary style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.1rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q}
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </summary>
              <p style={{ marginTop: '1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const names = ["أم م***", "سالم ال***", "فاطمة ***", "خالد الش***", "مريم ع***", "أحمد ب***", "نورة ال***", "فيصل ***", "سعاد م***", "أبو ف***", "علي ال***", "عائشة ***", "حمد ال***", "أم ت***", "صالح ف***"];
  const countries = ["السعودية", "الكويت", "الإمارات", "عمان", "البحرين", "قطر", "الأردن", "العراق", "مصر", "المغرب"];
  const texts = [
    "بفضل الله ثم توجيهات الأستاذ، عادت حياتي لطبيعتها وتخلصت من الضيق.",
    "رجل صادق في تعامله، انفتحت أبواب الرزق بوجهي بعد فترة من التعثر.",
    "تم الوفاق وتيسير أمور الارتباط في فترة قصيرة جداً، شكراً من القلب.",
    "أنصح بالتعامل معه، تخلصت من معوقات كانت تعطل حياتي لسنوات.",
    "كانت عندي عقبات في كل شيء والحمدلله تم تجاوز المشكلة بسرعة.",
    "تجربة ممتازة، تحليل دقيق جداً لكل ما أعاني منه وكأنك تعرفني.",
    "توجيه سريع ومضمون، تخلصت من التعب النفسي نهائياً وارتحت.",
    "استلمت الحجر الكريم اليوم، شعرت براحة نفسية وقبول من أول لحظة.",
    "تم حل الخلافات الأسرية وعدنا أفضل من السابق بفضل الله.",
    "أصدق شخص تعاملت معه، تواصل مستمر وعمل نقي وواضح.",
    "كنت أعاني من قلق دائم، وبعد الالتزام بالبرنامج نمت قريرة العين.",
    "تم لم شمل الأسرة في أقل من أسبوع، هذا العمل كنز حقيقي.",
    "تيسرت أمور تجارتي بشكل ملحوظ بعد زوال العوائق النفسية.",
    "مصداقية عالية جداً وتواصل مستمر حتى بعد انتهاء الجلسات.",
    "لن أنسى فضلك، أنقذت حياتي الأسرية من الانهيار والضياع."
  ];

  const [allReviews] = useState(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i + 1,
    name: `${names[i % names.length]} (${countries[i % countries.length]})`,
    text: texts[i % texts.length],
    date: `قبل ${Math.floor(Math.random() * 20) + 1} أيام`,
    rating: 5,
    initialLikes: Math.floor(Math.random() * 800) + 30
  })));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likesCount, setLikesCount] = useState({});
  const [hasLiked, setHasLiked] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 2) % allReviews.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(timer);
  }, [allReviews.length]);

  const handleLike = (id, initialLikes) => {
    const currentLikes = likesCount[id] || initialLikes;
    if (hasLiked[id]) {
      setLikesCount(prev => ({ ...prev, [id]: currentLikes - 1 }));
      setHasLiked(prev => ({ ...prev, [id]: false }));
    } else {
      setLikesCount(prev => ({ ...prev, [id]: currentLikes + 1 }));
      setHasLiked(prev => ({ ...prev, [id]: true }));
    }
  };

  const visibleReviews = [
    allReviews[currentIndex], 
    allReviews[(currentIndex + 1) % allReviews.length]
  ];

  return (
    <section id="reviews" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <h2 className="section-title" style={{ marginBottom: '0' }}>آراء وتجارب المستفيدين</h2>
            <span style={{ color: 'var(--accent-light)', fontSize: '0.9rem', padding: '4px 12px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>أكثر من 50 تجربة ناجحة يتم عرضها بشكل مباشر</span>
          </div>
        </div>

        <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
          {visibleReviews.map(r => (
            <div key={r.id} className="glass-card" style={{ padding: '0.8rem', textAlign: 'right', display: 'flex', flexDirection: 'column', animation: 'simpleFadeIn 0.5s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.6rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent), #b5952f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold', color: '#111', marginLeft: '8px', flexShrink: 0 }}>
                  {r.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ color: 'var(--accent-light)', fontSize: '0.75rem', marginBottom: '0.1rem' }}>{r.name}</h4>
                  <div style={{ color: '#ffc107', fontSize: '0.7rem' }}>{"★".repeat(r.rating)}</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-main)', lineHeight: '1.5', fontStyle: 'italic', flexGrow: 1, fontSize: '0.75rem' }}>"{r.text}"</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.6rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{r.date}</div>
                <button 
                  onClick={() => handleLike(r.id, r.initialLikes)}
                  style={{ 
                    background: hasLiked[r.id] ? 'rgba(255, 60, 60, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                    border: hasLiked[r.id] ? '1px solid rgba(255, 60, 60, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '20px',
                    padding: '3px 10px',
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    color: hasLiked[r.id] ? '#ff4d4d' : 'var(--text-muted)',
                    transition: 'all 0.3s ease',
                    fontSize: '0.75rem',
                    fontFamily: 'inherit',
                    fontWeight: 'bold'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '0.9rem' }}>{hasLiked[r.id] ? '❤️' : '👍'}</span>
                  <span>{hasLiked[r.id] ? 'أعجبني' : 'إعجاب'}</span>
                  <span style={{ background: hasLiked[r.id] ? '#ff4d4d' : 'rgba(255,255,255,0.1)', color: hasLiked[r.id] ? '#fff' : 'inherit', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', marginRight: '4px' }}>{likesCount[r.id] || r.initialLikes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !message) return;
    const whatsappNumber = "905365756894";
    const text = `السلام عليكم شيخنا الفاضل،\nأنا: ${name}\nأود الاستفسار عن مشكلتي وهي كالتالي:\n${message}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="contact">
      <div className="container">
        <h2 className="section-title">تواصل معنا</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>يمكنكم التواصل معنا مباشرة عبر واتساب أو الاتصال على الرقم التالي:</p>
          <a href="https://wa.me/905365756894?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%D9%83%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%AE%D8%A7%D8%B5%D8%A9%D8%8C%20%D9%88%D8%A3%D8%B1%D8%AC%D9%88%20%D9%85%D9%86%D9%83%D9%85%20%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D8%B1%D8%A9." target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', color: '#000', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '1.5rem', direction: 'ltr' }}>+90 536 575 6894</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>
        </div>

        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ textAlign: 'center', color: 'var(--accent)', marginBottom: '1.5rem' }}>أو اترك رسالتك هنا وسنتواصل معك فوراً عبر واتساب</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="text" placeholder="الاسم الكريم" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <textarea rows="5" placeholder="اكتب استفسارك أو مشكلتك هنا..." value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>إرسال الطلب عبر واتساب</button>
          </form>
        </div>
      </div>
    </section>
  );
};

const WhatsAppBtn = () => {
  const number = "905365756894"; // Updated number
  const message = encodeURI("السلام عليكم، أتواصل معك بخصوص استشارة خاصة، وأرجو منكم المساعدة.");
  return (
    <a href={`https://wa.me/${number}?text=${message}`} className="whatsapp-float" target="_blank" rel="noopener noreferrer">
      <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
    </a>
  );
};

const TestimonialsTicker = () => {
  const testimonials = [
    "✨ تم بفضل الله تحقيق توازن نفسي واستقرار بعد سنوات من الاضطراب.",
    "🌟 نجاح مبهر في إعادة الوفاق الأسري خلال أيام معدودة.",
    "🛡️ التخلص من العقبات التي كانت تعطل المسار المهني والرزق.",
    "🤝 تم الصلح بين طرفين كانا على وشك الانفصال ببركة التوجيه الصادق.",
    "👁️ برامج وقائية لتقوية الذات وحماية العائلة من الطاقات السلبية.",
    "💍 تيسير أمور الارتباط بفضل الله ثم بفضل الأحجار الكريمة المنتقاة.",
    "🕊️ شعور بالطمأنينة والهدوء التام بعد جلسات التوجيه عن بعد.",
    "💼 تيسير أمور التجارة والعمل بعد فترة من الركود بفضل الله.",
    "❤️ عودة المحبة والوئام بين أفراد الأسرة وقطع دابر المشاكل المستمرة."
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ticker-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>
      <div key={currentIndex} className="ticker-item fade-in-text">
        {testimonials[currentIndex]}
      </div>
    </div>
  );
};

const AudioPlayer = ({ src, title, description, index }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [barHeights] = useState(() => 
    Array.from({ length: 28 }, () => Math.random() * 60 + 20)
  );

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    if (isNaN(total)) return;
    setProgress((current / total) * 100);
    setCurrentTime(formatTime(current));
  };

  const handleLoadedMetadata = () => {
    setDuration(formatTime(audioRef.current.duration));
  };

  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    const newTime = (newProgress / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(newProgress);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const icons = ['🎙️', '🌟'];
  const gradients = [
    'linear-gradient(135deg, #d4af37, #b5952f)',
    'linear-gradient(135deg, #a78bfa, #7c3aed)',
  ];

  return (
    <div className={`audio-card-v2 ${isPlaying ? 'playing' : ''}`}>
      {/* Header */}
      <div className="acv2-header">
        <div className="acv2-icon" style={{ background: gradients[index % 2] }}>
          <span style={{ fontSize: '1.6rem' }}>{icons[index % 2]}</span>
        </div>
        <div className="acv2-meta">
          <h3 className="acv2-title">{title}</h3>
          <div className="acv2-desc" dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>

      {/* Spectrum Visualizer */}
      <div className="acv2-spectrum">
        {barHeights.map((h, i) => {
          const isFilled = progress > 0 && (i / barHeights.length) * 100 < progress;
          return (
            <div
              key={i}
              className={`acv2-bar ${isPlaying ? 'active' : ''}`}
              style={{
                height: `${h}%`,
                animationDelay: `${(i * 0.07).toFixed(2)}s`,
                animationDuration: `${(0.6 + Math.random() * 0.8).toFixed(2)}s`,
                background: isFilled
                  ? 'var(--accent)'
                  : 'rgba(255,255,255,0.15)',
              }}
            />
          );
        })}
        {/* Glow overlay when playing */}
        {isPlaying && (
          <div className="acv2-spectrum-glow" />
        )}
      </div>

      {/* Progress Bar */}
      <div className="acv2-progress-wrap">
        <span className="acv2-time">{currentTime}</span>
        <div className="acv2-track">
          <div className="acv2-fill" style={{ width: `${progress}%` }} />
          <input
            type="range"
            className="acv2-slider"
            value={progress}
            onChange={handleProgressChange}
            min="0"
            max="100"
          />
        </div>
        <span className="acv2-time">{duration}</span>
      </div>

      {/* Controls */}
      <div className="acv2-controls">
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        <button
          className={`acv2-play-btn ${isPlaying ? 'is-playing' : ''}`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
        >
          <div className="acv2-play-ring" />
          <div className="acv2-play-ring acv2-ring2" />
          <span className="acv2-play-icon">
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </span>
        </button>
        <div className="acv2-labels">
          <span className="acv2-status-badge">
            {isPlaying ? (
              <><span className="acv2-live-dot" /> جارٍ التشغيل</>
            ) : (
              '▶ اضغط للاستماع'
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

const AudioLibrary = ({ recordings }) => {
  return (
    <section id="audio-library" style={{ background: 'rgba(0,0,0,0.1)' }}>
      <div className="container">
        <h2 className="section-title">المكتبة الصوتية</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>استمع إلى تجارب حقيقية وقصص نجاح، بالإضافة إلى توجيهات مباشرة تساعدك في فهم المسار الصحيح لحل مشكلاتك.</p>
        <div className="audio-grid">
          {recordings.map((r, i) => (
            <AudioPlayer key={r.id} {...r} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PrivacyPolicyModal = ({ onClose }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }} onClick={onClose}>
    <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', textAlign: 'right', background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(0,0,0,0.85))' }} onClick={e => e.stopPropagation()}>
      <button onClick={onClose} style={{ position: 'absolute', top: '15px', left: '15px', background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
      <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>سياسة الخصوصية</h2>
      <p style={{ color: 'var(--text-main)', lineHeight: '1.8', fontSize: '0.95rem' }}>
        <strong>1. جمع المعلومات:</strong><br/>
        نحن نقوم بجمع المعلومات التي تقدمها طواعية عند التواصل معنا (مثل الاسم ورقم الهاتف).<br/><br/>
        
        <strong>2. استخدام المعلومات:</strong><br/>
        تُستخدم هذه المعلومات حصرياً لتقديم الاستشارات المطلوبة والتواصل معك. نحن لا نبيع أو نشارك معلوماتك الشخصية مع أي أطراف ثالثة نهائياً.<br/><br/>
        
        <strong>3. أمان البيانات:</strong><br/>
        نحن نتخذ كافة التدابير المعقولة لحماية معلوماتك الشخصية والمحافظة على سريتها التامة.<br/><br/>
        
        <strong>4. سياسة الإعلانات وملفات تعريف الارتباط (Cookies):</strong><br/>
        قد نستخدم خدمات إعلانية مثل طرف ثالث (مثل Google) التي قد تستخدم ملفات تعريف الارتباط لتقديم إعلانات مخصصة. يمكنك إدارة تفضيلات الإعلانات من خلال إعدادات المتصفح الخاص بك.<br/><br/>
        
        <strong>5. إخلاء المسؤولية:</strong><br/>
        يتم تقديم خدماتنا والمحتوى المعروض لأغراض الإرشاد والترفيه فقط، ولا يغني بأي شكل من الأشكال عن الاستشارة الطبية أو النفسية أو القانونية المتخصصة.<br/><br/>
        
        <strong>6. الموافقة:</strong><br/>
        باستخدامك لموقعنا والتواصل معنا، فإنك توافق على سياسة الخصوصية الخاصة بنا.
      </p>
    </div>
  </div>
);

const TermsOfServiceModal = ({ onClose }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }} onClick={onClose}>
    <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', textAlign: 'right', background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(0,0,0,0.85))' }} onClick={e => e.stopPropagation()}>
      <button onClick={onClose} style={{ position: 'absolute', top: '15px', left: '15px', background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
      <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>شروط الاستخدام</h2>
      <p style={{ color: 'var(--text-main)', lineHeight: '1.8', fontSize: '0.95rem' }}>
        <strong>1. قبول الشروط:</strong><br/>
        بدخولك واستخدامك لهذا الموقع، فإنك تقر وتوافق على الالتزام بشروط الاستخدام الواردة هنا.<br/><br/>
        
        <strong>2. طبيعة الخدمات:</strong><br/>
        المحتوى والخدمات المقدمة هي لأغراض استشارية وإرشادية فقط. النتائج قد تختلف من شخص لآخر ولا توجد ضمانات حتمية للنتائج.<br/><br/>
        
        <strong>3. شرط العمر:</strong><br/>
        يجب أن يكون عمر المستخدم 18 عاماً أو أكثر للاستفادة من خدماتنا الاستشارية.<br/><br/>
        
        <strong>4. المسؤولية الشخصية:</strong><br/>
        يتحمل المستخدم المسؤولية الكاملة عن أي قرارات أو أفعال يتخذها بناءً على المعلومات المقدمة في الموقع.<br/><br/>
        
        <strong>5. الملكية الفكرية:</strong><br/>
        جميع النصوص والصور والمحتويات في هذا الموقع هي ملكية خاصة ولا يجوز نسخها أو إعادة توزيعها دون إذن خطي مسبق.<br/><br/>
        
        <strong>6. التعديلات:</strong><br/>
        نحتفظ بالحق في تعديل هذه الشروط في أي وقت دون إشعار مسبق.
      </p>
    </div>
  </div>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const quick = ['أريد استشارة روحانية', 'ما هي الأسعار؟', 'كيف أتواصل معكم؟', 'أحتاج مساعدة عاجلة'];
  const send = (text) => {
    window.open(`https://wa.me/905365756894?text=${encodeURIComponent(text || msg)}`, '_blank');
    setMsg('');
  };
  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-avatar">🧙</div>
            <div>
              <div className="chat-name">أبو حيدر الشمري</div>
              <div className="chat-status"><span className="acv2-live-dot" /> متاح الآن</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-body">
            <div className="chat-bubble-in">👋 أهلاً بك! كيف يمكنني مساعدتك؟</div>
            <div className="chat-quick-wrap">
              {quick.map((q, i) => <button key={i} className="chat-quick-btn" onClick={() => send(q)}>{q}</button>)}
            </div>
          </div>
          <div className="chat-footer">
            <input className="chat-input" placeholder="اكتب رسالتك..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && msg && send(msg)} />
            <button className="chat-send" onClick={() => msg && send(msg)}>➤</button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="محادثة">
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
};

function App() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Default Data
  const defaultServices = [
    { id: 1, title: 'تطهير الطاقة السلبية', desc: 'تخلص من أثر الطاقات الضارة والعقبات النفسية بطرق طبيعية ومجربة.', icon: '✨', img: `${BASE}magic_treatment.png` },
    { id: 2, title: 'الوفاق والارتباط', desc: 'استشارات متخصصة لتعزيز المودة وتيسير أمور الارتباط والوفاق.', icon: '❤️', img: `${BASE}bring_lover.png` },
    { id: 3, title: 'حل النزاعات العائلية', desc: 'توفيق بين الأطراف المتنازعة وإعادة السكينة للمنزل والأسرة.', icon: '🤝', img: `${BASE}marriage_reconciliation.png` },
    { id: 4, title: 'التحصين النفسي', desc: 'برامج تقوية الذات ضد الحسد والعين والضغوطات اليومية.', icon: '🛡️', img: `${BASE}protection.png` },
    { id: 5, title: 'الأحجار الكريمة', desc: 'أحجار نادرة ومنتقاة لزيادة الجاذبية والقبول الاجتماعي.', icon: '💍', img: `${BASE}spiritual_rings.png` },
    { id: 6, title: 'استشارة حياتية شاملة', desc: 'تحليل دقيق لوضعك الحالي لمعرفة المعوقات وطرق تجاوزها.', icon: '👁️', img: `${BASE}spiritual_reading.png` },
    { id: 7, title: 'توجيه المسار المهني', desc: 'استشارات متخصصة لتحقيق النجاح المهني والمالي والتغلب على تعثرات العمل.', icon: '📈', img: `${BASE}career_success.png` },
    { id: 8, title: 'تعزيز الثقة بالنفس', desc: 'برامج لدعم الشخصية، استعادة الثقة، والتغلب على مخاوف التواصل مع الآخرين.', icon: '💪', img: `${BASE}self_confidence.png` },
    { id: 9, title: 'استقرار الحياة الزوجية', desc: 'حلول عملية لتعزيز التفاهم والمودة بين الزوجين وتجنب الخلافات المستقبلية.', icon: '🏡', img: `${BASE}marital_stability.png` },
  ];

  const defaultSvcs = useMemo(() => [
    { id: 'd1', title: 'تطهير الطاقة السلبية', desc: 'تخلص من أثر الطاقات الضارة والعقبات النفسية بطرق طبيعية ومجربة.', icon: '✨', img: `${BASE}magic_treatment.png`, order: 100 },
    { id: 'd2', title: 'الوفاق والارتباط', desc: 'استشارات متخصصة لتعزيز المودة وتيسير أمور الارتباط والوفاق.', icon: '❤️', img: `${BASE}bring_lover.png`, order: 101 },
    { id: 'd3', title: 'حل النزاعات العائلية', desc: 'توفيق بين الأطراف المتنازعة وإعادة السكينة للمنزل والأسرة.', icon: '🤝', img: `${BASE}marriage_reconciliation.png`, order: 102 },
    { id: 'd4', title: 'التحصين النفسي', desc: 'برامج تقوية الذات ضد الحسد والعين والضغوطات اليومية.', icon: '🛡️', img: `${BASE}protection.png`, order: 103 },
    { id: 'd5', title: 'الأحجار الكريمة', desc: 'أحجار نادرة ومنتقاة لزيادة الجاذبية والقبول الاجتماعي.', icon: '💍', img: `${BASE}spiritual_rings.png`, order: 104 },
    { id: 'd6', title: 'استشارة حياتية شاملة', desc: 'تحليل دقيق لوضعك الحالي لمعرفة المعوقات وطرق تجاوزها.', icon: '👁️', img: `${BASE}spiritual_reading.png`, order: 105 },
    { id: 'd7', title: 'توجيه المسار المهني', desc: 'استشارات متخصصة لتحقيق النجاح المهني والمالي والتغلب على تعثرات العمل.', icon: '📈', img: `${BASE}career_success.png`, order: 106 },
    { id: 'd8', title: 'تعزيز الثقة بالنفس', desc: 'برامج لدعم الشخصية، استعادة الثقة، والتغلب على مخاوف التواصل.', icon: '💪', img: `${BASE}self_confidence.png`, order: 107 },
    { id: 'd9', title: 'استقرار الحياة الزوجية', desc: 'حلول عملية لتعزيز التفاهم والمودة بين الزوجين.', icon: '🏡', img: `${BASE}marital_stability.png`, order: 108 },
  ], [BASE]);

  const defaultRecordings = useMemo(() => [
    { id: 1, src: `${BASE}audio/recording1.ogg`, title: 'تسجيل نجاح واستشارة 1', description: 'تجربة واقعية لأحد المستفيدين توضح نتائج الاستشارة الروحانية وكيف تغيرت حياتهم للأفضل.' },
    { id: 2, src: `${BASE}audio/recording2.ogg`, title: 'توجيهات روحانية عامة', description: 'مجموعة من النصائح والتوجيهات الهامة لتحقيق التوازن النفسي والسكينة في المنزل.' },
  ], [BASE]);

  // Initialize with defaults immediately so there's zero loading delay
  const [services, setServices] = useState(defaultSvcs);
  const [recordings, setRecordings] = useState(defaultRecordings);
  const [loading, setLoading] = useState(false);

  // Load data from Supabase in background — no loading spinner needed
  useEffect(() => {
    const loadData = async () => {
      let svcs = [], recs = [];
      try {
        const results = await Promise.allSettled([fetchServices(), fetchRecordings()]);
        if (results[0].status === 'fulfilled' && results[0].value) svcs = results[0].value;
        if (results[1].status === 'fulfilled' && results[1].value) recs = results[1].value;
      } catch (err) {
        console.warn('Supabase fetch failed:', err.message);
      }

      // Merge Supabase services on top of defaults
      if (svcs.length > 0) {
        const mergedSvcs = [...defaultSvcs];
        svcs.forEach(s => {
          const idx = mergedSvcs.findIndex(d => d.title === s.title);
          if (idx !== -1) {
            mergedSvcs[idx] = s;
          } else {
            mergedSvcs.unshift(s);
          }
        });
        setServices(mergedSvcs);
      }

      if (recs.length > 0) setRecordings(recs);
    };
    loadData();
  }, [defaultSvcs, defaultRecordings]);
  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key === 'a') {
        handleAdminLogin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [services, recordings]); // Add dependencies if needed

  const handleAdminLogin = () => {
    const pass = window.prompt('أدخل كلمة المرور للوصول إلى لوحة التحكم:');
    if (pass === 'admin123') {
      setIsAdminAuthenticated(true);
      setShowAdmin(true);
    } else {
      alert('كلمة مرور خاطئة!');
    }
  };

  return (
    <div className="app-wrapper">
      <TestimonialsTicker />
      <Navbar onPrivacyClick={() => setShowPrivacy(true)} onTermsClick={() => setShowTerms(true)} theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <TrustBar />
      <Services servicesList={services} />
      <AudioLibrary recordings={recordings} />
      <FAQ />
      <Testimonials />
      <Contact />
      <About />
      <WhatsAppBtn />
      <ChatWidget />
      
      <footer style={{ textAlign: 'center', padding: '3rem 1rem 2rem 1rem', background: 'var(--primary)', color: 'var(--text-muted)' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto 2rem auto', fontSize: '0.85rem', lineHeight: '1.8', borderTop: '1px solid rgba(212, 175, 55, 0.2)', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', padding: '1.5rem' }}>
            <strong style={{ color: 'var(--accent)' }}>إخلاء مسؤولية (Disclaimer):</strong> هذا المحتوى والخدمات المقدمة هي لأغراض الإرشاد، الدعم المعنوي، والترفيه فقط. نحن لا نقدم وعوداً حتمية أو ضمانات مطلقة، ولا نغني بأي شكل من الأشكال عن الاستشارة الطبية، أو العلاج النفسي، أو المشورة القانونية المتخصصة. النتائج تختلف من شخص لآخر ولا توجد ضمانات للنتائج.
          </div>
          
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#about" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 'bold' }}>من نحن</a>
            <a href="#contact" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 'bold' }}>اتصل بنا</a>
            <span style={{ cursor: 'pointer', color: 'var(--accent-light)', textDecoration: 'underline', fontWeight: 'bold' }} onClick={() => setShowTerms(true)}>شروط الاستخدام</span>
            <span style={{ cursor: 'pointer', color: 'var(--accent-light)', textDecoration: 'underline', fontWeight: 'bold' }} onClick={() => setShowPrivacy(true)}>سياسة الخصوصية</span>
            <button 
              onClick={handleAdminLogin}
              style={{ 
                background: 'rgba(212, 175, 55, 0.1)', 
                border: '1px solid var(--accent)', 
                color: 'var(--accent)', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                cursor: 'pointer',
                fontWeight: 'bold',
                marginLeft: '10px'
              }}
            >
              🔐 لوحة التحكم
            </button>
          </div>
          
          <div style={{ fontSize: '0.8rem', opacity: '0.6' }}>
            &copy; {new Date().getFullYear()} الشيخ أبو حيدر الشمري. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showAdmin && isAdminAuthenticated && (
          <AdminPanel 
            services={services} 
            setServices={setServices} 
            recordings={recordings} 
            setRecordings={setRecordings} 
            onClose={() => setShowAdmin(false)} 
            BASE={BASE}
          />
        )}
      </AnimatePresence>

      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsOfServiceModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}

export default App;
