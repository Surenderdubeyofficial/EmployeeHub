import Link from "next/link";

const Terms = () => {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/register"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Registration
        </Link>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Terms & Conditions
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: September 2026
          </p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-gray-600">
            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                1. Account Registration
              </h2>
              <p className="mt-2">
                You must provide accurate and complete information when
                creating an EmployeeHub account. You are responsible for
                keeping your account credentials secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                2. Account Security
              </h2>
              <p className="mt-2">
                You are responsible for maintaining the confidentiality of
                your password and for activity performed through your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                3. Acceptable Use
              </h2>
              <p className="mt-2">
                EmployeeHub should only be used for legitimate workplace and
                employee-management activities. Users must not attempt to
                access accounts or information without authorization.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                4. Privacy
              </h2>
              <p className="mt-2">
                EmployeeHub processes account and workplace information to
                provide its services. Appropriate security measures will be
                applied to protect user information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                5. Changes to These Terms
              </h2>
              <p className="mt-2">
                These terms may be updated when necessary. Users will be
                expected to review significant changes before continuing to
                use the platform.
              </p>
            </section>
          </div>

          <div className="mt-10 border-t border-gray-100 pt-6">
            <Link
              href="/register"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Registration
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Terms;