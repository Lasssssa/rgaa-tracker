interface StatusBadgeProps {
  patched: boolean
}

export default function StatusBadge({ patched }: StatusBadgeProps) {
  return (
    <span className={`badge ${patched ? 'patched' : 'todo'}`}>
      {patched ? 'Corrigé' : 'À corriger'}
    </span>
  )
}
