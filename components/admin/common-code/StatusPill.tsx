interface StatusPillProps {
  status: 'Active' | 'Inactive'
}

export function StatusPill({ status }: StatusPillProps) {
  const config = {
    Active: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    Inactive: { bg: 'bg-slate-100', text: 'text-slate-600' },
  }[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status === 'Active' ? '활성' : '비활성'}
    </span>
  )
}


