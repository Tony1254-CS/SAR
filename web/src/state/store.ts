import { create } from 'zustand';
import { ReachDetail, Manifest, Stage, QC, Bounds, ChangeFeatureCollection } from '../data/types';
import type { ReachBundle } from '../data/load';

interface CompareState {
  active: boolean;
  t0: string | null;
  t1: string | null;
}

interface LayersState {
  water: boolean;
  accretion: boolean;
  erosion: boolean;
  ambiguous: boolean;
  forecast: boolean;
  earthquakes: boolean;
  risk: boolean;
}

type PanelType = 'none' | 'evidence' | 'qc';

interface StoreState {
  analysisMode: boolean;
  analysisSplit: boolean;
  analysisModeType: 'FULL' | 'SINGLE' | null;
  analysisActiveTab: string | null;
  analysisStepIndex: number;
  analysisState: 'IDLE' | 'PROCESSING' | 'DONE';
  reachId: string | null;
  reach: ReachDetail | null;
  manifest: Manifest | null;
  stage: Stage | null;
  qc: QC | null;
  bounds: Bounds | null;
  erosion: ChangeFeatureCollection | null;
  accretion: ChangeFeatureCollection | null;

  selectedDate: string | null;
  compare: CompareState;
  selectedFeatureId: string | null;
  layers: LayersState;
  panel: PanelType;
  flyInDone: boolean;
  
  
  sensoryMode: boolean;
  cinematicMode: boolean;
  inspectMode: boolean;
  showCinematicDesc: boolean;
  
  // Actions
  setAnalysisMode: (mode: boolean) => void;
  setAnalysisSplit: (split: boolean) => void;
  setAnalysisModeType: (type: 'FULL' | 'SINGLE' | null) => void;
  setAnalysisActiveTab: (tab: string | null) => void;
  setAnalysisStepIndex: (index: number) => void;
  setAnalysisState: (state: 'IDLE' | 'PROCESSING' | 'DONE') => void;
  setReachId: (id: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setCompare: (compare: Partial<CompareState>) => void;
  setPanel: (panel: PanelType) => void;
  setSelectedFeatureId: (id: string | null) => void;
  setLayers: (update: Partial<LayersState>) => void;
  loadBundle: (reachId: string, bundle: ReachBundle) => void;
  clearBundle: () => void;
  setSensoryMode: (active: boolean) => void;
  setCinematicMode: (active: boolean) => void;
  setInspectMode: (active: boolean) => void;
  setCinematicDesc: (active: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (active: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useStore = create<StoreState>((set) => ({
  analysisMode: false,
  analysisSplit: false,
  analysisModeType: null,
  analysisActiveTab: null,
  analysisStepIndex: 0,
  analysisState: 'IDLE',
  reachId: null,
  reach: null,
  manifest: null,
  stage: null,
  qc: null,
  bounds: null,
  erosion: null,
  accretion: null,

  selectedDate: null,
  compare: { active: false, t0: null, t1: null },
  selectedFeatureId: null,
  layers: { water: false, accretion: true, erosion: true, ambiguous: true, forecast: false, earthquakes: false, risk: false },
  panel: 'none',
  flyInDone: false,
  sensoryMode: false,
  cinematicMode: false,
  inspectMode: false,
  showCinematicDesc: false,
  
  setAnalysisMode: (mode) => set({ analysisMode: mode }),
  setAnalysisSplit: (split) => set({ analysisSplit: split }),
  setAnalysisModeType: (type) => set({ analysisModeType: type }),
  setAnalysisActiveTab: (tab) => set({ analysisActiveTab: tab }),
  setAnalysisStepIndex: (index) => set({ analysisStepIndex: index }),
  setAnalysisState: (state) => set({ analysisState: state }),
  setReachId: (id) => set({ reachId: id }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setCompare: (compare) => set((state) => ({ compare: { ...state.compare, ...compare } })),
  setPanel: (panel) => set({ panel }),
  setSelectedFeatureId: (id) => set({ selectedFeatureId: id }),
  setLayers: (update) => set((state) => ({ layers: { ...state.layers, ...update } })),
  loadBundle: (reachId, bundle) =>
    set((state) => {
      const okDates = bundle.reach.dates.filter((d) => d.status === 'ok');
      const latest = okDates.length > 0 ? okDates[okDates.length - 1].date : null;
      return {
        reachId,
        reach: bundle.reach,
        manifest: bundle.manifest,
        stage: bundle.stage,
        qc: bundle.qc,
        bounds: bundle.bounds,
        erosion: bundle.erosion,
        accretion: bundle.accretion,
        selectedDate: state.selectedDate ?? latest,
      };
    }),
  clearBundle: () =>
    set({
      reach: null,
      manifest: null,
      stage: null,
      qc: null,
      bounds: null,
      erosion: null,
      accretion: null,
      selectedDate: null,
    }),
  setSensoryMode: (active) => set({ sensoryMode: active }),
  setCinematicMode: (active) => set({ cinematicMode: active }),
  setInspectMode: (active) => set({ inspectMode: active }),
  setCinematicDesc: (active) => set({ showCinematicDesc: active }),
  chatOpen: false,
  setChatOpen: (active) => set({ chatOpen: active }),
  theme: (localStorage.getItem('fluvisar_theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('fluvisar_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    return { theme: newTheme };
  }),
}));
