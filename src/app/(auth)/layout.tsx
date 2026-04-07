import { Suspense, type ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <div className="relative min-h-screen w-full overflow-hidden bg-white">
        {/* Indigo Corner Deep Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
        radial-gradient(circle 600px at 0% 200px, #c7d2fe, transparent),
        radial-gradient(circle 600px at 100% 200px, #c7d2fe, transparent)
      `,
          }}
        />
        {/* Your Content Here */}
        <div className="h-screen">{children}</div>
      </div>
    </Suspense>
  );
};

export default AuthLayout;
