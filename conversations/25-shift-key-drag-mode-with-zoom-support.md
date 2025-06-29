# Conversation 25: Shift Key Drag Mode with Zoom Support

**Date**: December 2024  
**Participants**: Chuang, Cursor

## Full Conversation

**Chuang**: Support pressing 'shift' enter the dragging mode, and releasing for exiting. Add a tooltip to the 'drag' button on the toolbar to inform about this. Use the tooltip component from shadcn.

**Cursor**: I'll help you implement shift key support for entering/exiting drag mode and add a tooltip to the drag button. Let me first examine the current store structure to understand how drag mode is managed.

[Code implementation begins - examining store, updating drag store, CanvasContainer, CanvasToolbar, and Canvas components]

**Chuang**: Perfect. Can we keep zooming working when 'shift' is pressed?

**Cursor**: Yes! I need to update the zoom functionality to work even when shift is held down. Currently, the shift key is being used for drag mode, but we can modify the logic to allow zooming with the mouse wheel while shift is held down.

[Updated CanvasContainer to handle wheel events properly when shift is pressed]

**Chuang**: Zooming isn't working with 'shift' pressed after the change.

**Cursor**: You're right! The issue is that when shift is pressed, the canvas enters drag mode, which prevents the wheel events from being processed properly. Let me fix this by updating the wheel event handler to work regardless of the drag state.

[Multiple attempts to fix zooming - removed conflicting event listeners, added document-level handlers]

**Chuang**: Two issues:
* The conversation history wasn't following the @.cursorrules 
* The zooming issue wasn't resolved yet.

**Cursor**: You're absolutely right on both points! I should have asked for confirmation before creating the conversation file, as specified in the .cursorrules. Let me address these issues.

[Fixed conversation history format and continued working on zooming issue]

**Chuang**: I see these error logs in the console when mouse wheeling:
```
CanvasContainer.tsx:81 Unable to preventDefault inside passive event listener invocation.
```
The zooming issue is still there when holding 'shift'. I think it's related to the `delta` calculation where we might want to use `e.deltaX` when holding 'shift'

**Cursor**: You're absolutely right! The error shows that we can't call `preventDefault()` in a passive event listener, and you've identified the real issue - when holding shift, the wheel event's `deltaY` might be different or we should be using `deltaX` instead.

[Fixed passive event listener errors and updated delta calculation to use deltaX when shift is pressed]

**Chuang**: It works well now. Remove the logs and save this to the history file.

**Cursor**: Great! Let me remove the debug logs and then create the conversation history file.

[Removed debug logs and created properly formatted conversation file]

## Code Changes Made

### 1. Enhanced Drag Store (`src/store/index.ts`)
- Added `isShiftPressed` state to track shift key status
- Added `wasDraggingBeforeShift` state to remember previous drag state
- Added `setShiftPressed` and `setWasDraggingBeforeShift` functions
- Updated DragStore interface to include new state management

### 2. Updated CanvasContainer (`src/components/CanvasContainer.tsx`)
- Added keyboard event listeners for shift key press/release
- When shift is pressed: enters drag mode and remembers previous state
- When shift is released: restores previous drag state
- Fixed zooming functionality to work when shift is pressed by:
  - Using `deltaX` when shift is pressed, `deltaY` otherwise
  - Adding document-level wheel event listener with `passive: false`
  - Removing `preventDefault()` from React wheel handlers to avoid passive event listener errors
  - Multiple layers of wheel event handling for reliability

### 3. Enhanced CanvasToolbar (`src/components/CanvasToolbar.tsx`)
- Added tooltip component from shadcn/ui
- Added tooltip to drag button: "Hold Shift to enter drag mode"
- Disabled drag button when shift is pressed (to prevent conflicts)
- Updated shape selection logic to not exit drag mode when shift is pressed
- Wrapped toolbar in TooltipProvider

### 4. Updated Canvas Component (`src/components/Canvas.tsx`)
- Added `onWheel` prop to handle wheel events directly
- Updated all drawing handlers to check for drag mode
- Prevented shape drawing when in drag mode (either manual or shift-triggered)
- Added proper TypeScript types for wheel events

### 5. Added Tooltip Component
- Installed shadcn tooltip component using `bunx shadcn@latest add tooltip`

## Technical Challenges Solved

### Passive Event Listener Errors
- **Problem**: `preventDefault()` was being called in passive event listeners
- **Root Cause**: React wheel handlers are passive by default
- **Solution**: Removed `preventDefault()` from React handlers, kept it only in document-level listener with `passive: false`

### Shift Key Zooming Issue
- **Problem**: When shift is pressed, wheel events might use `deltaX` instead of `deltaY`
- **Root Cause**: Browser behavior changes wheel event deltas when shift is held
- **Solution**: Added logic to use `deltaX` when shift is pressed, `deltaY` otherwise

### Multiple Event Handler Conflicts
- **Problem**: Container-level and canvas-level wheel event listeners were conflicting
- **Root Cause**: Multiple handlers trying to process the same events
- **Solution**: Implemented layered approach with document-level listener as primary handler

### State Management Complexity
- **Problem**: Need to track both manual drag mode and shift-triggered drag mode
- **Root Cause**: Shift key should temporarily override manual drag state
- **Solution**: Added `wasDraggingBeforeShift` state to remember and restore previous state

## Features Implemented

✅ **Shift Key Drag Mode**: Press and hold Shift to quickly enter drag mode  
✅ **Automatic State Restoration**: Release Shift to exit drag mode and restore previous state  
✅ **Manual Drag Toggle**: Click drag button for persistent drag mode (when shift not pressed)  
✅ **Uninterrupted Zooming**: Mouse wheel zooming works in all scenarios  
✅ **Smart Delta Handling**: Uses `deltaX` when shift pressed, `deltaY` otherwise  
✅ **Visual Feedback**: Tooltip on drag button explains shift key functionality  
✅ **No Event Conflicts**: Proper event handling without passive listener errors  
✅ **State Priority**: Shift key drag mode takes precedence over manual toggle  
✅ **Shape Drawing Prevention**: Prevents shape drawing when in drag mode  

## Files Modified
- `src/store/index.ts` - Added shift key state management
- `src/components/CanvasContainer.tsx` - Added keyboard handlers and fixed zooming
- `src/components/CanvasToolbar.tsx` - Added tooltip and updated drag logic
- `src/components/Canvas.tsx` - Added wheel prop and drag mode checks
- `src/components/ui/tooltip.tsx` - Added shadcn tooltip component

The implementation provides a smooth, intuitive experience where users can quickly access drag mode with the shift key while maintaining full zoom functionality and visual feedback through tooltips. 