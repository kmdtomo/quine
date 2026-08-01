import type { CanonicalTechnology, TechnologyCategory } from "@data/tech-stack";

export type FilterMode = "all" | "selected";

export type SelectedTechnology = {
  categoryName: string;
  description: string;
  name: string;
  order: number;
  technologyKey: string;
  years?: number;
};

export type SelectedTechnologyGroup = {
  category: TechnologyCategory;
  items: SelectedTechnology[];
};

export type ToastState =
  | {
      mode: "hidden";
    }
  | {
      message: string;
      mode: "prompt";
      tone: "info" | "success";
    }
  | {
      message: string;
      mode: "undo";
      removed: SelectedTechnology;
    }
  | {
      mode: "panel";
    };

export type TechnologyGridItem = CanonicalTechnology;
