// Canvas size configurations
export const CANVAS_SIZES = {
  small: {
    rows: 45,
    cols: 80,
    name: "Small (45×80)"
  },
  medium: {
    rows: 60,
    cols: 120,
    name: "Medium (60×120)"
  },
  large: {
    rows: 80,
    cols: 160,
    name: "Large (80×160)"
  }
} as const;

// Default canvas size (smallest)
export const CANVAS_ROWS = CANVAS_SIZES.small.rows;
export const CANVAS_COLS = CANVAS_SIZES.small.cols;

// Cell dimensions
export const CELL_WIDTH = 10; // Width of each cell in pixels
export const CELL_HEIGHT = 12; // Height of each cell in pixels
