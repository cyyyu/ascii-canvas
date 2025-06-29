# Conversation 2: Add Clear All Layers Button

**Date**: Current session
**Participants**: Chuang, Cursor

## Full Conversation

**Chuang:** Add a button on top of the sidebar to perform clearing all layers. Add relative methods to the store also.

**Cursor:** I'll help you add a "Clear All Layers" button to the sidebar and implement the corresponding store method. Let me examine the current store structure and then make the necessary changes.

[Examined `src/store/index.ts` to review the LayersStore interface and implementation.]

**Cursor:** I've added a `clearAllLayers` method to the LayersStore interface and implemented it as `clearAllLayers: () => set({ layers: [] })`. Now I'll update the Sidebar component to include the new button.

[Updated `src/components/Sidebar.tsx` to add the "Clear All Layers" button at the top, styled it with a red background, added a disabled state when no layers exist, and positioned it above the "Layers" heading.]

**Chuang:** Save the history.

**Cursor:** The changes have been saved. The sidebar now includes a "Clear All Layers" button that clears all layers instantly, with proper visual feedback and disabling when no layers exist.

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