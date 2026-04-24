export default function SectionCard({ title, description, children, className = "" }) {
  return (
    <section
      className={`rounded-[24px] border border-white/10 bg-[#111827] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6 ${className}`}
    >
      {(title || description) && (
        <div className="mb-5">
          {title ? (
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
      )}

      {children}
    </section>
  );
}
