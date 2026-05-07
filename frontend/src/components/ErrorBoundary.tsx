import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">页面出错了</h1>
            <p className="text-gray-600 mb-4">
              抱歉，页面加载时出现了错误。请刷新页面重试，或者联系管理员。
            </p>

            {this.state.error && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">错误信息：</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            {this.state.errorInfo && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">堆栈信息：</h2>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                刷新页面
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                返回登录
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
