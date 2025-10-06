import type { PropsWithChildren, ReactNode } from "react";

export type PageLayoutProps = PropsWithChildren<{
  header: ReactNode;
  footer?: ReactNode;
}>;

export function PageLayout({ header, children, footer }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-12 px-6 pb-8 sm:px-8 lg:gap-14 lg:pb-12">
      <header className="w-full max-w-[960px]">{header}</header>
      <main className="flex w-full max-w-[960px] flex-1 flex-col" role="main">
        {children}
      </main>
      {footer ? (
        <footer className="w-full max-w-[960px] border-t border-white/10 pt-8 text-center text-sm text-slate-200/70 lg:pt-10">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
