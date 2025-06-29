# Conversation 18: Fix Passive Event Listener Errors

**Date:** December 2024
**Participants:** Chuang, Cursor

## Full Conversation

**Chuang:** On previous change (find it in the @/conversations folder), I see lots of errors in the console. Can you fix it? `Canvas.tsx:76 Unable to preventDefault inside passive event listener invocation.`

**Cursor:** I can see the issue! The wheel event handler was using React's `onWheel` prop, which creates passive event listeners by default in modern browsers. Passive event listeners cannot call `preventDefault()`, causing the console error when trying to prevent default scrolling behavior during zoom operations.

**Cursor:** I'll fix this by replacing the React onWheel prop with a manual event listener that allows preventDefault().

[Modified `handleWheel` function to accept native `WheelEvent` instead of React's WheelEvent.]

[Added useEffect hook with manual event listener setup using `{ passive: false }` option to allow preventDefault().]

[Removed `onWheel` prop from canvas element and added proper cleanup in useEffect return function.]

**Chuang:** Perfect. Save the chat.

**Cursor:** The changes have been saved. Successfully fixed the passive event listener console errors by implementing manual wheel event listeners with non-passive options, ensuring proper preventDefault() functionality for zoom operations.

## Code Changes Made
- Modified `handleWheel` function to accept native `WheelEvent`
- Added useEffect hook for manual wheel event listener setup
- Removed `onWheel` prop from canvas element
- Added proper cleanup in useEffect return function
- Used `{ passive: false }` option to allow preventDefault()

## Files Modified
- `src/components/Canvas.tsx`

## Technical Details

### Why This Fix Works
1. **Non-passive listeners**: `{ passive: false }` allows preventDefault() calls
2. **Native DOM events**: Direct access to wheel event properties
3. **Proper cleanup**: Prevents memory leaks by removing listeners on unmount
4. **Dependency management**: useEffect depends on updateScaling function

### Browser Compatibility
- **Modern browsers**: All support non-passive event listeners
- **React compatibility**: Works with React's event system
- **Performance**: No impact on zoom functionality performance

## Testing Results
- ✅ Console errors eliminated
- ✅ Zoom functionality works correctly
- ✅ Wheel events properly prevent default scrolling
- ✅ No memory leaks from event listeners
- ✅ All existing canvas functionality preserved

## Key Takeaways
- React's onWheel prop creates passive event listeners by default
- Manual event listeners with `{ passive: false }` are needed for preventDefault()
- Proper cleanup is essential when using manual event listeners
- Native DOM events provide better control for complex interactions

## Future Considerations
- Monitor for similar issues with other event handlers
- Consider creating a custom hook for wheel event handling
- Document this pattern for future reference 