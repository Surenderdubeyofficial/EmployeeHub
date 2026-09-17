const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  min,
  max,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
        <span className="ml-1 text-red-500">
          *
        </span>
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        min={min}
        max={max}
        className={`w-full rounded-lg border px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        }`}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
