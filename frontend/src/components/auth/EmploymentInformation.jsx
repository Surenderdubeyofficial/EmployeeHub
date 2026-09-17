import Input from "../ui/Input";

const departments = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "IT",
  "Other",
];

const employmentTypes = [
  "Full Time",
  "Part Time",
  "Intern",
  "Contract",
];

const roles = [
  { value: "employee", label: "Employee (Individual Contributor)" },
  { value: "manager", label: "Manager (Department / Team Lead)" },
  { value: "hr", label: "Human Resources (HR Specialist)" },
  { value: "ceo", label: "Executive (CEO / C-Suite)" },
];

export default function EmploymentInformation({
  formData,
  errors,
  updateField,
}) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          03
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Employment Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Provide your current employment details.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Department
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            value={formData.department}
            onChange={(event) =>
              updateField(
                "department",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              Select department
            </option>

            {departments.map((department) => (
              <option
                key={department}
                value={department}
              >
                {department}
              </option>
            ))}
          </select>

          {errors.department && (
            <p className="mt-2 text-sm text-red-600">
              {errors.department}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Employment Type
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            value={formData.employmentType}
            onChange={(event) =>
              updateField(
                "employmentType",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              Select employment type
            </option>

            {employmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {errors.employmentType && (
            <p className="mt-2 text-sm text-red-600">
              {errors.employmentType}
            </p>
          )}
        </div>

        <Input
          label="Joining Date"
          name="joiningDate"
          type="date"
          value={formData.joiningDate}
          max={today}
          onChange={(event) =>
            updateField(
              "joiningDate",
              event.target.value
            )
          }
          error={errors.joiningDate}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Role / Designation
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            value={formData.role || "employee"}
            onChange={(event) =>
              updateField(
                "role",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Experience"
          name="experience"
          type="number"
          min="0"
          max="50"
          placeholder="Years of experience"
          value={formData.experience}
          onChange={(event) =>
            updateField(
              "experience",
              event.target.value
            )
          }
          error={errors.experience}
        />
      </div>
    </section>
  );
}
