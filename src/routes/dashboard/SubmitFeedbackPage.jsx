import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/toast";
import { processFeedback } from "@/lib/feedbackEngine";
import { CATEGORIES } from "@/utils/categories";

const RATINGS = [
  { value: 1, label: "Very Poor" },
  { value: 2, label: "Poor" },
  { value: 3, label: "Fair" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

function SelectField({ label, id, value, onChange, options, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
          ${error ? "border-red-400 focus:ring-red-400" : "border-gray-200"}`}
      >
        <option value="">Select a category</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function InputField({ label, id, placeholder, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white text-gray-900
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:border-transparent transition
          ${error ? "border-red-400 focus:ring-red-400" : "border-gray-200"}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function validateForm(data) {
  const errors = {};

  if (!data.category) {
    errors.category = "Please select a category.";
  }

  if (!data.title.trim()) {
    errors.title = "Please enter a title for your feedback.";
  } else if (data.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters.";
  }

  if (!data.comment.trim()) {
    errors.comment = "Please describe your feedback.";
  } else if (data.comment.trim().length < 20) {
    errors.comment = "Comment must be at least 20 characters.";
  }

  if (!data.rating) {
    errors.rating = "Please select a rating.";
  }

  return errors;
}

export default function SubmitFeedbackPage() {
  const navigate = useNavigate();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    comment: "",
    rating: null,
    anonymous: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [systemResponse, setSystemResponse] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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

    setIsSubmitting(true);

    try {
      const user = await getUser();

      if (!user) {
        showToast("Your session has expired. Please log in again.", "error");
        navigate("/login", { replace: true });
        return;
      }

      const trimmedComment = formData.comment.trim();
      const trimmedTitle = formData.title.trim();

      let sentiment;
      let confidence;
      let score;
      let systemResponse;

      try {
        const { data, error } = await supabase.functions.invoke("feedback-analyze", {
          body: {
            category: formData.category,
            title: trimmedTitle,
            comment: trimmedComment,
          },
        });

        if (error) throw error;

        sentiment = data.sentiment;
        confidence = data.confidence;
        score = null;
        systemResponse = data.systemResponse;
      } catch (analyzeError) {
        console.error("AI analysis unavailable, using local fallback:", analyzeError);
        const fallback = processFeedback(formData.category, trimmedTitle, trimmedComment);
        sentiment = fallback.sentiment;
        confidence = fallback.confidence;
        score = fallback.score;
        systemResponse = fallback.systemResponse;
      }

      const { error } = await supabase.from("feedback").insert({
        student_id: user.id,
        category: formData.category,
        title: trimmedTitle,
        comment: trimmedComment,
        rating: formData.rating,
        is_anonymous: formData.anonymous,
        sentiment,
        sentiment_confidence: confidence,
        sentiment_score: score,
        system_response: systemResponse,
      });

      if (error) {
        throw error;
      }

      setSystemResponse(systemResponse);
      showToast("Feedback submitted successfully.", "success");
      setIsSuccess(true);
    } catch (error) {
      showToast(
        error?.message || "Failed to submit feedback. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      category: "",
      title: "",
      comment: "",
      rating: null,
      anonymous: false,
    });
    setErrors({});
    setSystemResponse("");
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <main className="flex-1 md:px-8 md:py-8 flex items-center justify-center">
        <div className="bg-white border p-8 border-gray-200 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 rounded-full bg-green-500" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Feedback Submitted
          </h2>

          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-left mb-6">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
              System Response
            </p>
            <p className="text-sm text-blue-900 leading-relaxed">
              {systemResponse}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg
              hover:bg-blue-700 transition-colors duration-200"
          >
            Submit Another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Submit Feedback</h2>
          <p className="text-sm text-gray-500 mt-1">
            Share your experience to help improve the institution.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <SelectField
              label="Category"
              id="category"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              options={CATEGORIES}
              error={errors.category}
            />

            <InputField
              label="Title"
              id="title"
              placeholder="Brief summary of your feedback"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              error={errors.title}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="comment" className="text-sm font-medium text-gray-700">
                Comment
              </label>
              <textarea
                id="comment"
                rows={5}
                placeholder="Describe your experience or issue in detail..."
                value={formData.comment}
                onChange={(e) => handleChange("comment", e.target.value)}
                className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white text-gray-900
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                  focus:border-transparent transition resize-none
                  ${errors.comment ? "border-red-400 focus:ring-red-400" : "border-gray-200"}`}
              />
              {errors.comment && (
                <p className="text-xs text-red-500">{errors.comment}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Rating</span>
              <div className="flex flex-wrap gap-2">
                {RATINGS.map(({ value, label }) => {
                  const isSelected = formData.rating === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleChange("rating", value)}
                      className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium border transition-colors duration-150
                        ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                        }`}
                    >
                      {value} — {label}
                    </button>
                  );
                })}
              </div>
              {errors.rating && (
                <p className="text-xs text-red-500">{errors.rating}</p>
              )}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                id="anonymous"
                type="checkbox"
                checked={formData.anonymous}
                onChange={(e) => handleChange("anonymous", e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <div>
                <label
                  htmlFor="anonymous"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Submit anonymously
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Your identity will not be visible to administrators.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg
                hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
