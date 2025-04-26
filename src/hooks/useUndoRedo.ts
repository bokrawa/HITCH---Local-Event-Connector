import React from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialPresent: T) {
  const [state, setState] = React.useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  // Save to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('history-state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save history state:', error);
    }
  }, [state]);

  // Setup keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const setState2 = (newPresent: T) => {
    setState(prevState => ({
      past: [...prevState.past, prevState.present],
      present: newPresent,
      future: [],
    }));
  };

  const undo = () => {
    if (!canUndo) return;

    setState(prevState => ({
      past: prevState.past.slice(0, -1),
      present: prevState.past[prevState.past.length - 1],
      future: [prevState.present, ...prevState.future],
    }));
  };

  const redo = () => {
    if (!canRedo) return;

    setState(prevState => ({
      past: [...prevState.past, prevState.present],
      present: prevState.future[0],
      future: prevState.future.slice(1),
    }));
  };

  const clear = () => {
    setState({
      past: [],
      present: initialPresent,
      future: [],
    });
  };

  return {
    state: state.present,
    setState: setState2,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    history: {
      past: state.past,
      present: state.present,
      future: state.future,
    },
  };
}