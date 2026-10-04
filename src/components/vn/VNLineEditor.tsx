// src/components/vn/VNLineEditor.tsx

import React, { useCallback } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import type { VNChapter, VNLine, VNScene, VNChoiceOption } from '../../types/vn';
import { VN_CHARACTERS } from '../../data/vn/character';

interface VNLineEditorProps {
  chapter: VNChapter;
  scene: VNScene | null;
  onChange: (updater: (draft: VNChapter) => void) => void;
}

export const VNLineEditor: React.FC<VNLineEditorProps> = ({
  chapter,
  scene,
  onChange,
}) => {
  if (!scene) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
        Select a scene above to edit its lines.
      </div>
    );
  }

  const updateSceneLines = (updater: (lines: VNLine[]) => void) => {
    onChange((draft) => {
      const s = draft.scenes.find((x) => x.id === scene.id);
      if (!s) return;
      updater(s.lines);
    });
  };

  const handleAddLine = () => {
    updateSceneLines((lines) => {
      lines.push({
        id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        speakerId: 'narration',
        text: '',
      });
    });
  };

  const handleRemoveLine = (lineId: string) => {
    updateSceneLines((lines) => {
      const idx = lines.findIndex((l) => l.id === lineId);
      if (idx >= 0) lines.splice(idx, 1);
    });
  };

  const handleMoveLine = (lineId: string, direction: -1 | 1) => {
    updateSceneLines((lines) => {
      const idx = lines.findIndex((l) => l.id === lineId);
      if (idx < 0) return;
      const target = idx + direction;
      if (target < 0 || target >= lines.length) return;
      const [item] = lines.splice(idx, 1);
      lines.splice(target, 0, item);
    });
  };

  const handleUpdateLine = (lineId: string, patch: Partial<VNLine>) => {
    updateSceneLines((lines) => {
      const line = lines.find((l) => l.id === lineId);
      if (!line) return;
      Object.assign(line, patch);
    });
  };

  const handleAddChoice = (lineId: string) => {
    updateSceneLines((lines) => {
      const line = lines.find((l) => l.id === lineId);
      if (!line) return;
      if (!line.choice) {
        line.choice = {
          prompt: 'Choose an option',
          options: [
            {
              id: `opt-${Date.now()}-0`,
              label: 'Option 1',
            },
          ],
        };
      }
    });
  };

  const handleRemoveChoice = (lineId: string) => {
    updateSceneLines((lines) => {
      const line = lines.find((l) => l.id === lineId);
      if (!line) return;
      delete line.choice;
    });
  };

  const handleUpdateChoicePrompt = (lineId: string, prompt: string) => {
    updateSceneLines((lines) => {
      const line = lines.find((l) => l.id === lineId);
      if (line?.choice) line.choice.prompt = prompt;
    });
  };

  const handleAddChoiceOption = (lineId: string) => {
    updateSceneLines((lines) => {
      const line = lines.find((l) => l.id === lineId);
      if (!line?.choice) return;
      line.choice.options.push({
        id: `opt-${Date.now()}-${line.choice.options.length}`,
        label: `Option ${line.choice.options.length + 1}`,
      });
    });
  };

  const handleUpdateChoiceOption = (
    lineId: string,
    optionId: string,
    patch: Partial<VNChoiceOption>
  ) => {
    updateSceneLines((lines) => {
      const line = lines.find((l) => l.id === lineId);
      if (!line?.choice) return;
      const opt = line.choice.options.find((o) => o.id === optionId);
      if (opt) Object.assign(opt, patch);
    });
  };

  const handleRemoveChoiceOption = (lineId: string, optionId: string) => {
    updateSceneLines((lines) => {
      const line = lines.find((l) => l.id === lineId);
      if (!line?.choice) return;
      line.choice.options = line.choice.options.filter((o) => o.id !== optionId);
      if (line.choice.options.length === 0) {
        delete line.choice;
      }
    });
  };

  // Compute "next-scene" jump target for the whole scene.
  const sceneNextSceneId = scene.nextSceneId ?? '';

  const allSceneIds = chapter.scenes.map((s) => s.id);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950/60">
      {/* ── Scene header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">
            {scene.title || '(untitled scene)'}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {scene.lines.length} line{scene.lines.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Scene next:
          </label>
          <select
            value={sceneNextSceneId}
            onChange={(e) => {
              onChange((draft) => {
                const s = draft.scenes.find((x) => x.id === scene.id);
                if (!s) return;
                s.nextSceneId = e.target.value || undefined;
              });
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
          >
            <option value="">(end of chapter)</option>
            {allSceneIds
              .filter((id) => id !== scene.id)
              .map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* ── Lines table ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {scene.lines.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-6 italic">
            This scene has no lines yet. Click "Add Line" below.
          </div>
        )}

        {scene.lines.map((line, idx) => (
          <div
            key={line.id}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 flex flex-col gap-2"
          >
            {/* Row 1: speaker + text + controls */}
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-mono text-slate-500 mt-1.5 w-6 shrink-0 text-right">
                {idx + 1}
              </span>

              {/* Speaker dropdown */}
              <select
                value={line.speakerId}
                onChange={(e) =>
                  handleUpdateLine(line.id, { speakerId: e.target.value })
                }
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-cyan-300 font-bold outline-none w-36 shrink-0"
              >
                <option value="narration">Narration</option>
                {Object.values(VN_CHARACTERS)
                  .filter((c) => c.id !== 'narration')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.role}
                    </option>
                  ))}
              </select>

              {/* Text field */}
              <input
                type="text"
                value={line.text}
                onChange={(e) => handleUpdateLine(line.id, { text: e.target.value })}
                placeholder="Type dialogue or narration here…"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-cyan-500"
              />

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleMoveLine(line.id, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => handleMoveLine(line.id, 1)}
                  disabled={idx === scene.lines.length - 1}
                  className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  title="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {!line.choice ? (
                  <button
                    onClick={() => handleAddChoice(line.id)}
                    className="p-1 rounded hover:bg-slate-800 cursor-pointer"
                    title="Add choice"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleRemoveChoice(line.id)}
                    className="p-1 rounded hover:bg-slate-800 cursor-pointer"
                    title="Remove choice"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
                <button
                  onClick={() => handleRemoveLine(line.id)}
                  className="p-1 rounded hover:bg-rose-900/50 cursor-pointer"
                  title="Delete line"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            </div>

            {/* Row 2 (optional): choice editor */}
            {line.choice && (
              <div className="ml-8 pl-3 border-l-2 border-cyan-500/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-cyan-300 shrink-0">
                    Prompt
                  </span>
                  <input
                    type="text"
                    value={line.choice.prompt}
                    onChange={(e) => handleUpdateChoicePrompt(line.id, e.target.value)}
                    className="flex-1 bg-slate-950 border border-cyan-500/40 rounded-lg px-2 py-1 text-[11px] text-cyan-100 outline-none"
                  />
                </div>

                {line.choice.options.map((opt, optIdx) => (
                  <div
                    key={opt.id}
                    className="flex items-center gap-2 bg-slate-950/60 rounded-lg px-2 py-1.5 border border-slate-800"
                  >
                    <span className="text-[10px] font-mono text-slate-500 w-4 shrink-0">
                      {optIdx + 1}.
                    </span>
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) =>
                        handleUpdateChoiceOption(line.id, opt.id, {
                          label: e.target.value,
                        })
                      }
                      className="flex-1 bg-transparent border-0 text-[11px] text-white outline-none"
                    />
                    <select
                      value={opt.aceBond ?? ''}
                      onChange={(e) =>
                        handleUpdateChoiceOption(line.id, opt.id, {
                          aceBond: (e.target.value || undefined) as
                            | 'nature'
                            | 'people'
                            | 'self'
                            | undefined,
                        })
                      }
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] text-amber-300 outline-none w-20 shrink-0"
                    >
                      <option value="">no bond</option>
                      <option value="nature">nature</option>
                      <option value="people">people</option>
                      <option value="self">self</option>
                    </select>
                    <select
                      value={opt.nextSceneId ?? ''}
                      onChange={(e) =>
                        handleUpdateChoiceOption(line.id, opt.id, {
                          nextSceneId: e.target.value || undefined,
                        })
                      }
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] text-cyan-300 outline-none w-32 shrink-0"
                    >
                      <option value="">→ continue</option>
                      {allSceneIds
                        .filter((id) => id !== scene.id)
                        .map((id) => (
                          <option key={id} value={id}>
                            → {id}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => handleRemoveChoiceOption(line.id, opt.id)}
                      className="p-1 rounded hover:bg-rose-900/50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => handleAddChoiceOption(line.id)}
                  className="self-start flex items-center gap-1 text-[10px] font-bold text-cyan-300 hover:text-cyan-200 px-2 py-0.5 rounded hover:bg-cyan-950/60"
                >
                  <Plus className="w-3 h-3" />
                  Add Option
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={handleAddLine}
          className="self-start flex items-center gap-1.5 text-[11px] font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 px-3 py-1.5 rounded-lg shadow mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Line
        </button>
      </div>
    </div>
  );
};

export default VNLineEditor;