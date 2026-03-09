# Phase 3: Visual Styling & UI Polish

This plan outlines the enhancements for the news feed's visual appeal by integrating news images and refining the card layout for a more premium experience.

## Proposed Changes

### Mobile App [mobile]

#### [MODIFY] [index.tsx](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/mobile/app/(tabs)/index.tsx)
- Import `Image` from `react-native`.
- Update `renderItem` to support two layouts:
    - **Featured Card**: For high-scoring news (>50), show a larger image with text overlay.
    - **Compact Card**: For regular news, show a smaller thumbnail on the right/left.
- Implement an image fallback (placeholder) using a generic storage-themed icon or color gradient.
- Refine typography and spacing for better readability.

## Verification Plan

### Manual Verification
- Verify that news items with `image_url` display the correct image.
- Verify that items without images show a graceful placeholder.
- Check the layout on different screen widths in Expo Go.
