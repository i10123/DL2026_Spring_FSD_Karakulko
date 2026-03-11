import { useState, useCallback, useRef, useEffect } from 'react';

export function useQRHistory(initialState) {
    const [state, setState] = useState({
        history: [initialState],
        pointer: 0,
        tempConfig: null // Holds intermediate config changes before debouncing into history
    });

    const timeoutRef = useRef(null);

    // Get current effective config (temp if typing, otherwise history pointer)
    const currentConfig = state.tempConfig || state.history[state.pointer];

    const _commitToHistory = useCallback((newConfigObj) => {
        setState((prevState) => {
            const { history, pointer } = prevState;
            const committedConfig = history[pointer];

            const isDifferent = Object.keys(newConfigObj).some(
                (key) => committedConfig[key] !== newConfigObj[key]
            );

            if (!isDifferent) {
                return { ...prevState, tempConfig: null }; // Drop temp if no real changes
            }

            const newHistory = history.slice(0, pointer + 1);
            newHistory.push(newConfigObj);

            return {
                history: newHistory,
                pointer: pointer + 1,
                tempConfig: null
            };
        });
    }, []);

    const setConfig = useCallback((newStateOrUpdater) => {
        setState((prevState) => {
            const effectiveCurrent = prevState.tempConfig || prevState.history[prevState.pointer];

            const nextStateFragment = typeof newStateOrUpdater === 'function'
                ? newStateOrUpdater(effectiveCurrent)
                : newStateOrUpdater;

            const mergedNextState = { ...effectiveCurrent, ...nextStateFragment };

            // Update purely temporary state for instant UI reaction
            return {
                ...prevState,
                tempConfig: mergedNextState
            };
        });

        // Clear existing debounce timer
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new debounce timer to push to main history stack
        timeoutRef.current = setTimeout(() => {
            // We use functional setState via the committed function above
            // to ensure we grab the LATEST tempConfig
            setState(current => {
                if (current.tempConfig) {
                    _commitToHistory(current.tempConfig);
                }
                return current;
            })
        }, 800);

    }, [_commitToHistory]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const undo = useCallback(() => {
        // Clear any pending temp states when using history navigation
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setState((prevState) => ({
            ...prevState,
            pointer: Math.max(0, prevState.pointer - 1),
            tempConfig: null
        }));
    }, []);

    const redo = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setState((prevState) => ({
            ...prevState,
            pointer: Math.min(prevState.history.length - 1, prevState.pointer + 1),
            tempConfig: null
        }));
    }, []);

    return {
        config: currentConfig,
        setConfig,
        undo,
        redo,
        canUndo: state.pointer > 0,
        canRedo: state.pointer < state.history.length - 1,
        resetHistory: (newState) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setState({
                history: [newState],
                pointer: 0,
                tempConfig: null
            });
        }
    };
}

