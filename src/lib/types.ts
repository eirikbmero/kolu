export type Initiative = {
  id: string;
  title: string;
  description: string | null;
  author_name: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
};

export type NewInitiative = {
  title: string;
  description?: string | null;
  author_name: string;
  position_x?: number;
  position_y?: number;
};

export type Quadrant = "quick-win" | "big-bet" | "fill-in" | "time-sink";
