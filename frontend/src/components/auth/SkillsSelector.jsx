"use client";

import { useEffect, useRef, useState } from "react";

const SKILLS = [
  "JavaScript",
  "React.js",
  "Next.js",
  "Node.js",
  "Express.js",
  "MongoDB",
  "SQL",
  "REST APIs",
  "C++",
  "DSA",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Git",
  "GitHub",
  "Python",
  "Java",
  "TypeScript",
  "AWS",
  "Docker",
];

export default function SkillsSelector({
  value = [],
  onChange,
  error,
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [customSkill, setCustomSkill] =
    useState("");

  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const filteredSkills = SKILLS.filter(
    (skill) => {
      const matchesSearch = skill
        .toLowerCase()
        .includes(
          search.toLowerCase().trim()
        );

      const notSelected =
        !value.includes(skill);

      return matchesSearch && notSelected;
    }
  );

  const addSkill = (skill) => {
    const cleanSkill = skill.trim();

    if (!cleanSkill) return;

    if (
      value.some(
        (item) =>
          item.toLowerCase() ===
          cleanSkill.toLowerCase()
      )
    ) {
      return;
    }

    onChange([...value, cleanSkill]);

    setSearch("");
    setOpen(false);
  };

  const removeSkill = (skill) => {
    onChange(
      value.filter(
        (item) => item !== skill
      )
    );
  };

  const addCustomSkill = () => {
    addSkill(customSkill);
    setCustomSkill("");
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          04
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Skills
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select your technical and professional
            skills.
          </p>
        </div>
      </div>

      <div ref={containerRef}>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Skills
          <span className="ml-1 text-red-500">
            *
          </span>
        </label>

        <div
          className={`min-h-[52px] rounded-lg border bg-white p-2 ${
            error
              ? "border-red-400"
              : "border-gray-300"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {value.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
              >
                {skill}

                <button
                  type="button"
                  onClick={() =>
                    removeSkill(skill)
                  }
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}

            <input
              id="skills"
              value={search}
              onFocus={() => setOpen(true)}
              onChange={(event) => {
                setSearch(event.target.value);
                setOpen(true);
              }}
              placeholder={
                value.length === 0
                  ? "Select Skills"
                  : "Add another skill"
              }
              className="min-w-[160px] flex-1 border-0 px-2 py-2 text-sm text-gray-900 outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {open && (
          <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="max-h-64 overflow-y-auto p-2">
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() =>
                      addSkill(skill)
                    }
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {skill}
                  </button>
                ))
              ) : (
                <p className="px-3 py-4 text-center text-sm text-gray-500">
                  No matching skills found.
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Add a Custom Skill
              </p>

              <div className="flex gap-2">
                <input
                  value={customSkill}
                  onChange={(event) =>
                    setCustomSkill(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      event.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder="Enter custom skill"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                />

                <button
                  type="button"
                  onClick={
                    addCustomSkill
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  + Add Skill
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-2 text-sm text-gray-500">
          Select multiple skills from the list or add
          your own custom skill.
        </p>
      </div>
    </section>
  );
}
