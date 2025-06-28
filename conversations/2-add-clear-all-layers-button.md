# Conversation 2: Add Clear All Layers Button

**Date**: Current session

## Participants
- **Chuang**: User
- **Cursor**: AI Assistant

## Summary
Added a "Clear All Layers" button to the sidebar and implemented the corresponding store method to clear all layers from the ASCII Canvas project.

## Conversation Flow

### Chuang's Request
> Add a button on top of the sidebar to perform clearing all layers. Add relative methods to the store also.

### Cursor's Implementation
1. **Examined the current store structure** (`src/store/index.ts`)
2. **Added `clearAllLayers` method** to the `LayersStore` interface and implementation
3. **Updated the Sidebar component** (`src/components/Sidebar.tsx`) to include the new button

### Chuang's Confirmation
> Save the history

## Code Changes Made

### Store Updates (`src/store/index.ts`)
- Added `clearAllLayers: () => void` to the `LayersStore` interface
- Implemented `clearAllLayers: () => set({ layers: [] })` method

### Sidebar Updates (`src/components/Sidebar.tsx`)
- Added "Clear All Layers" button at the top of the sidebar
- Styled with red background to indicate destructive action
- Added disabled state when no layers exist
- Positioned above the "Layers" heading for easy access

## Features Implemented
- **Visual Feedback**: Red button indicating destructive action
- **Smart Disabling**: Button disabled when no layers to clear
- **Consistent Styling**: Matches existing sidebar design patterns
- **Immediate Effect**: Clears all layers instantly when clicked

## Files Modified
- `src/store/index.ts` - Added clearAllLayers method
- `src/components/Sidebar.tsx` - Added Clear All Layers button

## Status
✅ **Completed** - All changes accepted by user 