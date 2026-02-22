/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Editor } from "@/components/editor/Editor";
import { Component, ErrorInfo, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white p-4">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto max-w-full">
            {this.state.error?.message}
          </pre>
          <button
            className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen overflow-hidden bg-black">
        <Editor />
      </div>
    </ErrorBoundary>
  );
}
