# Digital Closet – Architecture Overview

> **Purpose:** This document seeds essential project context for both human and AI contributors, maximizing the value of any model’s context window. It enables rapid, accurate onboarding and ensures all future development aligns with the project’s standards for modularity, testability, and scalability.

---

## 1. Project Structure & Directory Layout

- **/src/screens/** – UI screens (React components). “Dumb” components: handle UI, user interaction, and navigation only.
- **/src/services/** – All business logic, AsyncStorage, and data transformation. Service modules are the only place for side effects, persistence, or data manipulation.
- **/src/services/__tests__/** – Jest regression and unit tests for all service modules.
- **/src/services/uuid.js** – Universal, React Native–safe UUID generation.
- **/src/services/garmentVisionService.js** – GarmentVision pipeline: OpenAI-powered garment segmentation, mask, and retouching.
- **/src/services/imageProcessingService.js** – Central abstraction for clothing article detection. Supports only Clarifai and OpenAI (garmentVision) providers. The mock provider and abstract interface were removed for code hygiene.

## 2. Design Patterns & Principles

- **Clean Architecture / MVVM**
  - UI (View/Screen) components are presentation-only.
  - All business logic, storage, and data flow are in service modules.
  - Easy to swap out service implementations or UI frameworks.
- **Modularity:** Each module has a single responsibility and clear interface.
- **Testability:** All core logic is covered by Jest tests. New features require new tests.
- **Scalability:** Architecture supports future features (filtering, sharing, etc.) without major rewrites.

## 3. Data Flow & Example

- **Adding an Article:**
  1. User selects/crops articles in a screen (e.g., VerificationScreen.js).
  2. Screen calls a service (e.g., galleryService.js, garmentVisionService.js) to process, persist, or transform data.
  3. If using GarmentVision, the service:
      - Calls OpenAI for garment detection and mask generation
      - ### Image Generation
        - Uses OpenAI DALL-E **2** for generating garment images from text descriptions.
        - Output size is set to **512x512** for optimal cost, latency, and mobile display quality.
        - Once DALL-E 3 (or newer) supports smaller sizes or better cost/quality tradeoff, the pipeline will be upgraded accordingly.
      - Calls DALL-E edits for studio-style retouching
      - Returns bounding box, mask PNG, retouched image URL, and metadata
  4. Service returns results, which the screen displays or navigates with.

- **Provider Support and Code Hygiene:**
  - As of April 2025, only Clarifai and OpenAI (garmentVision) providers are supported in `imageProcessingService.js`.
  - The mock provider (`mockImageProcessingService.js`) and abstract interface (`IImageProcessingService.js`) were removed after confirming no active references or dependencies.
  - This cleanup reduces code bloat and ensures a maintainable, production-focused codebase.

- **No business logic in screens.**
- **All storage, filtering, and mutation in services.**

  - **Data Model:**
  - Article objects may now include:
    - `croppedImageUri`: Local cropped image (Clarifai pipeline)
    - `imageUri`: Original image (Clarifai pipeline)
    - `imageUrl`: Cloud/remote image (OpenAI/DALL-E pipeline)
    - `localImageUri`: Local persistent copy of remote images (added May 2025)
    - `wearCount`: Number of times the article has been worn (added May 2025)
    - `boundingBox`: { x, y, w, h }
    - `maskPngB64`: base64 PNG string
    - `retouchedUrl`: URL to studio-style image
    - `metadata`: extracted attributes (color, type, etc.)
  - **Image Field Fallback & Persistence:**
    - UI components (e.g., CategoryCarousel, CreateOutfitScreen) always render the first available image from `localImageUri`, `croppedImageUri`, `imageUri`, or `imageUrl`.
    - The `localImageUri` field (added May 2025) stores a local copy of remote images to solve the URL expiration issue with OpenAI DALL-E generated images.
    - Images are automatically downloaded and stored locally when articles are created or when the app starts up (via migration).
    - This ensures robust, multi-provider support (Clarifai, OpenAI, future pipelines) and prevents blank images even when remote URLs expire.
    - If no image field is present, a placeholder is shown.
  - **Outfit Usage & Wear Tracking:**
    - Outfits can be marked as worn via the OutfitDetailScreen.
    - The `wearCount` field tracks how many times each article has been worn.
    - When an outfit is marked as worn, the wearCount for all articles in that outfit is incremented.
    - Outfits also track their own wear count and last worn date for future features.

## 4. Testing Philosophy

- **Jest is used for all service modules.**
- **Regression suite:** Every meaningful new feature or bug fix should add a test case.
- **Run tests anytime with:**
  ```sh
  npx jest
  ```
- **Test files live in `/src/services/__tests__/`**

## 5. Naming & Conventions

- **Service modules:** Named after their domain (e.g., galleryService.js, outfitService.js).
- **Screens:** Named after their UI function (e.g., GalleryScreen.js).
- **UUID:** Always use the provided uuid.js wrapper for unique IDs.

## 6. Extending & Onboarding

- **To add a new feature:**
  1. Implement business logic in a new or existing service module.
  2. Write Jest tests for all new logic and edge cases.
  3. Update or create screens to use the service (UI only).
  4. Update this document if architecture evolves.

- **For AI models:**
  - Read this file first to seed your context window.
  - Follow all separation-of-concerns and modularity principles.
  - Always suggest or add tests for new logic.

---

**This document is intentionally concise for maximal context utility. Update as the project grows or as new conventions are adopted.**

## 7. Recent Changes & Development Roadmap

### Recent Implementations (May 2025)

1. **Enhanced Navigation System**
   - Implemented a bottom tab navigator with three main tabs: Home, Wardrobe (renamed from Gallery), and Outfits
   - Added a floating action button (FAB) for primary actions with options for "Take a photo" and "Upload a photo"
   - Integrated developer functionality (Clear Closet) into the FAB menu with a distinctive red button and bug icon
   - Positioned the FAB button optimally within the navigation bar for easy access
   - Increased the size of tab icons from 24px to 28px for better visibility
   - Increased the size of the FAB button to 64px with a 34px icon for improved usability

2. **UI Standardization**
   - Standardized header styles across all screens (Home, Wardrobe, Outfits) for consistent user experience
   - Carefully adjusted header spacing to avoid overlap with iOS status bar while maintaining visual consistency
   - Implemented proper padding and alignment for all UI elements
   - Increased vertical spacing between FAB menu buttons for better touch targets

3. **Previous Implementations**
   - Image Persistence: Added local storage for images to solve URL expiration issues
   - Outfit Management: Created a fully functional outfit management interface
   - Wear Count Tracking: Added tracking for both article and outfit usage statistics

### Next Development Priorities

1. **UI Component Library & Standardization**
   - Extract common UI elements (headers, cards, buttons) into reusable components
   - Implement a centralized theme system with consistent styling constants
   - Create a component documentation system for future development
   - Standardize styling approaches across all screens

2. **Category-Based Navigation Enhancement**
   - Implement improved category filtering in the Wardrobe screen
   - Add smooth transitions between category views
   - Consider adding a dedicated category tab or dropdown for quick access
   - Refactor navigation code to improve maintainability

3. **Usage Analytics Dashboard**
   - Enhance the Home screen with more detailed usage analytics
   - Create visualizations for wear statistics (e.g., charts, graphs)
   - Add insights about most/least worn items and outfit combinations
   - Implement proper data abstraction for analytics to improve testability

4. **Code Refactoring & Service Optimization**
   - Break down large services into more focused modules
   - Improve test coverage for critical business logic
   - Update outdated dependencies to recommended versions
   - Add comprehensive JSDoc comments to improve code documentation

5. **Search and Filter Functionality**
   - Implement robust search across the wardrobe
   - Add advanced filtering options (by color, type, season, etc.)
   - Create saved filter presets for quick access
   - Design the filter system for extensibility and reuse

6. **Performance Optimizations**
   - Implement lazy loading for image-heavy screens
   - Optimize storage and retrieval of article data
   - Add caching mechanisms for frequently accessed data
   - Reduce redundant code in image processing pipeline

7. **Future Enhancements**
   - Outfit recommendation engine based on wear patterns and preferences
   - Weather integration for contextual outfit suggestions
   - Social sharing capabilities
   - AR try-on functionality
