import { useEffect, useMemo, useState } from "react";
import { Users, GraduationCap, Building2, MessageSquareText, Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/toast";
import { formatDate } from "@/utils/formatDate";
import SummaryCard from "@/components/admin/SummaryCard";

const MATRIC_PATTERN =
  /^(20\d{2})\/(ND1|ND2|HND1|HND2)\/(COMP|PET|SLT|ISSET|BAM|ELECT)\/(\d{3})$/;

function parseMatric(matricNumber) {
  const match = matricNumber?.match(MATRIC_PATTERN);

  if (!match) {
    return { admissionYear: "—", level: "—", department: "Unspecified" };
  }

  const [, year, level, department] = match;
  return { admissionYear: year, level, department };
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

export default function AdminStudentsPage() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);

      try {
        const [{ data: profileRows, error: profileError }, { data: feedbackRows, error: feedbackError }] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("id, full_name, matric_number, email, created_at")
              .eq("role", "student")
              .order("full_name", { ascending: true }),
            supabase.from("feedback").select("student_id"),
          ]);

        if (profileError) throw profileError;
        if (feedbackError) throw feedbackError;

        const feedbackCounts = new Map();
        for (const row of feedbackRows || []) {
          feedbackCounts.set(row.student_id, (feedbackCounts.get(row.student_id) || 0) + 1);
        }

        const mapped = (profileRows || []).map((row) => {
          const { admissionYear, level, department } = parseMatric(row.matric_number);

          return {
            id: row.id,
            fullName: row.full_name || "Unnamed Student",
            matricNumber: row.matric_number || "—",
            email: row.email || "—",
            department,
            level,
            admissionYear,
            createdAt: row.created_at,
            feedbackCount: feedbackCounts.get(row.id) || 0,
          };
        });

        setStudents(mapped);
      } catch (error) {
        showToast(error?.message || "Failed to load student accounts.", "error");
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [supabase]);

  const departments = useMemo(() => {
    const unique = new Set(students.map((s) => s.department));
    return Array.from(unique).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        student.fullName.toLowerCase().includes(searchValue) ||
        student.matricNumber.toLowerCase().includes(searchValue) ||
        student.email.toLowerCase().includes(searchValue);

      const matchesDepartment =
        departmentFilter === "all" || student.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [students, search, departmentFilter]);

  const totalStudents = students.length;
  const totalDepartments = departments.length;
  const totalFeedback = students.reduce((sum, s) => sum + s.feedbackCount, 0);
  const activeStudents = students.filter((s) => s.feedbackCount > 0).length;

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-ink">Students</h2>
          <p className="text-sm text-muted mt-1">
            View registered student accounts and their feedback activity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Students"
            value={totalStudents}
            icon={<Users size={20} className="text-ink-2" />}
            iconBg="bg-paper-3"
          />
          <SummaryCard
            label="Departments"
            value={totalDepartments}
            icon={<Building2 size={20} className="text-ink-2" />}
            iconBg="bg-paper-3"
          />
          <SummaryCard
            label="Have Submitted Feedback"
            value={activeStudents}
            valueColor="text-positive"
            icon={<GraduationCap size={20} className="text-positive" />}
            iconBg="bg-positive-bg"
          />
          <SummaryCard
            label="Total Feedback Submitted"
            value={totalFeedback}
            valueColor="text-accent"
            icon={<MessageSquareText size={20} className="text-accent" />}
            iconBg="bg-paper-3"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search by name, matric number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-input border border-rule bg-paper
                text-ink placeholder-muted focus:outline-none focus:ring-2
                focus:ring-focus focus:border-transparent transition"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink-2
              focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
          >
            <option value="all">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>

        <section className="bg-paper border border-rule rounded-card">
          {isLoading ? (
            <div className="px-6 py-14 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted">
                <Loader2 size={16} className="animate-spin" />
                Loading student accounts...
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium text-ink-2">No students found</p>
              <p className="text-xs text-muted mt-1">
                Try adjusting your search or department filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop / tablet: spec-sheet table, scrolls horizontally within its own wrapper only */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-rule bg-paper-2">
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Student
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Matric Number
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Department
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Level
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Admission Year
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Feedback Submitted
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Joined
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-rule last:border-b-0">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-paper-3 text-ink-2 text-xs font-semibold flex items-center justify-center shrink-0">
                              {getInitials(student.fullName)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-ink">{student.fullName}</p>
                              <p className="text-xs text-muted">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm font-outlier text-ink-2">{student.matricNumber}</td>

                        <td className="px-6 py-4 text-sm text-ink-2">{student.department}</td>

                        <td className="px-6 py-4 text-sm font-outlier text-ink-2">{student.level}</td>

                        <td className="px-6 py-4 text-sm font-outlier text-ink-2">{student.admissionYear}</td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-outlier px-2.5 py-1 rounded-pill bg-paper-3 text-ink-2">
                            {student.feedbackCount}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-outlier text-muted">
                          {formatDate(student.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked key/value rows instead of a cramped table */}
              <div className="sm:hidden flex flex-col">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="px-6 py-4 border-b border-rule last:border-b-0 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-paper-3 text-ink-2 text-xs font-semibold flex items-center justify-center shrink-0">
                        {getInitials(student.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{student.fullName}</p>
                        <p className="text-xs text-muted truncate">{student.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <p className="text-muted uppercase tracking-wide text-[10px] mb-0.5">Matric</p>
                        <p className="font-outlier text-ink-2">{student.matricNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted uppercase tracking-wide text-[10px] mb-0.5">Department</p>
                        <p className="text-ink-2">{student.department}</p>
                      </div>
                      <div>
                        <p className="text-muted uppercase tracking-wide text-[10px] mb-0.5">Level</p>
                        <p className="font-outlier text-ink-2">{student.level}</p>
                      </div>
                      <div>
                        <p className="text-muted uppercase tracking-wide text-[10px] mb-0.5">Admission Year</p>
                        <p className="font-outlier text-ink-2">{student.admissionYear}</p>
                      </div>
                      <div>
                        <p className="text-muted uppercase tracking-wide text-[10px] mb-0.5">Feedback</p>
                        <span className="text-xs font-outlier px-2 py-0.5 rounded-pill bg-paper-3 text-ink-2">
                          {student.feedbackCount}
                        </span>
                      </div>
                      <div>
                        <p className="text-muted uppercase tracking-wide text-[10px] mb-0.5">Joined</p>
                        <p className="font-outlier text-ink-2">{formatDate(student.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
