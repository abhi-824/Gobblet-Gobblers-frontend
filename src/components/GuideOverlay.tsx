import React from "react";

type GuideOverlayProps = {
  onClose: () => void;
  onSkipForever: () => void;
};

export function GuideOverlay({ onClose, onSkipForever }: GuideOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-w-lg w-full bg-[#1b1b3a] text-white rounded-2xl shadow-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold mb-3">How to Play</h2>
        <p className="text-white/90 mb-4">Quick tips to get you started:</p>

        <ul className="list-disc pl-6 space-y-2 text-white/90">
          <li>Drag a piece from your side panel onto the board to make a move.</li>
          <li>You can also drag pieces already on the board to another cell.</li>
          <li>Only larger pieces can cover smaller ones: Large | Medium | Small.</li>
          <li>Win by controlling a full row, column, or diagonal with your top pieces.</li>
        </ul>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            onClick={onClose}
          >
            Got it
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-colors"
            onClick={onSkipForever}
          >
            Don't show again
          </button>
        </div>
      </div>
    </div>
  );
}


