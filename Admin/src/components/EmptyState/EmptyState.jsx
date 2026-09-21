import { Inbox } from "lucide-react";
import "./EmptyState.css";

export default function EmptyState({ title = "Nothing here yet", description, action, icon: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon-wrap">
        <Icon size={28} className="empty-state-icon" />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
