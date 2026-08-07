import React from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, message, action, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={28} />
      </div>
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {action && <button className="btn btn-outline" onClick={onAction}>{action}</button>}
    </div>
  )
}
