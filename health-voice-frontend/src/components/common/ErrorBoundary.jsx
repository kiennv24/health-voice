import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

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

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4 border border-rose-200 shadow-xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Đã xảy ra lỗi khi tải giao diện</h2>
          <p className="text-slate-600 text-sm max-w-md mb-6 leading-relaxed">
            Hệ thống đã tự động ghi nhận và cô lập sự cố để bảo vệ phiên làm việc của bạn.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-md text-xs font-semibold shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tải lại trang
            </button>
            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold border border-slate-300 transition"
            >
              <Home className="w-3.5 h-3.5" /> Về Thư Viện Podcast
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

