import { toast, Toaster, ToastBar } from "react-hot-toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

// --- Custom Toaster Component ---
export const CustomToaster = () => (
  <Toaster position="top-right">
    {(t) => (
      <ToastBar toast={t}>
        {({ icon, message }) => {
          // Determine icon based on type
          const typeIcon = (() => {
            if (t.type === "success") return <CheckCircle className="text-accent-ink" size={18} />;
            if (t.type === "error") return <AlertCircle className="text-accent-ink" size={18} />;
            if (t.type === "blank") return <Info className="text-accent-ink" size={18} />;
            return icon;
          })();

          // Determine background color
          const bgColor =
            t.type === "success"
              ? "bg-positive"
              : t.type === "error"
              ? "bg-negative"
              : "bg-accent";

          return (
            <div
              className={`
                flex items-center justify-between gap-4 px-2 py-2 w-fit rounded-card shadow-md text-accent-ink font-small text-sm
                ${bgColor} ${t.visible ? "animate-custom-enter" : "animate-custom-leave"}
              `}
            >
              {typeIcon}
              {message}
              {t.type !== "loading" && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="text-accent-ink hover:opacity-80 transition cursor-pointer"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          );
        }}
      </ToastBar>
    )}
  </Toaster>
);

// --- Helper function to trigger toast ---
export const showToast = (message, type = "info") => {
  if (type === "success") return toast.success(message);
  if (type === "error") return toast.error(message);

  return toast(message);
};
