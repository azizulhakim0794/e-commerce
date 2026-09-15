type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ⓘ",
  };

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm ${styles[type]}`}
    >
      <span className="text-base">{icons[type]}</span>
      <p>{message}</p>
    </div>
  );
}
