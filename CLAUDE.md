# Digital Closet – Project Context for Claude Code

> **Purpose:** This document provides essential project context for Claude Code, maximizing the value of the context window for rapid, accurate development assistance. It enables immediate understanding of the codebase architecture, conventions, and development patterns to ensure all contributions align with the project's standards for modularity, testability, and scalability.

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
- **Component-Based Design System**
  - **/src/theme/** – Centralized theme system (colors, spacing, typography, shadows)
  - **/src/components/common/** – Comprehensive reusable UI components (AppHeader, Button, EmptyState, ArticleCard)
  - **Consistent Props**: All components follow similar prop patterns for easy learning
  - **Theme Integration**: All components use centralized theme system
  - **Variant Architecture**: Components support multiple layouts/styles through variant props
- **Modularity:** Each module has a single responsibility and clear interface.
- **Testability:** All core logic is covered by Jest tests. New features require new tests.
- **Scalability:** Architecture supports future features (filtering, sharing, etc.) without major rewrites.

## 3. Analytics & User Tracking

- **PostHog Integration:**
  - **Event Tracking**: Custom events for key user actions (outfit creation, etc.)
  - **Autocapture**: Automatic tracking of screen views, button clicks, form interactions
  - **Session Replay**: Full user session recordings for debugging and UX insights
  - **Feature Flags**: Ready for A/B testing and feature rollouts
  - **Security**: API keys securely managed via environment variables

- **Custom Events Tracked:**
  - `outfit_created`: When users create new outfits
    - Properties: outfit_name, article_count, article_types, created_at
  - **Future Events**: article_added, garment_processed, outfit_worn, etc.

## 4. Data Flow & Example

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
    - **Unified Fallback Chain**: All UI components now use ArticleCard component which implements the standard fallback: `localImageUri` → `croppedImageUri` → `imageUri` → `imageUrl`
    - The `localImageUri` field (added May 2025) stores a local copy of remote images to solve the URL expiration issue with OpenAI DALL-E generated images.
    - Images are automatically downloaded and stored locally when articles are created or when the app starts up (via migration).
    - This ensures robust, multi-provider support (Clarifai, OpenAI, future pipelines) and prevents blank images even when remote URLs expire.
    - ArticleCard component handles all placeholder scenarios with appropriate icons and messaging.
  - **Outfit Usage & Wear Tracking:**
    - Outfits can be marked as worn via the OutfitDetailScreen.
    - The `wearCount` field tracks how many times each article has been worn.
    - When an outfit is marked as worn, the wearCount for all articles in that outfit is incremented.
    - Outfits also track their own wear count and last worn date for future features.

## 4. Development Commands

- **Start development server:**
  ```sh
  expo start
  ```
- **Run on specific platform:**
  ```sh
  expo start --ios    # iOS simulator
  expo start --android # Android emulator  
  expo start --web     # Web browser
  ```
- **Run tests:**
  ```sh
  npx jest
  ```

## 5. Testing Philosophy

- **Jest is used for all service modules.**
- **Regression suite:** Every meaningful new feature or bug fix should add a test case.
- **Test files live in `/src/services/__tests__/`**

## 6. Naming & Conventions

- **Service modules:** Named after their domain (e.g., galleryService.js, outfitService.js).
- **Screens:** Named after their UI function (e.g., GalleryScreen.js).
- **UUID:** Always use the provided uuid.js wrapper for unique IDs.

## 7. Extending & Onboarding

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

## 8. Recent Changes & Development Roadmap

### Recent Major Refactoring (July 2025)

**Comprehensive Component Library & Theme System Implementation**

1. **✅ Centralized Theme System** (`src/theme/`)
   - **colors.js**: Consolidated 40+ hardcoded colors into semantic color system
   - **spacing.js**: 8px grid spacing constants for consistency
   - **typography.js**: Centralized text styles and font configurations
   - **index.js**: Main theme export with shadow presets
   - **Impact**: Eliminated 100+ hardcoded color values, enabled easy theme switching/dark mode

2. **✅ AppHeader Component** (`src/components/common/AppHeader.js`)
   - **Variants**: `main` (dashboard), `navigation` (back button), `simple`
   - **Props**: title, showBackButton, rightElement, backgroundColor, showBorder
   - **Replaced**: Headers in HomeScreen, GalleryScreen, OutfitsScreen, OutfitDetailScreen
   - **Impact**: ~60 lines saved, consistent header behavior across app

3. **✅ Button Component** (`src/components/common/Button.js`) 
   - **Variants**: primary, secondary, destructive, icon
   - **Features**: Loading states, icon support, accessibility, theme integration
   - **Replaced**: 8+ button patterns across VerificationScreen, CreateOutfitScreen, OutfitsScreen, OutfitDetailScreen
   - **Impact**: ~150+ lines saved, standardized button behavior

4. **✅ EmptyState Component** (`src/components/common/EmptyState.js`)
   - **Variants**: fullscreen, inline, card for different contexts
   - **Features**: Loading states, error states, action buttons, flexible content
   - **Replaced**: Empty states in OutfitsScreen, HomeScreen, OutfitDetailScreen
   - **Impact**: ~100+ lines saved, consistent empty state UX

5. **✅ ArticleCard Component** (`src/components/common/ArticleCard.js`) **(Completed July 2025)**
   - **Variants**: list, grid, carousel, verification, preview for all article display contexts
   - **Features**: Unified image fallback chain, selection states, remove buttons, URL validation, touch handling
   - **Replaced**: Article display patterns in OutfitDetailScreen, CreateOutfitScreen, VerificationScreen, CategoryCarousel
   - **Impact**: ~200+ lines saved, consistent article rendering across app

**Total Refactoring Impact**: ~610+ lines eliminated, comprehensive component library, consistent design system

### Recent Major Updates (July 17, 2025)

**Code Quality & Architecture Phase: COMPLETE ✅**

1. **✅ Large Function Refactoring** **(Completed July 17, 2025)**
   - **galleryService.addArticles**: Extracted 3 helper functions
     - `normalizeAddArticlesOptions()` - Default options processing
     - `processNewArticles()` - Validation and migration pipeline
     - `saveArticlesToStorage()` - Storage operations
   - **garmentVisionService.processGarmentImage**: Extracted 3 helper functions
     - `processClothingItemsBatch()` - Batch processing with parallel options
     - `finalizePipelineResults()` - Result formatting and logging
     - `runGarmentVisionPipeline()` - Workflow orchestration
   - **Impact**: Improved testability, maintainability, and readability

2. **✅ PostHog Analytics Integration** **(Completed July 17, 2025)**
   - **PostHog React Native SDK**: Full integration with session replay and autocapture
   - **Custom Event Tracking**: `outfit_created` events with rich metadata
   - **Security**: Proper API key handling via environment variables
   - **Navigation Integration**: Fixed context issues for proper hook access
   - **Features**: Automatic screen tracking, button clicks, session recordings

**Current Development Priorities (Updated July 17, 2025)**

**Next Development Focus:**

1. **Code Quality & Architecture Improvements**
   - **Standardize Error Handling**: Create consistent error patterns across services (~100+ lines saved)
   - **Expand Test Coverage**: Currently only 37% of services have tests

2. **Performance & User Experience**
   - **Fix OutfitsScreen render loop**: Component mounts 5x during navigation (useEffect + useFocusEffect conflict)
   - **Progressive Article Processing UI**: Show real-time feedback instead of silent waiting during image processing
   - **Navigation Polish**: Fix outdated "Gallery" → "Wardrobe" screen references
   - **Fix Outfit Creation Navigation**: After creating outfit, should return to "My Outfits" tab instead of Home screen

3. **Feature Development**
   - **Category-Based Navigation**: Enhanced filtering and transitions
   - **Usage Analytics Dashboard**: Visualizations and insights
   - **Search and Filter Functionality**: Robust search across wardrobe

## 9. Component Library Architecture

### **Established Component Patterns**
All components follow consistent patterns established during the July 2025 refactoring:

- **Variant-based Design**: Components support multiple variants through props (e.g., `variant="primary"`)
- **Theme Integration**: All components use the centralized theme system for colors, spacing, typography
- **Accessibility**: Built-in accessibility labels, keyboard navigation, and screen reader support
- **Flexible Styling**: Custom styles can be passed via `style` prop while maintaining design consistency
- **Loading States**: Components handle loading and error states gracefully

### **Component Usage Guidelines**
- **ArticleCard**: Use for all article display needs - supports list, grid, carousel, verification, preview variants
- **Button**: Use for all interactive elements - supports primary, secondary, destructive, icon variants
- **EmptyState**: Use for empty data states - supports fullscreen, inline, card variants with loading/error states
- **AppHeader**: Use for all screen headers - supports main, navigation, simple variants
