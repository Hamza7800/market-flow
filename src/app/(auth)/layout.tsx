import { Suspense, type ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <div className="h-screen">{children}</div>
    </Suspense>
  );
};

export default AuthLayout;
