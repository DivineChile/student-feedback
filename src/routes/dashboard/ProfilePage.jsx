import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/toast";

function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  );
}

function ActiveBadge({ label }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700
      bg-green-50 border border-green-200 px-2.5 py-1 rounded-full"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <main className="flex-1 px-6 md:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-10 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Loading profile...
          </div>
        </div>
      </div>
    </main>
  );
}

function formatRole(role) {
  if (!role) return "Student";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function parseMatricNumber(matricNumber) {
  if (!matricNumber) {
    return {
      department: "—",
      level: "—",
      admissionYear: "—",
    };
  }

  const parts = matricNumber.split("/");

  if (parts.length !== 4) {
    return {
      department: "—",
      level: "—",
      admissionYear: "—",
    };
  }

  const [year, level, departmentCode] = parts;

  const departmentMap = {
    COMP: "Computer Science",
    PET: "Petroleum Marketing",
    SLT: "Safety Lab and Technology",
    ISSET: "Industrial Safety",
    BAM: "Business Administration",
    ELECT: "Electrical Electronics",
  };

  return {
    department: departmentMap[departmentCode] || departmentCode,
    level,
    admissionYear: year,
  };
}

export default function ProfilePage() {
  const supabase = createClient();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);

      try {
        const user = await getUser();

        if (!user) {
          showToast("Your session has expired. Please log in again.", "error");
          setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, matric_number, email, role, created_at")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        const parsedMatric = parseMatricNumber(data?.matric_number || null);

        const fullName = data?.full_name || "Student";
        const email = data?.email || user.email || "—";

        setProfile({
          fullName,
          matricNumber: data?.matric_number || "—",
          email,
          department: parsedMatric.department,
          level: parsedMatric.level,
          admissionYear: parsedMatric.admissionYear,
          role: formatRole(data?.role || "student"),
          accountCreated: formatDate(data?.created_at || null),
          initials: getInitials(fullName),
        });
      } catch (error) {
        showToast(
          error?.message || "Failed to load profile information.",
          "error"
        );
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!profile) {
    return (
      <main className="flex-1 px-6 md:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-10 text-center">
            <p className="text-sm font-medium text-gray-600">
              Unable to load profile information
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Please refresh the page or try again later.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 md:py-2">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            View your student account information.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xl font-bold">
                {profile.initials}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900">
                {profile.fullName}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{profile.email}</p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {profile.matricNumber}
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
                  {profile.department}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {profile.level}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <span
                className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100
                px-3 py-1.5 rounded-full"
              >
                {profile.role}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-5">
            Account Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <InfoItem label="Full Name" value={profile.fullName} />
            <InfoItem label="Matric Number" value={profile.matricNumber} />
            <InfoItem label="Email Address" value={profile.email} />
            <InfoItem label="Role" value={profile.role} />
            <InfoItem label="Department" value={profile.department} />
            <InfoItem label="Level" value={profile.level} />
            <InfoItem label="Admission Year" value={profile.admissionYear} />
            <InfoItem label="Account Created" value={profile.accountCreated} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-5">
            Account Status
          </h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Account Status
              </p>
              <ActiveBadge label="Active" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Feedback Access
              </p>
              <ActiveBadge label="Enabled" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Anonymous Submission
              </p>
              <ActiveBadge label="Available" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
          <p className="text-sm font-medium text-blue-800 mb-0.5">
            Profile editing is currently not available.
          </p>
          <p className="text-sm text-blue-600">
            If you need to update your account details, please contact the
            administrator.
          </p>
        </div>
      </div>
    </main>
  );
}
