import React from 'react';
import { Undo2, Redo2, History, X } from 'lucide-react';

interface UndoRedoPanelProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  history: {
    past: any[];
    present: any;
    future: any[];
  };
}

export function UndoRedoPanel({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  history,
}: UndoRedoPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex items-center space-x-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="btn-secondary p-2"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-5 w-5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="btn-secondary p-2"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-secondary p-2"
          title="History"
        >
          <History className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-16 left-4 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 animate-slide-up">
          <div className="flex items-center justify-between p-3 border-b border-neutral-200">
            <h3 className="font-medium">History</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
            {history.past.length === 0 && history.future.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center">No history yet</p>
            ) : (
              <div className="space-y-2">
                {history.past.map((item, index) => (
                  <div
                    key={index}
                    className="text-sm p-2 rounded bg-neutral-50 text-neutral-600"
                  >
                    Past: {JSON.stringify(item).slice(0, 30)}...
                  </div>
                ))}
                <div className="text-sm p-2 rounded bg-primary-50 text-primary-700 font-medium">
                  Current: {JSON.stringify(history.present).slice(0, 30)}...
                </div>
                {history.future.map((item, index) => (
                  <div
                    key={index}
                    className="text-sm p-2 rounded bg-neutral-50 text-neutral-600"
                  >
                    Future: {JSON.stringify(item).slice(0, 30)}...
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}