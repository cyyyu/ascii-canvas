# Conversation 3: Adjust Layers Rendering

**Date:** Current session  
**Participants:** Chuang, Cursor

## Summary
Fixed layer rendering logic to ensure newer layers properly overwrite older ones, with each canvas cell containing only one character.

## Problem
The canvas was drawing all layers sequentially, which meant newer layers didn't properly overwrite older ones. Each cell could potentially contain multiple characters from different layers.

## Solution
- Added `mergeLayers()` function that combines all layers into a single canvas array
- Updated rendering logic in both `handleMouseMove` and `useEffect` to use merged layers
- Ensured newer layers take precedence over older ones

## Code Changes Made

### Added mergeLayers() Function
```typescript
const mergeLayers = () => {
  const mergedCanvas = Array.from({ length: CANVAS_ROWS }, () =>
    Array.from({ length: CANVAS_COLS }, () => " ")
  );

  // Process layers in order (older first, newer last)
  // Newer layers will overwrite older ones
  layers.forEach((layer) => {
    layer.canvas.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== " ") {
          mergedCanvas[rowIndex][colIndex] = cell;
        }
      });
    });
  });

  return mergedCanvas;
};
```

### Updated Rendering Logic
- Modified `handleMouseMove` to use `mergeLayers()` instead of drawing each layer separately
- Modified `useEffect` to use `mergeLayers()` for main canvas rendering
- Both preview and final rendering now use consistent merged layer logic

## Benefits
- **Proper layering**: Newer shapes correctly overwrite older ones
- **Single character per cell**: Each canvas position contains only one character
- **Consistent rendering**: Preview and final rendering use the same logic
- **Performance**: More efficient than drawing each layer separately

## Files Modified
- `src/components/Canvas.tsx`: Added mergeLayers function and updated rendering logic 