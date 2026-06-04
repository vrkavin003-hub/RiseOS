import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import PremiumButton from './PremiumButton';
import StatusBanner from './StatusBanner';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RiseOS route error boundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { children } = this.props;
    const { error } = this.state;

    if (!error) return children;

    return (
      <div className="page-shell" role="alert">
        <div className="glass-panel rounded-[8px] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-ember/12 text-ember">
              <AlertTriangle size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ember">Recovery boundary</p>
              <h1 className="mt-2 text-2xl font-black text-white">This view hit a runtime error</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">
                RiseOS kept the rest of the app alive. Retry the view, or switch sections from the sidebar to continue working.
              </p>
              {import.meta.env.DEV && error?.message && (
                <StatusBanner className="mt-4" size="sm">
                  {error.message}
                </StatusBanner>
              )}
              <PremiumButton className="mt-5" icon={RefreshCw} onClick={this.handleReset} type="button" variant="ghost">
                Retry view
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
