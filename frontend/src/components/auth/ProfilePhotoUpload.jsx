"use client";

const MAX_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ProfilePhotoUpload({
  file,
  error,
  onChange,
}) {
  const handleChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) return;

    if (
      !ALLOWED_TYPES.includes(
        selectedFile.type
      )
    ) {
      alert(
        "Profile photo must be JPG, PNG, or WEBP."
      );
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      alert(
        "Profile photo must be 2 MB or smaller."
      );
      event.target.value = "";
      return;
    }

    onChange(selectedFile);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          06
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Profile Photo
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Upload a professional profile photo.
          </p>
        </div>
      </div>

      <input
        id="profilePhoto"
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleChange}
        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {file && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {file.name}
            </p>

            <p className="text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(
                2
              )}{" "}
              MB
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
    </section>
  );
}
