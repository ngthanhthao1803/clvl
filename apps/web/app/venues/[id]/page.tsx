"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { VenueCard } from "@/components/cards/VenueCard";

export default function VenuePage() {
  const params = useParams<{ id: string }>();

  const venueQuery = useQuery({
    queryKey: ["venue", params.id],
    queryFn: async () => {
      const response = await api.get(`/venues/${params.id}`);
      return response.data.data.venue;
    },
  });

  if (!venueQuery.data) {
    return <div className="text-slate-500">Đang tải sân...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <VenueCard venue={venueQuery.data} />
    </div>
  );
}
