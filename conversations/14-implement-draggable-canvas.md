# Conversation 14: Implement Draggable Canvas

**Chuang:** Center the canvas.

**Cursor:** I'll help you center the canvas by adding flex centering classes to the canvas container div.

**Chuang:** Still, on small screens, the canvas is causing the whole page horizontally scrollable. You might need to check the @page.tsx component too.

**Cursor:** I can see the issue! The canvas is 80 columns × 10px = 800px wide, which can definitely exceed the viewport width on small screens. I'll fix this by making the canvas responsive and ensuring the page doesn't scroll horizontally.

**Chuang:** Looks like it's now cropped and not scrollable horizontally at all. Let's try it other way. I want to make it never scrollable. If the container isn't able to contain it, it is cropped. However, I want to make it draggable.
* First let's add another button to the @CanvasToolbar.tsx , which is named 'drag' with a hand icon.
* When the 'drag' button is toggled on, the selected shape (if there is any) should be toggled off. The canvas becomes draggable.
* When being draggable, the canvas is not freely to go anywhere, but there is always half of it visible on the screen.
* I think you need to create a store in @/store
* Use d3 for the dragging functionality.

**Cursor:** I'll help you implement the draggable canvas functionality. Here's what I implemented:

## Changes Made:

### 1. Added Drag Store (`src/store/index.ts`)
- Created `useDragStore` with state for drag mode and position
- Added functions to control dragging state and position

### 2. Updated CanvasToolbar (`src/components/CanvasToolbar.tsx`)
- Added drag button with hand icon from lucide-react
- Integrated with drag store to toggle drag mode
- Added logic to turn off selected shape when enabling drag mode
- Added logic to turn off drag mode when selecting a shape

### 3. Enhanced Canvas Component (`src/components/Canvas.tsx`)
- Added d3 import and drag store integration
- Updated mouse event handlers to ignore drawing when in drag mode
- Added d3 drag functionality with constraints to keep canvas partially visible
- Wrapped canvas in container div with transform for positioning
- Added cursor changes based on drag mode

### 4. Updated CanvasContainer (`src/components/CanvasContainer.tsx`)
- Removed overflow and centering to allow canvas to be draggable
- Added overflow-hidden to prevent page scrolling

### 5. Updated Page Component (`src/app/page.tsx`)
- Added overflow-hidden to prevent horizontal scrolling

## Key Features:
- **Drag Button**: Toggle drag mode with hand icon
- **Mutual Exclusion**: Drag mode and shape selection are mutually exclusive
- **Constrained Dragging**: Canvas can't be dragged completely off-screen (always at least half visible)
- **Smooth Interaction**: Uses d3 for smooth drag behavior
- **Visual Feedback**: Cursor changes to grab when in drag mode
- **No Scrolling**: Canvas is cropped when it doesn't fit, never scrollable

## Dependencies Added:
- `d3` and `@types/d3` for drag functionality

The implementation ensures the canvas is never scrollable but can be dragged around within constraints, providing a better user experience for viewing large canvases on smaller screens.

**Chuang:** There is an issue. The canvas seems to be limited in its original position.

**Cursor:** I can see the issue! The canvas is being constrained to stay near its original centered position. Let me check the current drag constraints and fix them. The problem is likely in the constraint calculation in the d3 drag handler.

**Chuang:** Not working still.

**Cursor:** I can see the issue now! The drag events are extremely small (mostly 0, 1, -1) which means the drag isn't working properly. The problem is likely that the drag is being applied to the wrong element or there's a conflict with the mouse event handlers.

**Chuang:** Still not working. You can refactor it if needed.

**Cursor:** You're right, let me completely refactor this. The issue seems to be with the d3 drag setup. Let me implement a simpler, more direct approach using React's built-in mouse events instead of d3.

## Complete Refactor Summary:

### ✅ Removed d3 Dependency
- Removed `import * as d3 from "d3"`
- Removed all d3 drag setup code
- Removed the complex useEffect for d3 drag

### ✅ Implemented React-Based Dragging
- Added local state for drag tracking: `isDraggingCanvas` and `dragStart`
- Modified mouse event handlers to handle both drawing and dragging
- Used simple mouse position calculations instead of d3 events

### ✅ How the New Drag Works:
1. **Mouse Down**: When in drag mode, captures the initial mouse position relative to current canvas position
2. **Mouse Move**: Calculates new position based on mouse movement and applies constraints
3. **Mouse Up/Leave**: Stops dragging

### ✅ Constraints Applied:
- **X-axis**: Canvas can move left until right edge touches middle, right until left edge touches middle
- **Y-axis**: Same logic applied vertically
- **Smooth movement**: Direct mouse position tracking for responsive dragging

### ✅ Benefits of This Approach:
- **No external dependencies** (removed d3)
- **Simpler and more reliable** - uses React's native event system
- **Better performance** - no complex d3 setup/cleanup
- **Easier to debug** - all logic is in React components

**Chuang:** Perfect, it's working now. Now remove unnecessary logs.

**Cursor:** Great! I'm glad it's working now. Let me remove all the unnecessary console logs to clean up the code.

## Summary of Changes:
- ✅ Removed canvas dimensions logging
- ✅ Removed mouse position logging
- ✅ Removed drag position logging
- ✅ Removed drawing shape logging
- ✅ Removed mouse leave logging

The draggable canvas functionality is now complete and clean! The canvas can be dragged smoothly within the constraints (keeping at least half visible) and all the drawing functionality still works perfectly when not in drag mode.

## Final Implementation Features:
- **Drag Button**: Toggle drag mode with hand icon in toolbar
- **Mutual Exclusion**: Drag mode and shape selection are mutually exclusive
- **Constrained Dragging**: Canvas edges are limited to not cross the middle line of the container
- **Smooth Interaction**: Uses React's native mouse events for responsive dragging
- **Visual Feedback**: Cursor changes to grab when in drag mode
- **No Scrolling**: Canvas is cropped when it doesn't fit, never scrollable
- **Clean Code**: No unnecessary console logs or external dependencies

**Chuang:** Still, on small screens, the canvas is causing the whole page horizontally scrollable. You might need to check the @page.tsx component too.

**Cursor:** I can see the issue! The canvas is 80 columns × 10px = 800px wide, which can definitely exceed the viewport width on small screens. I'll fix this by making the canvas responsive and ensuring the page doesn't scroll horizontally.

**Chuang:** Looks like it's now cropped and not scrollable horizontally at all. Let's try it other way. I want to make it never scrollable. If the container isn't able to contain it, it is cropped. However, I want to make it draggable.
* First let's add another button to the @CanvasToolbar.tsx , which is named 'drag' with a hand icon.
* When the 'drag' button is toggled on, the selected shape (if there is any) should be toggled off. The canvas becomes draggable.
* When being draggable, the canvas is not freely to go anywhere, but there is always half of it visible on the screen.
* I think you need to create a store in @/store
* Use d3 for the dragging functionality.

**Cursor:** I'll help you implement the draggable canvas functionality. Here's what I implemented:

## Changes Made:

### 1. Added Drag Store (`src/store/index.ts`)
- Created `useDragStore` with state for drag mode and position
- Added functions to control dragging state and position

### 2. Updated CanvasToolbar (`src/components/CanvasToolbar.tsx`)
- Added drag button with hand icon from lucide-react
- Integrated with drag store to toggle drag mode
- Added logic to turn off selected shape when enabling drag mode
- Added logic to turn off drag mode when selecting a shape

### 3. Enhanced Canvas Component (`src/components/Canvas.tsx`)
- Added d3 import and drag store integration
- Updated mouse event handlers to ignore drawing when in drag mode
- Added d3 drag functionality with constraints to keep canvas partially visible
- Wrapped canvas in container div with transform for positioning
- Added cursor changes based on drag mode

### 4. Updated CanvasContainer (`src/components/CanvasContainer.tsx`)
- Removed overflow and centering to allow canvas to be draggable
- Added overflow-hidden to prevent page scrolling

### 5. Updated Page Component (`src/app/page.tsx`)
- Added overflow-hidden to prevent horizontal scrolling

## Key Features:
- **Drag Button**: Toggle drag mode with hand icon
- **Mutual Exclusion**: Drag mode and shape selection are mutually exclusive
- **Constrained Dragging**: Canvas can't be dragged completely off-screen (always at least half visible)
- **Smooth Interaction**: Uses d3 for smooth drag behavior
- **Visual Feedback**: Cursor changes to grab when in drag mode
- **No Scrolling**: Canvas is cropped when it doesn't fit, never scrollable

## Dependencies Added:
- `d3` and `@types/d3` for drag functionality

The implementation ensures the canvas is never scrollable but can be dragged around within constraints, providing a better user experience for viewing large canvases on smaller screens. 