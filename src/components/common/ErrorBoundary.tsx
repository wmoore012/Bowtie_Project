import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught", error, info);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert">Something went wrong.</div>
      );
    }
    return this.props.children;
  }
}

