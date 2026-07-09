import type { ReactNode } from 'react'

interface ModalProps {
  onClose: () => void
  size?: 'md' | 'lg'
  children: ReactNode
}

export default function Modal({ onClose, size = 'md', children }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={size === 'lg' ? 'modal modal-lg' : 'modal'}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
