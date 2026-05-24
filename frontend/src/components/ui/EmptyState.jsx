export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card p-12 text-center">
      {Icon && (
        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-gray-300" />
        </div>
      )}
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-6">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}