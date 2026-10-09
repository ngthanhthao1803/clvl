"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ExploreRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams ? searchParams.toString() : "";
    router.replace(q ? `/?${q}` : "/");
  }, [router, searchParams]);

  return (
    <div className="flex h-[40vh] items-center justify-center">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Đang chuyển hướng về Trang chủ CLVL...</span>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreRedirect />
    </Suspense>
  );
}
