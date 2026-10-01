"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SavedRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/explore?chip=saved");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <span>Đang mở danh sách kèo đã lưu...</span>
      </div>
    </div>
  );
}
