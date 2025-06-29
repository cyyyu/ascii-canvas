# Conversation 3: Adjust Layers Rendering

**Date:** Current session
**Participants:** Chuang, Cursor

## Full Conversation

**Chuang:** The canvas is drawing all layers sequentially, so newer layers don't properly overwrite older ones. Each cell can contain multiple characters from different layers.

**Cursor:** I'll add a `mergeLayers()` function to combine all layers into a single canvas array, ensuring newer layers take precedence. I'll update the rendering logic in both `handleMouseMove` and `useEffect` to use merged layers, so each cell contains only one character.

[Added `mergeLayers()` function and updated rendering logic in `src/components/Canvas.tsx`]

**Chuang:** Save the changes.

**Cursor:** The changes have been saved. The canvas now renders with proper layer precedence and single-character cells.

## Code Changes Made
- Added `mergeLayers()` function to `src/components/Canvas.tsx`
- Updated rendering logic in `handleMouseMove` and `useEffect` to use merged layers

## Files Modified
- `src/components/Canvas.tsx` 