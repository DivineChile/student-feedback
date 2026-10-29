import { useCallback, useEffect, useState } from "react";
import {
  UserPlus,
  Users,
  Building2,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { createClient } from "../../lib/supabaseClient";
import { showToast } from "../../components/ui/toast";

const supabase = createClient();

const OFFICES = [
  "Dean of Student Affairs",
  "Security Office",
  "Administration Office",
  "Head of Department",
];

export default function AdminSubAdminsPage() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    officeName: "",
  });

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, role, is_active, must_change_password, created_at",
        )
        .eq("role", "sub_admin")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      const { data: assignments, error: assignmentError } = await supabase
        .from("sub_admin_assignments")
        .select("user_id, office_name");

      if (assignmentError) throw assignmentError;

      const officeByUser = new Map(
        (assignments || []).map((item) => [item.user_id, item.office_name]),
      );

      setAccounts(
        (profiles || []).map((profile) => ({
          ...profile,
          officeName: officeByUser.get(profile.id) || "Unassigned",
        })),
      );
    } catch (error) {
      showToast(
        error?.message || "Unable to load sub-admin accounts.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setNewCredentials(null);
    setCopied(false);

    if (!form.officeName) {
      showToast("Select an office for this account.", "error");
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-sub-admin",
        {
          body: {
            fullName: form.fullName.trim(),
            email: form.email.trim().toLowerCase(),
            officeName: form.officeName,
          },
        },
      );

      if (error) {
        let message = error.message;

        try {
          if (error.context && typeof error.context.json === "function") {
            const details = await error.context.json();
            message = details.error || message;
          }
        } catch {
          // Keep the original error message.
        }

        throw new Error(message || "Unable to create the account.");
      }

      if (!data?.success || !data?.temporaryPassword) {
        throw new Error(data?.error || "The account was not created.");
      }

      setNewCredentials({
        fullName: data.user.fullName,
        email: data.user.email,
        officeName: data.user.officeName,
        temporaryPassword: data.temporaryPassword,
      });

      setForm({
        fullName: "",
        email: "",
        officeName: "",
      });

      showToast("Sub-admin account created successfully.", "success");
      await fetchAccounts();
    } catch (error) {
      showToast(
        error?.message || "Unable to create the sub-admin account.",
        "error",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopyPassword() {
    if (!newCredentials?.temporaryPassword) return;

    try {
      await navigator.clipboard.writeText(newCredentials.temporaryPassword);
      setCopied(true);
      showToast("Temporary password copied.", "success");
    } catch {
      showToast("Copy failed. Select and copy the password manually.", "error");
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted">
            <ShieldCheck size={16} />
            <span>System administration</span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink">
            Sub-admin accounts
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            Create administrative accounts, assign offices, and manage access to
            the institutional feedback system.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAccounts}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-pill border border-rule bg-paper-2 px-4 py-2.5 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-3 disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-rule bg-paper-2 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Total sub-admins</p>
            <Users size={19} className="text-ink-2" />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-ink">
            {accounts.length}
          </p>
          <p className="mt-1 text-xs text-muted">
            Accounts assigned to administrative offices
          </p>
        </div>

        <div className="rounded-card border border-rule bg-paper-2 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Available offices</p>
            <Building2 size={19} className="text-ink-2" />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-ink">
            {OFFICES.length}
          </p>
          <p className="mt-1 text-xs text-muted">
            Offices available for account assignment
          </p>
        </div>
      </div>

      <section className="rounded-card border border-rule bg-paper p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-input)] bg-paper-3">
            <UserPlus size={19} className="text-ink-2" />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Create sub-admin
            </h2>
            <p className="mt-1 text-sm text-muted">
              A temporary password will be generated automatically.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-ink"
              >
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                placeholder="Enter the staff member's name"
                className="w-full rounded-[var(--radius-input)] border border-rule-2 bg-paper px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/20"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-ink"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
                maxLength={254}
                autoComplete="email"
                placeholder="staff@institution.edu"
                className="w-full rounded-[var(--radius-input)] border border-rule-2 bg-paper px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/20"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="officeName"
                className="mb-2 block text-sm font-medium text-ink"
              >
                Assigned office
              </label>
              <select
                id="officeName"
                name="officeName"
                value={form.officeName}
                onChange={updateField}
                required
                className="w-full rounded-[var(--radius-input)] border border-rule-2 bg-paper px-3.5 py-3 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/20"
              >
                <option value="">Select an office</option>
                {OFFICES.map((office) => (
                  <option key={office} value={office}>
                    {office}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-5 text-muted">
                The account will only be authorized for categories assigned to
                this office.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted">
              The new account must change its temporary password before using
              administrative features.
            </p>

            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-accent px-5 py-3 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <UserPlus size={17} />
              )}
              {isCreating ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </section>

      {newCredentials && (
        <section className="rounded-card border border-positive bg-positive-bg p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-input)] bg-paper">
              <Check size={20} className="text-positive" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-ink">
                Account created successfully
              </h2>

              <p className="mt-1 text-sm leading-6 text-ink-2">
                Share these credentials with the intended staff member through a
                secure channel. This temporary password is shown here only for
                this creation session.
              </p>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Name</dt>
                  <dd className="mt-1 break-words font-medium text-ink">
                    {newCredentials.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="mt-1 break-words font-medium text-ink">
                    {newCredentials.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Office</dt>
                  <dd className="mt-1 font-medium text-ink">
                    {newCredentials.officeName}
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                <label
                  htmlFor="temporaryPassword"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Temporary password
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="temporaryPassword"
                    type="text"
                    readOnly
                    value={newCredentials.temporaryPassword}
                    className="min-w-0 flex-1 rounded-[var(--radius-input)] border border-rule-2 bg-paper px-3.5 py-3 font-outlier text-sm text-ink outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-pill border border-rule-2 bg-paper px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper-3"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied" : "Copy password"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNewCredentials(null)}
                className="mt-5 text-sm font-medium text-ink-2 underline underline-offset-4 transition-colors hover:text-ink"
              >
                Dismiss credentials
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-card border border-rule bg-paper">
        <div className="flex flex-col gap-3 border-b border-rule px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Existing accounts
            </h2>
            <p className="mt-1 text-sm text-muted">
              Review assigned offices and account status.
            </p>
          </div>
          <span className="w-fit rounded-pill bg-paper-3 px-3 py-1.5 text-xs font-medium text-ink-2">
            {accounts.length} accounts
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-muted">
            <Loader2 size={19} className="animate-spin text-accent" />
            Loading sub-admin accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={28} className="mx-auto text-muted" />
            <p className="mt-3 font-medium text-ink">
              No sub-admin accounts found
            </p>
            <p className="mt-1 text-sm text-muted">
              Create the first account using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-paper-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Staff member</th>
                  <th className="px-6 py-3.5 font-medium">Office</th>
                  <th className="px-6 py-3.5 font-medium">Account status</th>
                  <th className="px-6 py-3.5 font-medium">Password setup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="transition-colors hover:bg-paper-2/70"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">
                        {account.full_name || "Unnamed staff member"}
                      </p>
                      <p className="mt-1 break-all text-xs text-muted">
                        {account.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-ink-2">
                      {account.officeName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium ${
                          account.is_active
                            ? "bg-positive-bg text-positive"
                            : "bg-negative-bg text-negative"
                        }`}
                      >
                        {account.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium ${
                          account.must_change_password
                            ? "bg-pending-bg text-ink-2"
                            : "bg-paper-3 text-ink-2"
                        }`}
                      >
                        {account.must_change_password
                          ? "Change required"
                          : "Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
