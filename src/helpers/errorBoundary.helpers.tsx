import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  // componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  componentDidCatch() {
    // You can log the error to an error reporting service
    this.setState({ hasError: true })
  }

  // static getDerivedStateFromError(err: Error) {
  static getDerivedStateFromError() {
    // Update state to show an error message to the user
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      // You can render a fallback UI for when an error occurs
      return (
        <div>
          <h2>Something went wrong</h2>
          <p>Please try again or contact support.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
