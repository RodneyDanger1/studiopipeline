import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_BIBLE,
  DEFAULT_BRIEF,
  type Episode,
  type LedgerRow,
  type Shot,
} from "./model";
import { houseDraft } from "./planner";

export type TabId = "brief" | "board" | "preview" | "style" | "vault" | "setup";

type DeskState = {
  hydrated: boolean;
  tab: TabId;
  apiKey: string;
  budgetUsd: number;
  brief: string;
  bible: string;
  targetSeconds: number;
  episode: Episode;
  selectedShotId: string;
  ledger: LedgerRow[];
  styleNote: string;
  palette: { hex: string; weight: number }[];
  keyStatus: string;
  setHydrated: (v: boolean) => void;
  setTab: (tab: TabId) => void;
  setApiKey: (apiKey: string) => void;
  forgetKey: () => void;
  setBudgetUsd: (n: number) => void;
  setBrief: (brief: string) => void;
  setBible: (bible: string) => void;
  setTargetSeconds: (n: number) => void;
  setEpisode: (episode: Episode) => void;
  selectShot: (id: string) => void;
  addLedger: (row: LedgerRow) => void;
  setStyle: (palette: { hex: string; weight: number }[], note: string) => void;
  setKeyStatus: (keyStatus: string) => void;
  spent: () => number;
  shot: () => Shot | undefined;
};

const draft = houseDraft();

export const useDesk = create<DeskState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      tab: "brief",
      apiKey: "",
      budgetUsd: 2,
      brief: DEFAULT_BRIEF,
      bible: DEFAULT_BIBLE,
      targetSeconds: 30,
      episode: draft,
      selectedShotId: draft.shots[0]?.shot_id ?? "",
      ledger: [],
      styleNote: "",
      palette: [],
      keyStatus: "",
      setHydrated: (hydrated) => set({ hydrated }),
      setTab: (tab) => set({ tab }),
      setApiKey: (apiKey) => set({ apiKey }),
      forgetKey: () => set({ apiKey: "", keyStatus: "Key removed from this device." }),
      setBudgetUsd: (budgetUsd) => set({ budgetUsd }),
      setBrief: (brief) => set({ brief }),
      setBible: (bible) => set({ bible }),
      setTargetSeconds: (targetSeconds) => set({ targetSeconds }),
      setEpisode: (episode) =>
        set({
          episode,
          selectedShotId: episode.shots[0]?.shot_id ?? "",
        }),
      selectShot: (selectedShotId) => set({ selectedShotId, tab: "preview" }),
      addLedger: (row) => set({ ledger: [...get().ledger, row].slice(-40) }),
      setStyle: (palette, styleNote) => set({ palette, styleNote }),
      setKeyStatus: (keyStatus) => set({ keyStatus }),
      spent: () => get().ledger.reduce((n, row) => n + row.usd, 0),
      shot: () => get().episode.shots.find((s) => s.shot_id === get().selectedShotId),
    }),
    {
      name: "studio-pipeline-desk-v1",
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as {
          episode?: { source?: string };
          selectedShotId?: string;
        };
        if (version < 2 && state.episode?.source !== "deepseek") {
          const next = houseDraft();
          return {
            ...(persisted as object),
            episode: next,
            selectedShotId: next.shots[0]?.shot_id ?? "",
            palette: [],
            styleNote: "",
          };
        }
        return persisted as object;
      },
      partialize: (s) => ({
        apiKey: s.apiKey,
        budgetUsd: s.budgetUsd,
        brief: s.brief,
        bible: s.bible,
        targetSeconds: s.targetSeconds,
        episode: s.episode,
        selectedShotId: s.selectedShotId,
        ledger: s.ledger,
        styleNote: s.styleNote,
        palette: s.palette,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
