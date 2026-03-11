import React from 'react';

/**
 * Standard ErrorBoundary to catch rendering crashes in child component trees
 * and display a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    ⚠️ Произошла ошибка при загрузке компонента.
                </div>
            );
        }

        return this.props.children;
    }
}
