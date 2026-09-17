import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import PhoneInput from "../ui/PhoneInput";

export default function AccountContact({
  formData,
  errors,
  updateField,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          02
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Account & Contact
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Set up your login credentials and contact
            details.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(event) =>
            updateField(
              "email",
              event.target.value
            )
          }
          error={errors.email}
        />

        <PhoneInput
          value={formData.phone}
          country={formData.phoneCountry}
          onChange={(value) =>
            updateField("phone", value)
          }
          onCountryChange={(country) => {
            updateField(
              "phoneCountry",
              country
            );

            updateField("phone", "");
          }}
          label="Mobile Number"
          error={errors.phone}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            placeholder="Create a strong password"
            onChange={(event) =>
              updateField(
                "password",
                event.target.value
              )
            }
            error={errors.password}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Confirm your password"
            onChange={(event) =>
              updateField(
                "confirmPassword",
                event.target.value
              )
            }
            error={errors.confirmPassword}
          />
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-700">
            Password requirements
          </p>

          <ul className="mt-2 space-y-1 text-sm text-gray-500">
            <li>• At least 8 characters</li>
            <li>• At least one letter</li>
            <li>• At least one number</li>
            <li>
              • Avoid easily guessable information
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
