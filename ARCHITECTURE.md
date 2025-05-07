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
