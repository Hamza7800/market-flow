"use client";

import { LoadingState } from "@/components/loading-state";
import { authClient } from "@/server/better-auth/client";
import { useRouter } from "nextjs-toploader/app";
import { Suspense, useEffect, type ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (data?.user?.id && !isPending) {
      router.replace("/");
    }
  }, [data, isPending, router]);

  if (isPending) {
    return (
      <div className="h-dvh">
        <LoadingState />
      </div>
    );
  }

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
