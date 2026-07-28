import type { PropsWithChildren } from "react";

export function StudioLayout({ children }: PropsWithChildren) {
  return (
    <div className="studio-layout">
      <header className="studio-header">Tech Studio</header>
      <main className="studio-main">{children}</main>
    </div>
  );
}
