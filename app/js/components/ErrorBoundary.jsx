import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  componentDidCatch(error, info) {
    this.setState({ error, componentStack: '' + info.componentStack })
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  render() {
    if (this.state.error) {
      return <div className='error-display'>
        <h1>Something went wrong.</h1>
        <p>Try reloading the page.</p>
        <pre style={{
          padding: '1em',
          backgroundColor: '#eeeeee',
          color: '#444444',
        }}>
          {'' + this.state.error.stack}
          {'\n\n'}
          {'' + this.state.componentStack}
        </pre>
      </div>
    }
    return this.props.children
  }
}
