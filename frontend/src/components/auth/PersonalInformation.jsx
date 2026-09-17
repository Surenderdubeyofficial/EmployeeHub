import Input from "../ui/Input";

export default function PersonalInformation({
  formData,
  errors,
  updateField,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          01
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter your basic personal details.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="First Name"
          name="firstName"
          placeholder="Enter first name"
          value={formData.firstName}
          onChange={(event) =>
            updateField(
              "firstName",
              event.target.value
            )
          }
          error={errors.firstName}
        />

        <Input
          label="Last Name"
          name="lastName"
          placeholder="Enter last name"
          value={formData.lastName}
          onChange={(event) =>
            updateField(
              "lastName",
              event.target.value
            )
          }
          error={errors.lastName}
        />
      </div>
    </section>
  );
}
