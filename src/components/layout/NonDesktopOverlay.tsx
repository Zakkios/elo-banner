export function NonDesktopOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm lg:hidden">
      <div className="mx-6 max-w-md rounded-xl border border-app-border bg-app-card p-6 text-center shadow-2xl">
        <h2 className="mb-2 text-xl font-semibold tracking-tightest">Ce site est disponible uniquement sur PC</h2>
        <p className="text-app-text-muted">
          Pour une meilleure expérience, veuillez accéder à cette application depuis un ordinateur.
        </p>
      </div>
    </div>
  )
}

