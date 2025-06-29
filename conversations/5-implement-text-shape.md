# Conversation 5: Implement Text Shape

**Date:** December 2024
**Participants:** Chuang, Cursor

## Full Conversation

**Chuang:** Add a Text shape tool so users can type directly on the canvas with real-time editing.

**Cursor:** I'll implement a new Text shape tool for the ASCII Canvas project. Let me update the store and canvas functionality to support this.

[Added "text" to the Shape type union and to default shapes in `src/store/index.ts`.]

**Cursor:** Now I'll update the Canvas component to support text mode detection, click-to-position, keyboard input, and text layer management.

[Implemented text mode detection, click-to-position, keyboard input, text layer management, and visual cursor in `src/components/Canvas.tsx`.]

**Chuang:** Make sure text can overwrite any content and persists until switching tools.

**Cursor:** I've ensured that text overwrites any existing content and all text edits stay on one layer until switching tools. The cursor automatically moves to the next position after typing, and the blue cursor shows the typing position.

**Chuang:** Save the changes.

**Cursor:** The changes have been saved. The canvas now supports real-time typing, persistent text layers, and smart positioning.

## Code Changes Made
- Modified `src/store/index.ts` to add text shape type
- Updated `src/components/Canvas.tsx` with comprehensive text input handling, keyboard event management, cursor positioning, and visual feedback

## Files Modified
- `src/store/index.ts`
- `src/components/Canvas.tsx`

## Summary
Implemented a new Text shape tool for the ASCII Canvas project that allows users to type directly on the canvas with real-time editing capabilities.

## Key Changes Made

### 1. Store Updates (`src/store/index.ts`)
- Added "text" to the Shape type union: `"rectangle" | "circle" | "line" | "text"`
- Added text shape to default shapes: `{ id: "shape-4", type: "text" }`

### 2. Canvas Functionality (`src/components/Canvas.tsx`)
- **Text Mode Detection**: Canvas detects when text tool is selected
- **Click to Position**: Click anywhere on canvas to set text cursor position
- **Keyboard Input**: Full keyboard support for typing, backspace, and enter
- **Text Layer Management**: Creates dedicated text layer that persists until switching tools
- **Visual Cursor**: Blue cursor indicator shows current text position
- **Overwrite Behavior**: Always overwrites content in current cell when typing

### 3. Technical Implementation Details
- Added `textLayerId` state to track current text layer
- Added `cursorPos` state to track cursor position
- Implemented `handleTextInput()` for character processing
- Added keyboard event listeners for text mode
- Updated mouse handlers to support text positioning
- Added visual cursor rendering in canvas draw loop

## Key Features
- **Real-time Typing**: Type directly on the canvas
- **Overwrite Any Content**: Text can overwrite characters from other shapes
- **Persistent Text Layer**: All text edits stay on one layer until switching tools
- **Smart Positioning**: Automatically moves to next position after typing
- **Visual Feedback**: Blue cursor shows typing position

## Behavior
1. Select Text tool from toolbar
2. Click anywhere on canvas to position cursor
3. Type normally - characters appear and overwrite existing content
4. Cursor automatically moves to next position
5. Continue typing until switching to another tool
6. All text stays on single layer until tool change

## Resolution of Uncertainties
- **Text vs Other Shapes**: Decided to allow text to overwrite any existing content
- **Text Layer Management**: Single persistent text layer until tool switch
- **Line Breaking**: Simplified to always overwrite current cell, move to next position
- **Text Persistence**: Text remains editable until switching tools

The implementation provides a smooth, intuitive text editing experience that integrates well with the existing ASCII Canvas functionality. 