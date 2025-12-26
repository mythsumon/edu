'use client'

interface StatusChangePageHeaderStickyProps {
  className?: string
}

export function StatusChangePageHeaderSticky({ className = '' }: StatusChangePageHeaderStickyProps) {
  return (
    <div className={`sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 ${className}`}>
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">교육 상태 변경</h1>
    </div>
  )
}

