import { Clock3, MapPin, Ruler, Star } from "lucide-react";

type VenueCardProps = {
  venue: {
    id?: string;
    _id?: string;
    name: string;
    address: string;
    district: string;
    city: string;
    courtCount: number;
    rating?: number;
    priceRange?: { min: number; max: number };
  };
};

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{venue.name}</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs text-slate-700 ring-1 ring-amber-100">
          <Star className="h-3.5 w-3.5 text-amber-300" />
          {venue.rating?.toFixed(1) ?? "0.0"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
          <MapPin className="h-4 w-4 text-emerald-700" /> {venue.district}
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
          <Ruler className="h-4 w-4 text-emerald-700" /> {venue.courtCount} sân
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
          <Clock3 className="h-4 w-4 text-emerald-700" /> Mở hàng ngày
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        Khoảng giá: {venue.priceRange?.min?.toLocaleString() ?? "0"} -{" "}
        {venue.priceRange?.max?.toLocaleString() ?? "0"} VNĐ
      </div>
    </article>
  );
}
