import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedSessionItem = {
  id: string;
  title: string;
  venueName: string;
  courtNumber?: string | number;
  district?: string;
  city?: string;
  datetime: string;
  matchType: string;
  price: number;
  currentPlayersCount?: number;
  currentPlayers?: number;
  maxPlayers: number;
  skillRequirement?: string | string[];
  skillRequirements?: string[];
  depositRequired?: boolean;
  depositAmount?: number;
  coverImage?: string;
  imageUrl?: string;
  host?: any;
  savedAt: number;
  rawSession?: any;
};

type SavedSessionsState = {
  savedIds: string[];
  savedItems: Record<string, SavedSessionItem>;
  isSaved: (id?: string) => boolean;
  toggleSave: (session: any) => boolean;
  removeSave: (id: string) => void;
  clearAll: () => void;
  getSavedList: () => any[];
};

export const useSavedSessionsStore = create<SavedSessionsState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      savedItems: {},

      isSaved: (id?: string) => {
        if (!id) return false;
        return get().savedIds.includes(String(id));
      },

      toggleSave: (session: any) => {
        const id = String(session.id || session._id || "");
        if (!id) return false;

        const currentIds = get().savedIds;
        const exists = currentIds.includes(id);

        if (exists) {
          // Remove
          const newIds = currentIds.filter((item) => item !== id);
          const newItems = { ...get().savedItems };
          delete newItems[id];
          set({ savedIds: newIds, savedItems: newItems });
          return false;
        } else {
          // Add
          const summary: SavedSessionItem = {
            id,
            title: session.title || "Kèo cầu lông",
            venueName: session.venueName || session.venue?.name || "Sân cầu lông",
            courtNumber: session.courtNumber,
            district: session.district || session.venue?.district,
            city: session.city || session.venue?.city,
            datetime: session.datetime,
            matchType: session.matchType || "Giao lưu",
            price: Number(session.price || 0),
            currentPlayersCount:
              session.currentPlayersCount ??
              session.currentPlayers ??
              session.players?.length ??
              0,
            maxPlayers: Number(session.maxPlayers || 8),
            skillRequirement: session.skillRequirement ?? session.skillRequirements,
            skillRequirements: session.skillRequirements,
            depositRequired: Boolean(session.depositRequired),
            depositAmount: session.depositAmount,
            coverImage: session.coverImage || session.imageUrl,
            imageUrl: session.imageUrl,
            host: session.host,
            savedAt: Date.now(),
            rawSession: session,
          };

          set({
            savedIds: [id, ...currentIds],
            savedItems: {
              ...get().savedItems,
              [id]: summary,
            },
          });
          return true;
        }
      },

      removeSave: (id: string) => {
        const strId = String(id);
        const newIds = get().savedIds.filter((item) => item !== strId);
        const newItems = { ...get().savedItems };
        delete newItems[strId];
        set({ savedIds: newIds, savedItems: newItems });
      },

      clearAll: () => {
        set({ savedIds: [], savedItems: {} });
      },

      getSavedList: () => {
        const { savedIds, savedItems } = get();
        return savedIds
          .map((id) => savedItems[id]?.rawSession || savedItems[id])
          .filter(Boolean);
      },
    }),
    {
      name: "clvl-saved-sessions",
    },
  ),
);
