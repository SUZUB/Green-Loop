import React from "react";

type State = {
  hasError: boolean;
  errorMessage: string;
};

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = {
    hasError: false,
    errorMessage: "",
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || "Unknown runtime error",
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App runtime error:", error, errorInfo);
    // If the root never paints UI, this still lands in the console.
    if (typeof document !== "undefined") {
      document.title = "GREEN LOOP — Error";
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "Inter, sans-serif" }}>
          <div style={{ maxWidth: 720, width: "100%", border: "1px solid #fecaca", background: "#fff1f2", color: "#7f1d1d", borderRadius: 12, padding: 20 }}>
            <h1 style={{ margin: 0, fontSize: 22 }}>Something went wrong</h1>
            <p style={{ marginTop: 10, lineHeight: 1.5 }}>
              The app hit a runtime error. Refresh the page. If this persists, copy the browser console error and share it for a targeted fix.
            </p>
            <pre style={{ marginTop: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#ffe4e6", padding: 12, borderRadius: 8 }}>
              {this.state.errorMessage}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

