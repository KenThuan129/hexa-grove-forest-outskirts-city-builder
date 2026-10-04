// src/components/vn/VNStudioModal.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Save,
  Upload,
  Download,
  Eye,
  X,
  FileCode,
  Layers,
  Compass,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type { VNChapter } from '../../types/vn';
import { VN_CHAPTERS } from '../../data/vn';
import {
  loadCustomVNChapters,
  upsertCustomVNChapter,
  deleteCustomVNChapter,
  allocateCustomChapterId,
} from '../../utils/vnStorage';
import { VNSceneGraph } from './VNSceneGraph';
import { VNLineEditor } from './VNLineEditor';
import { sounds } from '../../utils/audio';

interface VNStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when the author requests a preview of a chapter. */
  onPreviewChapter?: (chapter: VNChapter) => void;
}

export const VNStudioModal: React.FC<VNStudioModalProps> = ({
  isOpen,
  onClose,
  onPreviewChapter,
}) => {
  // ── Chapter source list ─────────────────────────────────────
  const [customChapters, setCustomChapters] = useState<VNChapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  // ── Draft state — the chapter currently open for editing ────
  const [draft, setDraft] = useState<VNChapter | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  // ── Toast ───────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  // ── Load chapters when the modal opens ──────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const loaded = loadCustomVNChapters();
    setCustomChapters(loaded);

    if (selectedChapterId === null && VN_CHAPTERS.length > 0) {
      setSelectedChapterId(VN_CHAPTERS[0].id);
      const first = JSON.parse(JSON.stringify(VN_CHAPTERS[0])) as VNChapter;
      setDraft(first);
      setSelectedSceneId(first.scenes[0]?.id ?? null);
    }
  }, [isOpen]);

  // ── Merge built-in and custom chapters for the list ─────────
  const allChapters = useMemo(() => {
    // Custom chapters override built-ins by id.
    const customIds = new Set(customChapters.map((c) => c.id));
    return [
      ...VN_CHAPTERS.map((c) => (customIds.has(c.id) ? customChapters.find((x) => x.id === c.id)! : c)),
      ...customChapters.filter((c) => !VN_CHAPTERS.some((b) => b.id === c.id)),
    ];
  }, [customChapters]);

  // ── Select a chapter into the draft ─────────────────────────
  const handleSelectChapter = useCallback(
    (id: number) => {
      const chapter = allChapters.find((c) => c.id === id);
      if (!chapter) return;
      setSelectedChapterId(id);
      const cloned = JSON.parse(JSON.stringify(chapter)) as VNChapter;
      setDraft(cloned);
      setSelectedSceneId(cloned.scenes[0]?.id ?? null);
      sounds.playClick();
    },
    [allChapters]
  );

  // ── Save current draft ──────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!draft) return;
    if (draft.id <= 2) {
      // Reserved ids for tutorials — refuse to save over them.
      sounds.playWarning();
      showToast('Cannot overwrite Chapter 1 or 2 — they are reserved.');
      return;
    }

    const next = upsertCustomVNChapter(draft);
    setCustomChapters(next);
    sounds.playVictory();
    showToast(`Saved "${draft.title}" (Chapter ${draft.chapterNumber}).`);
  }, [draft, showToast]);

  // ── Create a new chapter ────────────────────────────────────
  const handleCreateChapter = useCallback(() => {
    const existingIds = allChapters.map((c) => c.id);
    const newId = allocateCustomChapterId(existingIds);
    const newChapter: VNChapter = {
      id: newId,
      chapterNumber: newId - 999, // display as Chapter 1, 2, 3...
      title: 'Untitled Chapter',
      subtitle: 'A new chapter',
      levelReq: 0,
      sketchIcon: '📖',
      summary: 'A new chapter awaiting authorship.',
      bgGradient: 'from-slate-900 to-slate-950',
      scenes: [
        {
          id: `scene-${Date.now()}`,
          title: 'Opening',
          background: { mood: 'dream_forest', vignette: true },
          lines: [
            {
              id: `line-${Date.now()}`,
              speakerId: 'narration',
              text: 'Begin writing here...',
            },
          ],
        },
      ],
    };

    const next = [...customChapters, newChapter];
    setCustomChapters(next);
    upsertCustomVNChapter(newChapter);
    setSelectedChapterId(newId);
    setDraft(newChapter);
    sounds.playVictory();
    showToast(`Created "${newChapter.title}" (Chapter ${newChapter.chapterNumber}).`);
  }, [allChapters, customChapters, showToast]);

  // ── Delete the selected custom chapter ──────────────────────
  const handleDeleteChapter = useCallback(() => {
    if (!draft) return;
    const isCustom = customChapters.some((c) => c.id === draft.id);
    if (!isCustom) {
      sounds.playWarning();
      showToast('Cannot delete a built-in chapter. Save as a custom id first.');
      return;
    }
    if (!window.confirm(`Delete "${draft.title}"? This cannot be undone.`)) return;
    const next = deleteCustomVNChapter(draft.id);
    setCustomChapters(next);
    const fallback = VN_CHAPTERS[0];
    setSelectedChapterId(fallback.id);
    setDraft(JSON.parse(JSON.stringify(fallback)));
    sounds.playWarning();
    showToast(`Deleted custom chapter.`);
  }, [draft, customChapters, showToast]);

  const pushDraft = useCallback((updater: (draft: VNChapter) => void) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as VNChapter;
      updater(next);
      // Auto-save to localStorage on every change.
      try {
        upsertCustomVNChapter(next);
        setCustomChapters(loadCustomVNChapters());
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const handleCreateScene = useCallback(() => {
    if (!draft) return;
    const newSceneId = `scene-${Date.now()}`;
    pushDraft((d) => {
      d.scenes.push({
        id: newSceneId,
        title: `Scene ${d.scenes.length + 1}`,
        background: { mood: 'dream_forest', vignette: true },
        lines: [
          {
            id: `line-${Date.now()}`,
            speakerId: 'narration',
            text: 'Begin writing here…',
          },
        ],
      });
    });
    setSelectedSceneId(newSceneId);
    showToast(`Added new scene.`);
  }, [draft, pushDraft, showToast]);

  const handleDeleteScene = useCallback(
    (sceneId: string) => {
      if (!draft) return;
      if (draft.scenes.length <= 1) {
        sounds.playWarning();
        showToast('A chapter must have at least one scene.');
        return;
      }
      if (!window.confirm('Delete this scene? Any choices or jumps pointing here will be cleared.')) {
        return;
      }
      pushDraft((d) => {
        d.scenes = d.scenes.filter((s) => s.id !== sceneId);
        // Clean up all references to the deleted scene.
        d.scenes.forEach((s) => {
          if (s.nextSceneId === sceneId) s.nextSceneId = undefined;
          s.lines.forEach((l) => {
            if (l.nextSceneId === sceneId) l.nextSceneId = undefined;
            if (l.choice) {
              l.choice.options.forEach((o) => {
                if (o.nextSceneId === sceneId) o.nextSceneId = undefined;
              });
            }
          });
        });
      });
      setSelectedSceneId(null);
      showToast(`Scene deleted.`);
    },
    [draft, pushDraft, showToast]
  );

  // ── Export current draft as JSON ────────────────────────────
  const handleExport = useCallback(() => {
    if (!draft) return;
    const json = JSON.stringify(draft, null, 2);
    navigator.clipboard.writeText(json);
    sounds.playVictory();
    showToast('Chapter JSON copied to clipboard.');
  }, [draft, showToast]);

  // ── Download current draft as file ──────────────────────────
  const handleDownload = useCallback(() => {
    if (!draft) return;
    const json = JSON.stringify(draft, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vn_chapter_${draft.id}_${draft.title.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sounds.playVictory();
    showToast('Chapter downloaded.');
  }, [draft, showToast]);

  // ── Preview current draft ───────────────────────────────────
  const handlePreview = useCallback(() => {
    if (!draft || !onPreviewChapter) return;
    onPreviewChapter(draft);
    sounds.playClick();
  }, [draft, onPreviewChapter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5 bg-slate-950/92 backdrop-blur-xl text-slate-100 select-none font-sans">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* ── Toolbar ──────────────────────────────────────────── */}
        <header className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/85">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-2">
                <span>VN STUDIO</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/40 rounded-full">
                  Author Chapter
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Design narrative scenes, timeline events, and gameplay interventions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateChapter}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-xl shadow-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chapter</span>
            </button>

            <button
              onClick={handlePreview}
              disabled={!draft}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!draft}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 rounded-xl shadow"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Save</span>
            </button>

            <button
              onClick={handleExport}
              disabled={!draft}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 rounded-xl shadow"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy JSON</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!draft}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 rounded-xl shadow"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="ml-2 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ── Three-panel body ─────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left — Chapter list */}
          <aside className="w-64 border-r border-slate-800 bg-slate-950/60 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Chapters
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {allChapters.map((c) => {
                const isCustom = customChapters.some((x) => x.id === c.id);
                const isSelected = selectedChapterId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectChapter(c.id)}
                    className={`w-full text-left px-3 py-2.5 mb-1 rounded-xl transition-all flex items-start gap-2.5 ${isSelected
                        ? 'bg-cyan-500/15 border border-cyan-500/50 text-white'
                        : 'border border-transparent hover:bg-slate-900 text-slate-300'
                      }`}
                  >
                    <span className="text-xl leading-none mt-0.5 shrink-0">{c.sketchIcon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase">
                          Ch {c.chapterNumber}
                        </span>
                        {isCustom && (
                          <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 uppercase tracking-wide">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold truncate">{c.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {c.scenes.length} scene{c.scenes.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center — Canvas placeholder */}
          <main className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
            {draft ? (
              <>
                {/* Canvas chrome — for Phase 1 this is a placeholder */}
                <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      {draft.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      id {draft.id} · {draft.scenes.length} scenes
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                      Graph View
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 opacity-50">
                      Timeline View
                    </span>
                  </div>
                </div>

                {/* Placeholder canvas */}
                <div className="flex-1 min-h-0">
                  <VNSceneGraph
                    chapter={draft}
                    selectedSceneId={selectedSceneId}
                    onSelectScene={(id) => setSelectedSceneId(id || null)}
                    onChange={pushDraft}
                    onCreateScene={handleCreateScene}
                    onDeleteScene={handleDeleteScene}
                  />
                </div>

                {/* ── Line Editor (bottom panel) ─────────────── */}
                <div
                  className="border-t border-slate-800 bg-slate-950/70"
                  style={{ height: '36%', minHeight: 220 }}
                >
                  <VNLineEditor
                    chapter={draft}
                    scene={
                      draft.scenes.find((s) => s.id === selectedSceneId) ?? null
                    }
                    onChange={pushDraft}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Select a chapter to begin editing.
              </div>
            )}
          </main>

          {/* Right — Inspector placeholder */}
          <aside className="w-80 border-l border-slate-800 bg-slate-950/60 flex flex-col">
            {draft ? (
              <>
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Chapter Properties
                  </span>
                  {customChapters.some((c) => c.id === draft.id) && (
                    <button
                      onClick={handleDeleteChapter}
                      className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  <Field label="Chapter Number">
                    <input
                      type="number"
                      value={draft.chapterNumber}
                      onChange={(e) =>
                        setDraft({ ...draft, chapterNumber: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </Field>

                  <Field label="Chapter Title">
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </Field>

                  <Field label="Subtitle">
                    <input
                      type="text"
                      value={draft.subtitle}
                      onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none"
                    />
                  </Field>

                  <Field label="Summary">
                    <textarea
                      rows={3}
                      value={draft.summary}
                      onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none resize-none"
                    />
                  </Field>

                  <Field label="Unlock Level Requirement">
                    <input
                      type="number"
                      value={draft.levelReq}
                      onChange={(e) =>
                        setDraft({ ...draft, levelReq: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </Field>

                  <div className="pt-4 mt-1 border-t border-slate-800 flex items-start gap-2 text-[10.5px] text-slate-500 leading-relaxed">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Scene editing, background configuration, character placement, and
                      line authoring arrive in Phase 1. For now, the shell is in place
                      and chapters are saved to local storage.
                    </span>
                  </div>
                  {selectedSceneId && (
                    <div className="pt-4 mt-1 border-t border-slate-800">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                        Selected Scene
                      </span>
                      <div className="text-[11px] font-mono text-cyan-300 mb-1">
                        {selectedSceneId}
                      </div>
                      <div className="text-[10.5px] text-slate-500">
                        Edit its lines in the panel below. Drag the port on the
                        node's right edge to another node to set the scene's next jump.
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs text-center px-6">
                No chapter selected.
              </div>
            )}
          </aside>
        </div>

        {/* ── Toast ────────────────────────────────────────────── */}
        {toast && (
          <div className="absolute bottom-4 right-4 px-4 py-2 rounded-2xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Small field wrapper for consistency
// ─────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

export default VNStudioModal;