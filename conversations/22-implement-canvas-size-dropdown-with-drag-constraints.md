# Conversation 22: Implement Canvas Size Dropdown with Drag Constraints

**Date**: December 2024  
**Participants**: Chuang, Cursor

## Summary
Implemented support for 3 different canvas sizes (Small, Medium, Large) with a dropdown selector in the toolbar, and fixed drag constraint logic to properly handle canvas positioning and zoom levels.

## Key Changes Made

### 1. Canvas Size Configuration (`src/lib/constants.ts`)
- Added `CANVAS_SIZES` object with three configurations:
  - **Small**: 45×80 (default)
  - **Medium**: 60×120
  - **Large**: 80×160
- Maintained backward compatibility with existing constants

### 2. Canvas Size Store (`src/store/index.ts`)
- Created `useCanvasSizeStore` to manage current canvas size
- Added `resizeLayers` function to handle canvas size changes
- Updated copy functionality to use dynamic canvas dimensions
- Auto-resize layers when switching canvas sizes

### 3. Canvas Component Updates (`src/components/Canvas.tsx`)
- Replaced static `CANVAS_ROWS` and `CANVAS_COLS` with dynamic values
- Updated all canvas generation functions to use current dimensions
- Modified mouse coordinate calculations and grid drawing

### 4. Canvas Toolbar Enhancement (`src/components/CanvasToolbar.tsx`)
- Added shadcn/ui select component for canvas size selection
- Integrated canvas size state management
- Positioned dropdown between shape tools and zoom controls

### 5. Drag Constraint Fixes (`src/components/CanvasContainer.tsx`)
- **Major refactor** of drag constraint logic
- Fixed coordinate system understanding (canvas is centered, dragPosition is offset)
- Implemented proper edge-based constraints:
  - Left edge cannot pass middle line when dragging right
  - Right edge cannot pass middle line when dragging left
  - Top edge cannot pass middle line when dragging down
  - Bottom edge cannot pass middle line when dragging up
- Added padding-aware constraint calculations (24px total padding)
- Fixed zoom integration by using current `cellWidth` and `cellHeight`
- Added auto-reset of drag position when size/zoom changes

## Technical Challenges Solved

### Drag Constraint Logic
- **Problem**: Original constraints were too restrictive, preventing dragging
- **Root Cause**: Incorrect understanding of coordinate system and constraint calculations
- **Solution**: Implemented edge-based constraints with proper coordinate calculations

### Canvas Size vs Container Size
- **Problem**: Large canvases couldn't be dragged properly
- **Root Cause**: Constraint calculations didn't handle cases where canvas > container
- **Solution**: Added conditional logic for different canvas/container size relationships

### Zoom Integration
- **Problem**: Drag constraints didn't update with zoom changes
- **Root Cause**: Using static dimensions instead of current scaling values
- **Solution**: Integrated scaling store and added dependency tracking

## Features Implemented

✅ **Three Canvas Sizes**: Small (45×80), Medium (60×120), Large (80×160)  
✅ **Dropdown Selection**: Easy switching between sizes in toolbar  
✅ **Layer Preservation**: Automatic layer resizing when switching sizes  
✅ **Dynamic Constraints**: Drag limits adapt to current canvas size and zoom  
✅ **Padding Awareness**: Constraints account for 24px container padding  
✅ **Zoom Integration**: All constraints work correctly at any zoom level  
✅ **Auto-Reset**: Canvas centers itself when size or zoom changes  

## Code Quality Improvements
- Removed unused imports and fixed linter errors
- Added comprehensive comments explaining constraint logic
- Used proper TypeScript typing throughout
- Maintained consistent code style and patterns

## Files Modified
- `src/lib/constants.ts` - Added canvas size configurations
- `src/store/index.ts` - Added canvas size store and layer resizing
- `src/components/Canvas.tsx` - Updated to use dynamic canvas dimensions
- `src/components/CanvasToolbar.tsx` - Added size dropdown selector
- `src/components/CanvasContainer.tsx` - Complete drag constraint refactor

The implementation now provides a smooth, intuitive experience for users working with different canvas sizes while maintaining proper drag constraints and zoom functionality. 