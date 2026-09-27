import React from 'react';
import { X, Shield, Sun, Leaf, Droplets, Flame, AlertCircle, Sparkles, Navigation, Layers } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">How to Play Hexa Grove</h2>
            <p className="text-xs text-slate-500">Master building on the outskirts of the procedural forest</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-sm text-slate-700">
          {/* Section 1: Tile Rules */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              1. Ground Tiles & Placement Rules
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <Shield className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Gray Tiles (Safe Clearance)</div>
                  <div className="text-xs text-slate-600">Any hexagon cell can be placed here safely without restriction.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <Sun className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-900 text-xs">Colored Zone Tiles</div>
                  <div className="text-xs text-amber-700">
                    Must be built with a hexagon of the <strong>exact matching color</strong> (Amber, Emerald, Sapphire, Ruby).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-900 text-xs">Expansion Rewards</div>
                  <div className="text-xs text-emerald-700">
                    Filling all colored zones in a phase pushes back the deep forest, unlocking new expansion areas and bonus points!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Penalties */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              2. The 4 Penalty Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="font-bold text-rose-800">Overuse (-150 pts)</span>
                <p className="text-rose-700 mt-0.5">Building more tiles than the par limit of the level.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="font-bold text-rose-800">Disconnect (-120 pts)</span>
                <p className="text-rose-700 mt-0.5">Placing tiles isolated from the main contiguous city cluster.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="font-bold text-rose-800">Overlap Error (-100 pts)</span>
                <p className="text-rose-700 mt-0.5">
                  Placing on top of an occupied cell triggers an Overlap Error (+1). You must remove the top tile (left-click to pick up or right-click to recall) otherwise the Overlap Penalty will be placed!
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="font-bold text-rose-800">Off-Map (-80 pts)</span>
                <p className="text-rose-700 mt-0.5">Dropping pieces outside the valid unlocked play boundary.</p>
              </div>
            </div>
          </div>

          {/* Section 3: New Mechanics */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              3. Advanced Mechanics
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900">Clusters (2 to 6 Hexes):</span>
                <p className="text-slate-600 mt-0.5">
                  Multi-cell pieces with varying shapes (duo, triad, quad, pentad, blossom). Press <strong>'R' key</strong> or click <strong>Rotate Cluster</strong> while holding to rotate them 60° before placing!
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200">
                <span className="font-bold text-cyan-900">Rotation Zones (Turntables):</span>
                <p className="text-cyan-800 mt-0.5">
                  Click the 3D turntable dial or the HUD button to rotate the 7 surrounding hexes by 60°, shifting placed tiles to solve spatial alignments and color paths!
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200">
                <span className="font-bold text-purple-900">Mastery Challenges (Level 3+):</span>
                <p className="text-purple-800 mt-0.5">
                  Special level-wide objectives. You must achieve at least <strong>1 Star Goal</strong> PLUS fulfill the <strong>Mastery Challenge</strong> in order to proceed!
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Controls */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-600" />
              4. Controls & Shortcuts
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
              <li><strong>Left-Click:</strong> Select piece or pick up placed tile. Click again on destination to place or relocate.</li>
              <li><strong>Right-Click:</strong> Instantly cancel holding piece or recall placed tile back to available list.</li>
              <li><strong>'R' Key:</strong> Rotate held cluster piece by 60° clockwise.</li>
              <li><strong>Pan & Zoom:</strong> Drag ground with primary mouse button to pan; mouse wheel to zoom.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition-colors cursor-pointer"
          >
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
