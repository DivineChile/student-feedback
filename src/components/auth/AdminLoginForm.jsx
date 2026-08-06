import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signInAdmin } from "@/lib/auth";
import { showToast } from "@/components/ui/toast";
import { getAuthErrorMessage } from "@/lib/authErrors";

function InputField({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  rightElement,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 text-sm rounded-input border bg-paper text-ink placeholder-ink-2/60
            focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-transparent transition-colors
            ${error ? "border-negative" : "border-rule"}`}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-negative">{error}</p>}
    </div>
  );
}

function validateForm(data) {
  const errors = {};

  if (!data.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export default function AdminLoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      console.log("trying to sign in")
      const user = await signInAdmin(formData.email.trim(), formData.password);

      console.log("Admin user", user)

      showToast("Admin login successful.", "success");

      navigate("/admin", { replace: true });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <InputField
        label="Email Address"
        id="email"
        type="email"
        placeholder="admin@example.com"
        value={formData.email}
        onChange={handleChange("email")}
        error={errors.email}
      />

      <InputField
        label="Password"
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-ink-2 hover:text-ink transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent text-accent-ink text-sm font-medium py-2.5 rounded-pill
          hover:opacity-90 active:opacity-80 transition-opacity duration-200
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Signing in...
          </>
        ) : (
          "Login as Admin"
        )}
      </button>
    </form>
  );
}
