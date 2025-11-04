import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0C0C] px-4">
      <div className="max-w-md w-full bg-[#171717] border border-[#262626] rounded-xl p-8 text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-[#FAFAFA] mb-3">Authentication Error</h2>
        <p className="text-[#A3A3A3] mb-8">
          Sorry, we couldn&apos;t complete your authentication. This could be due to an expired link or an error in the process.
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full bg-[#84CC16] text-[#0C0C0C] py-3 min-h-12 px-6 rounded-lg hover:bg-[#73B812] active:bg-[#65A10C] transition-colors font-bold"
          >
            Try Logging In Again
          </Link>
          <Link
            href="/signup"
            className="block w-full bg-[#0C0C0C] border-2 border-[#262626] text-[#FAFAFA] py-3 min-h-12 px-6 rounded-lg hover:bg-[#171717] active:bg-[#0C0C0C] transition-colors font-semibold"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  )
}
