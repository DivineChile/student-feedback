import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { signUpStudent } from "@/lib/auth"
import { showToast } from "../ui/toast"
import { getAuthErrorMessage } from "@/lib/authErrors"

// --- Input Field Component ---
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
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
            ${error ? "border-red-400 focus:ring-red-400" : "border-gray-200"}`}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// --- Validation ---
function validateForm(data) {
  const errors = {}

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required."
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = "Full name must be at least 3 characters."
  }

  if (!data.matricNumber.trim()) {
    errors.matricNumber = "Matric number is required."
  } else if (
  !/^(20\d{2})\/(ND1|ND2|HND1|HND2)\/(COMP|PET|SLT|ISSET|BAM|ELECT)\/\d{3}$/.test(
    data.matricNumber.trim()
  )
) {
  errors.matricNumber =
    "Matric number must follow format: 2024/HND2/COMP/003";
}

  if (!data.email.trim()) {
    errors.email = "Email address is required."
  }

  if (!data.password) {
    errors.password = "Password is required."
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  }

  return errors
}

// --- Main Component ---
export default function RegisterForm() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: "",
    matricNumber: "",
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {

      // Create auth account
      const user = await signUpStudent({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        matricNumber: formData.matricNumber,
      })

      if (!user) {
        console.log("User Creation Failed");
        throw new Error("User creation failed")
      }

      //Toast notification
      showToast("Signup Successful!", "success")

      setTimeout(() => {
        // Redirect to login after signup
        navigate("/login")
      }, 1200)

    } catch (err) {
     const message = getAuthErrorMessage(err)
     showToast(message, "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      <InputField
        label="Full Name"
        id="fullName"
        placeholder="e.g. Amara Okafor"
        value={formData.fullName}
        onChange={handleChange("fullName")}
        error={errors.fullName}
      />

      <InputField
        label="Matric Number"
        id="matricNumber"
        placeholder="e.g. 2024/HND2/COMP/001"
        value={formData.matricNumber}
        onChange={handleChange("matricNumber")}
        error={errors.matricNumber}
      />

      <InputField
        label="Email Address"
        id="email"
        type="email"
        placeholder="you@university.edu"
        value={formData.email}
        onChange={handleChange("email")}
        error={errors.email}
      />

      <InputField
        label="Password"
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="At least 8 characters"
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg
        hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  )
}
