'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
      <p className="text-gray-400 mb-2">{error.message}</p>
      {error.digest && <p className="text-gray-600 text-xs mb-4">Digest: {error.digest}</p>}
      <button onClick={reset} className="gradient-btn text-white px-6 py-3 rounded-xl">Try again</button>
    </div>
  )
}
