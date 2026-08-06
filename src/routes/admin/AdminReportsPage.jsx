import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createClient } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/toast";
import { CATEGORIES } from "@/utils/categories";
import { SENTIMENTS } from "@/utils/sentiments";
import { STATUSES } from "@/utils/status";
import { formatDate } from "@/utils/formatDate";
import SummaryCard from "@/components/admin/SummaryCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SentimentBadge from "@/components/admin/SentimentBadge";

function normalizeStudent(student) {
  if (!student) return null;
  return Array.isArray(student) ? student[0] || null : student;
}

function mapFeedbackRow(row) {
  const student = normalizeStudent(row.student);

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    comment: row.comment,
    rating: row.rating,
    status: row.status,
    sentiment: row.sentiment,
    systemResponse: row.system_response,
    isAnonymous: row.is_anonymous,
    createdAt: row.created_at,
    studentName: student?.full_name || null,
    studentEmail: student?.email || null,
  };
}

function toInputDate(date) {
  return date.toISOString().split("T")[0];
}

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function calculateAverageRating(items) {
  const rated = items.filter((item) => typeof item.rating === "number");
  if (!rated.length) return "0.0 / 5";

  const total = rated.reduce((sum, item) => sum + item.rating, 0);
  return `${(total / rated.length).toFixed(1)} / 5`;
}

export default function AdminReportsPage() {
  const supabase = createClient();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  const [startDate, setStartDate] = useState(
    toInputDate(new Date(new Date().setMonth(new Date().getMonth() - 1)))
  );
  const [endDate, setEndDate] = useState(toInputDate(new Date()));

  useEffect(() => {
    const fetchReportsData = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("feedback")
          .select(`
            id,
            title,
            category,
            comment,
            rating,
            status,
            sentiment,
            system_response,
            is_anonymous,
            created_at,
            student:profiles!feedback_student_id_fkey(full_name,email)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map(mapFeedbackRow);
        setItems(mapped);
      } catch (error) {
        showToast(
          error?.message || "Failed to load reports data.",
          "error"
        );
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsData();
  }, [supabase]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue) ||
        item.comment.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesSentiment =
        sentimentFilter === "all" ||
        (sentimentFilter === "unprocessed" && item.sentiment === null) ||
        item.sentiment === sentimentFilter;

      const createdAtDate = item.createdAt.split("T")[0];
      const matchesStartDate = !startDate || createdAtDate >= startDate;
      const matchesEndDate = !endDate || createdAtDate <= endDate;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesSentiment &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [
    items,
    search,
    categoryFilter,
    statusFilter,
    sentimentFilter,
    startDate,
    endDate,
  ]);

  const totalCount = filteredItems.length;
  const pendingCount = filteredItems.filter((item) => item.status === "pending").length;
  const resolvedCount = filteredItems.filter((item) => item.status === "resolved").length;
  const averageRating = calculateAverageRating(filteredItems);

  const handleExportCsv = () => {
    if (!filteredItems.length) {
      showToast("There is no filtered data to export.", "error");
      return;
    }

    const rows = [
      [
        "Title",
        "Category",
        "Comment",
        "Rating",
        "Status",
        "Sentiment",
        "System Response",
        "Submission Type",
        "Student Name",
        "Student Email",
        "Created At",
      ],
      ...filteredItems.map((item) => [
        item.title,
        item.category,
        item.comment,
        item.rating,
        item.status,
        item.sentiment || "unprocessed",
        item.systemResponse || "",
        item.isAnonymous ? "Anonymous" : "Identified",
        item.isAnonymous ? "Hidden" : item.studentName || "",
        item.isAnonymous ? "Hidden" : item.studentEmail || "",
        new Date(item.createdAt).toISOString(),
      ]),
    ];

    const timestamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`feedback-report-${timestamp}.csv`, rows);
    showToast("CSV report exported successfully.", "success");
  };

  const handleExportPdf = () => {
    if (!filteredItems.length) {
      showToast("There is no filtered data to export.", "error");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    const generatedAt = new Date().toLocaleString("en-GB");

    const activeFilters = [
      search && `Search: "${search}"`,
      categoryFilter !== "all" && `Category: ${categoryFilter}`,
      statusFilter !== "all" && `Status: ${statusFilter}`,
      sentimentFilter !== "all" && `Sentiment: ${sentimentFilter}`,
      (startDate || endDate) && `Date: ${startDate || "…"} to ${endDate || "…"}`,
    ].filter(Boolean);

    doc.setFontSize(16);
    doc.text("CampusVoice Feedback Report", 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated ${generatedAt}`, 14, 22);
    doc.text(
      activeFilters.length ? activeFilters.join("  |  ") : "No filters applied",
      14,
      27
    );

    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(
      `Filtered Feedback: ${totalCount}   Pending: ${pendingCount}   Resolved: ${resolvedCount}   Average Rating: ${averageRating}`,
      14,
      34
    );

    autoTable(doc, {
      startY: 40,
      head: [
        ["Title", "Category", "Status", "Sentiment", "Rating", "Submission", "Student", "Date", "Comment"],
      ],
      body: filteredItems.map((item) => [
        item.title,
        item.category,
        item.status,
        item.sentiment || "unprocessed",
        `${item.rating}/5`,
        item.isAnonymous ? "Anonymous" : "Identified",
        item.isAnonymous ? "Hidden" : item.studentName || item.studentEmail || "—",
        formatDate(item.createdAt),
        item.comment,
      ]),
      styles: { fontSize: 8, cellWidth: "wrap" },
      columnStyles: { 8: { cellWidth: 90 } },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`feedback-report-${timestamp}.pdf`);
    showToast("PDF report exported successfully.", "success");
  };

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-ink">Reports</h2>
          <p className="text-sm text-muted mt-1">
            Generate and export institutional feedback summaries.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard label="Filtered Feedback" value={totalCount} />
          <SummaryCard label="Pending" value={pendingCount} valueColor="text-pending" />
          <SummaryCard label="Resolved" value={resolvedCount} valueColor="text-positive" />
          <SummaryCard label="Average Rating" value={averageRating} valueColor="text-accent" />
        </div>

        <section className="bg-paper border border-rule rounded-card">
          <div className="px-6 py-4 border-b border-rule flex items-center gap-2">
            <Filter size={16} className="text-muted" />
            <h3 className="text-sm font-semibold text-ink">Report Filters</h3>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
              <div className="relative xl:col-span-2">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  placeholder="Search title, category, or comment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-input border border-rule bg-paper
                    text-ink placeholder-muted focus:outline-none focus:ring-2
                    focus:ring-focus focus:border-transparent transition"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink-2
                  focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink-2
                  focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
              >
                {STATUSES.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink-2
                  focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
              >
                {SENTIMENTS.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink-2
                    focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink-2
                    focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-paper border border-rule rounded-card">
          <div className="px-6 py-4 border-b border-rule flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-muted" />
              <h3 className="text-sm font-semibold text-ink">Report Preview</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 bg-accent text-accent-ink text-sm font-medium px-4 py-2 rounded-pill hover:opacity-90 transition-opacity"
              >
                <Download size={15} />
                Export CSV
              </button>

              <button
                onClick={handleExportPdf}
                className="inline-flex items-center gap-2 border border-ink text-ink bg-transparent text-sm font-medium px-4 py-2 rounded-pill hover:bg-paper-3 transition-colors"
              >
                <FileText size={15} />
                Export PDF
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="px-6 py-14 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted">
                <Loader2 size={16} className="animate-spin" />
                Loading report data...
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium text-ink-2">No report data found</p>
              <p className="text-xs text-muted mt-1">
                Try adjusting your filters to preview report entries.
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
                        Title
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Category
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Sentiment
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Rating
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Submission
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Student
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredItems.slice(0, 20).map((item) => (
                      <tr key={item.id} className="border-b border-rule last:border-b-0">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-ink">{item.title}</p>
                            <p className="text-xs text-muted mt-1 line-clamp-2">
                              {item.comment}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-ink-2">{item.category}</td>

                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-6 py-4">
                          <SentimentBadge sentiment={item.sentiment} />
                        </td>

                        <td className="px-6 py-4 text-sm font-outlier text-ink-2">{item.rating}/5</td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-pill ${
                              item.isAnonymous
                                ? "bg-paper-3 text-ink-2"
                                : "bg-paper-3 text-ink-2"
                            }`}
                          >
                            {item.isAnonymous ? "Anonymous" : "Identified"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-ink-2">
                          {item.isAnonymous
                            ? "Hidden"
                            : item.studentName || item.studentEmail || "—"}
                        </td>

                        <td className="px-6 py-4 text-sm font-outlier text-muted">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked key/value rows instead of a cramped table */}
              <div className="sm:hidden flex flex-col">
                {filteredItems.slice(0, 20).map((item) => (
                  <div key={item.id} className="px-6 py-4 border-b border-rule last:border-b-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                      <span className="text-xs font-outlier text-muted shrink-0">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2">{item.comment}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <StatusBadge status={item.status} />
                      <SentimentBadge sentiment={item.sentiment} />
                      <span className="text-xs font-outlier text-ink-2">{item.rating}/5</span>
                      <span className="text-xs px-2.5 py-1 rounded-pill bg-paper-3 text-ink-2">
                        {item.isAnonymous ? "Anonymous" : "Identified"}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {item.category} · {item.isAnonymous ? "Hidden" : item.studentName || item.studentEmail || "—"}
                    </p>
                  </div>
                ))}
              </div>

              {filteredItems.length > 20 && (
                <div className="px-6 py-3 border-t border-rule bg-paper-2">
                  <p className="text-xs text-muted">
                    Showing first 20 preview rows out of {filteredItems.length} filtered records.
                    The CSV and PDF exports include all filtered records.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
