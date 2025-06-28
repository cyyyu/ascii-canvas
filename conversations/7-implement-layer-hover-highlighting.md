# Conversation 7: Implement Layer Hover Highlighting

**Date**: December 2024

## Summary
Implemented layer hover highlighting functionality in the Sidebar that shows the corresponding shape in red when hovering over a layer, similar to the drawing preview behavior.

## Participants
- **Chuang**: User requesting the feature
- **Cursor**: AI assistant implementing the functionality

## Key Changes Made

### 1. Store Updates (`src/store/index.ts`)
- Added `hoveredLayerId: string | null` state to track which layer is being hovered
- Added `setHoveredLayer: (id: string | null) => void` function to update the hovered layer

### 2. Canvas Updates (`src/components/Canvas.tsx`)
- Added `hoveredLayerId` from the store
- Created `getHoveredLayerCanvas()` function to get the canvas data of the hovered layer
- Updated the rendering logic to draw the hovered layer in red after drawing the merged layers
- Added `hoveredLayerId` to the useEffect dependency array

### 3. Sidebar Updates (`src/components/Sidebar.tsx`)
- Added `setHoveredLayer` from the store to the `SortableLayerItem` component
- Added `onMouseEnter` and `onMouseLeave` handlers to trigger layer highlighting

## Technical Implementation

The feature works by:
1. **Hover Detection**: When hovering over a layer in the sidebar, `setHoveredLayer(layer.id)` is called
2. **Canvas Highlighting**: The Canvas component detects the hovered layer and draws it in red (`#ff0000`) on top of existing layers
3. **Visual Feedback**: The hovered layer appears in red, making it easy to identify which shape corresponds to which layer
4. **Clean Exit**: When stopping hover, `setHoveredLayer(null)` removes the red highlighting

## Code Changes
- Store: Added hover state management
- Canvas: Added hovered layer rendering in red
- Sidebar: Added mouse event handlers for hover detection

## Result
Users can now hover over layers in the sidebar to see the corresponding shapes highlighted in red on the canvas, providing better visual feedback and layer identification. 