function Loading() {
  return (
    <main
      className="flex min-h-[60vh] items-center justify-center px-5 py-24"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700 dark:border-slate-700 dark:border-t-teal-400"
          aria-hidden="true"
        />
        <p className="text-sm font-bold tracking-wide text-slate-500 dark:text-slate-300">
          Loading...
        </p>
      </div>
    </main>
  );
}

export default Loading;
