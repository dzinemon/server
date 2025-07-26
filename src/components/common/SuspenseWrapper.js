import React, { Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary'

const SuspenseWrapper = ({
  children,
  fallback = <div>Loading...</div>,
  errorFallback = 'Failed to load component',
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}

export default SuspenseWrapper
