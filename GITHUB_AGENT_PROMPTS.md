# Context-Engineered Prompts for GitHub Agents

This document provides 5 specialized prompts for GitHub Agents (Copilot Workspace) and 1 prompt for GitHub Copilot IDE to help build out the FableRealm project following best practices.

---

## Agent Prompt 1: Testing Infrastructure Setup

### Context
FableRealm is a React + TypeScript + Three.js city-builder game built with Vite. The project currently has zero test coverage and needs a comprehensive testing infrastructure.

### Objective
Set up Vitest with React Testing Library and create test files for critical game logic.

### Prompt
```
Set up a comprehensive testing infrastructure for FableRealm using Vitest and React Testing Library.

REQUIREMENTS:
1. Install and configure Vitest with TypeScript support
2. Install @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, and jsdom
3. Create vitest.config.ts with proper configuration for React components
4. Create src/setupTests.ts with Testing Library matchers
5. Update tsconfig.json to include Vitest types
6. Add test scripts to package.json: "test", "test:watch", "test:coverage"
7. Configure coverage reporting with 70% threshold

CREATE INITIAL TEST FILES:
- src/services/__tests__/simulationService.test.ts - Test tick calculation, spatial coverage, and state integration
- src/services/__tests__/actionService.test.ts - Test building placement validation
- src/services/__tests__/saveService.test.ts - Test save/load with LocalStorage mocking
- src/components/__tests__/UIOverlay.test.tsx - Test UI component rendering and interactions

TESTING PATTERNS TO USE:
- Use describe/it/expect syntax
- Mock external dependencies (localStorage, Gemini API)
- Test user interactions with userEvent, not fireEvent
- Focus on behavior, not implementation details
- Use getByRole queries for accessibility

CONSTRAINTS:
- Maintain existing code structure - only add test files and configuration
- Do not modify the actual service or component files unless fixing a bug discovered during testing
- Use TypeScript for all test files
- Follow React Testing Library best practices (test behavior, not implementation)

EXPECTED OUTCOMES:
- All tests pass
- Coverage report shows >50% initial coverage
- Test commands work: npm run test, npm run test:watch, npm run test:coverage
- Tests validate core game logic (building placement, simulation tick, save/load)
```

---

## Agent Prompt 2: PWA Implementation

### Context
FableRealm claims to be "PWA Ready" in the README, but has no service worker or manifest file. The project uses Vite as the build tool.

### Objective
Implement complete PWA functionality with offline support, caching strategies, and installability.

### Prompt
```
Implement full Progressive Web App (PWA) capabilities for FableRealm including service worker, web app manifest, and offline support.

REQUIREMENTS:
1. Install vite-plugin-pwa as a dev dependency
2. Configure vite-plugin-pwa in vite.config.ts with the following features:
   - Auto-update service worker (registerType: 'autoUpdate')
   - Precache all static assets (JS, CSS, HTML, fonts, images)
   - Runtime caching for external resources (Google Fonts, Gemini API)
   - Offline fallback page

3. Create public/manifest.json with:
   - name: "FableRealm: Kingdom Architect"
   - short_name: "FableRealm"
   - description: "Build your fairytale kingdom with AI-powered quests"
   - theme_color: "#4F46E5"
   - background_color: "#1E1B4B"
   - display: "standalone"
   - start_url: "/"
   - icons: [192x192, 512x512] - generate placeholder references
   - orientation: "any"
   - categories: ["games", "entertainment"]

4. Update index.html to include:
   - Manifest link
   - Apple touch icons
   - Theme color meta tags
   - Viewport settings for mobile

5. Create src/hooks/useInstallPrompt.ts:
   - Hook to detect PWA installability
   - Prompt user to install the app
   - Track installation state

6. Add install button to UIOverlay component:
   - Show only when app is installable
   - Hide after installation
   - Accessible button with proper ARIA labels

7. Implement offline detection in App.tsx:
   - Show banner when offline
   - Disable AI features when offline (Gemini API)
   - Save game state locally when offline

CACHING STRATEGY:
- Static assets: Cache-first (long-term cache)
- Game state: Network-first (prefer fresh, fallback to cache)
- AI requests: Network-only (don't cache AI responses)
- Images/models: Cache-first with expiration

TESTING:
- Test offline functionality in Chrome DevTools
- Verify manifest is valid using Lighthouse
- Ensure app is installable on desktop and mobile
- Test service worker updates properly

CONSTRAINTS:
- Do not break existing save/load functionality
- Maintain compatibility with existing LocalStorage saves
- Keep bundle size minimal (avoid large SW libraries)
- Ensure service worker updates don't break active games

EXPECTED OUTCOMES:
- App scores 90+ on Lighthouse PWA audit
- App is installable on Chrome, Edge, Safari
- Offline mode works (cached UI, disabled AI)
- Service worker caches game assets efficiently
```

---

## Agent Prompt 3: Code Quality & Linting Setup

### Context
FableRealm has no linting or formatting setup. The project uses TypeScript but not in strict mode. Need to establish code quality standards.

### Objective
Set up ESLint, Prettier, and Husky with pre-commit hooks. Enable TypeScript strict mode.

### Prompt
```
Establish comprehensive code quality standards for FableRealm with ESLint, Prettier, TypeScript strict mode, and Git hooks.

PART 1: TYPESCRIPT STRICT MODE
1. Update tsconfig.json to enable strict mode:
   - strict: true
   - noUncheckedIndexedAccess: true
   - noImplicitReturns: true
   - noFallthroughCasesInSwitch: true
   - noUnusedLocals: true (warn only)
   - noUnusedParameters: true (warn only)
   - exactOptionalPropertyTypes: true
   - forceConsistentCasingInFileNames: true

2. Fix TypeScript errors in existing code:
   - Add proper null checks
   - Fix implicit any types
   - Add return types to functions
   - Fix array access safety
   - Document with a summary of changes made

PART 2: ESLINT CONFIGURATION
1. Install dependencies:
   - eslint
   - @typescript-eslint/eslint-plugin
   - @typescript-eslint/parser
   - eslint-plugin-react
   - eslint-plugin-react-hooks
   - eslint-plugin-jsx-a11y
   - eslint-plugin-import

2. Create .eslintrc.json with:
   - TypeScript parser
   - React plugins and rules
   - Accessibility rules (jsx-a11y)
   - Import ordering rules
   - Custom rules for game logic (no-console: warn, etc.)

3. Create .eslintignore for build artifacts

PART 3: PRETTIER CONFIGURATION
1. Install prettier
2. Create .prettierrc with sensible defaults:
   - semi: true
   - singleQuote: true
   - tabWidth: 2
   - trailingComma: 'es5'
   - printWidth: 100
   - arrowParens: 'always'

3. Create .prettierignore
4. Install eslint-config-prettier to avoid conflicts

PART 4: HUSKY & LINT-STAGED
1. Install husky and lint-staged
2. Initialize husky: npx husky init
3. Create pre-commit hook that runs lint-staged
4. Configure lint-staged in package.json:
   - Run ESLint with --fix on *.ts, *.tsx files
   - Run Prettier on all files
   - Run type checking (tsc --noEmit)

PART 5: PACKAGE.JSON SCRIPTS
Add these scripts:
- "lint": "eslint . --ext .ts,.tsx"
- "lint:fix": "eslint . --ext .ts,.tsx --fix"
- "format": "prettier --write ."
- "format:check": "prettier --check ."
- "type-check": "tsc --noEmit"
- "validate": "npm run type-check && npm run lint && npm run format:check"

PART 6: CI INTEGRATION
Create .github/workflows/quality.yml:
- Run on push and PR
- Check linting (npm run lint)
- Check formatting (npm run format:check)
- Check types (npm run type-check)
- Fail CI if any check fails

CONSTRAINTS:
- Fix all TypeScript strict errors before committing
- Do not change runtime behavior when fixing types
- Minimize changes to existing code style
- Document any breaking changes in code comments
- Ensure all existing tests still pass after changes

EXPECTED OUTCOMES:
- All TypeScript files compile in strict mode
- ESLint reports zero errors (warnings acceptable)
- All files formatted consistently with Prettier
- Pre-commit hook prevents committing invalid code
- CI pipeline validates code quality on all PRs
```

---

## Agent Prompt 4: Performance Optimization - Three.js Instancing

### Context
FableRealm renders each building as an individual React component, which is inefficient. The ARCHITECTURE.md mentions instancing as a "future refactor target."

### Objective
Implement Three.js InstancedMesh for duplicate building types to improve rendering performance.

### Prompt
```
Optimize FableRealm's 3D rendering performance by implementing Three.js InstancedMesh for buildings of the same type.

CURRENT PROBLEM:
The IsoMap component renders each building individually, creating thousands of React components and Three.js objects. This causes performance issues with large cities.

SOLUTION:
Group buildings by type and render each group as an InstancedMesh, reducing draw calls and improving FPS.

REQUIREMENTS:

1. ANALYSIS PHASE:
   - Examine components/IsoMap.tsx and identify building rendering logic
   - Analyze how buildings are currently rendered
   - Document current performance (FPS counter if available)

2. CREATE NEW COMPONENT: components/3d/InstancedBuildings.tsx
   ```typescript
   interface InstancedBuildingsProps {
     buildingType: BuildingType
     tiles: TileData[]
     geometry: THREE.BufferGeometry
     material: THREE.Material
   }
   ```
   - Use useRef for InstancedMesh
   - Update instance matrices based on tile positions
   - Handle dynamic updates when buildings are added/removed
   - Implement hover/selection by raycasting to individual instances

3. UPDATE IsoMap.tsx:
   - Group tiles by buildingType
   - Render one InstancedBuildings component per building type
   - Keep roads and special buildings (landmarks) as individual meshes
   - Maintain existing selection and hover behavior

4. HANDLE DYNAMIC UPDATES:
   - Efficiently update instance matrices when grid changes
   - Use THREE.InstancedBufferAttribute for per-instance data (level, happiness color)
   - Implement useEffect to sync grid state with instance transforms

5. OPTIMIZE MEMORY:
   - Reuse geometries across instance groups
   - Use shared materials where possible
   - Dispose of old instances when buildings are demolished

6. MAINTAIN INTERACTIVITY:
   - Implement raycasting for individual instance selection
   - Update hover effects to work with instanced meshes
   - Ensure building info panel still works correctly

7. ADD PERFORMANCE MONITORING:
   - Add FPS counter component using useFrame
   - Log number of draw calls before/after optimization
   - Add performance stats to WizardConsole (stats command)

TESTING:
- Create a large city (20x20 grid, mostly filled) and measure performance
- Verify building placement still works
- Verify building selection/hovering works
- Verify building upgrades update instance appearance
- Test demolition removes instances correctly

CONSTRAINTS:
- Do not break existing game functionality
- Maintain visual appearance (same models, materials, lighting)
- Keep code readable and maintainable
- Only instance buildings with >5 duplicates in view
- Individual buildings (landmarks, unique types) stay as separate meshes

EXPECTED OUTCOMES:
- 2-3x improvement in FPS for large cities
- Reduced draw calls from ~500 to ~50 for full grid
- No visual or functional regressions
- Performance stats accessible via wizard console
- Clean, documented implementation following React Three Fiber best practices
```

---

## Agent Prompt 5: Documentation & Developer Experience

### Context
FableRealm has basic README and ARCHITECTURE docs but lacks comprehensive developer documentation, API docs, and contribution guidelines.

### Objective
Create complete developer documentation including API docs, contribution guidelines, and onboarding materials.

### Prompt
```
Create comprehensive developer documentation for FableRealm to improve onboarding and collaboration.

CREATE THE FOLLOWING DOCUMENTS:

1. CONTRIBUTING.md
   - How to set up development environment
   - Code style guidelines (reference ESLint/Prettier config)
   - Branch naming conventions (feature/, bugfix/, docs/)
   - Commit message format (Conventional Commits)
   - PR process and review checklist
   - How to run tests and check code quality
   - How to add new building types
   - How to add new terminal commands
   - Contact information and community links

2. API_DOCUMENTATION.md
   - Document all services with examples:
     * SimulationService: tick(), calculateCoverage(), etc.
     * ActionService: placeBuilding(), demolishBuilding(), upgradeBuilding()
     * SaveService: saveGame(), loadGame(), listSaves()
     * GeminiService: generateNewsEvent(), generateCityGoal()
     * SoundService: playSound(), toggleMute()
   - Document all TypeScript types and interfaces
   - Include code examples for common operations
   - Document event system and state flow
   - Include diagrams (use Mermaid syntax)

3. UPDATE README.md
   - Add badges: build status, test coverage, license
   - Add "Quick Start" section with one-command setup
   - Add "Features" section with screenshots/GIFs
   - Add "Architecture" section with high-level diagram
   - Add "Tech Stack" with version numbers
   - Add "Performance" section with benchmarks
   - Add "Roadmap" section with planned features
   - Add "Contributing" link
   - Add "License" section (recommend Apache 2.0 based on existing code headers)

4. docs/BUILDING_GUIDE.md
   - Step-by-step tutorial for adding a new building type
   - Example: Adding a "Blacksmith" building
   - Cover all steps: type definition, constants, UI, 3D model placeholder, logic integration
   - Include code snippets for each file that needs modification
   - Screenshots of expected result

5. docs/ARCHITECTURE_DEEP_DIVE.md
   - Expand on ARCHITECTURE.md with more detail
   - Component hierarchy diagram
   - State flow diagram (how grid updates propagate)
   - Service interaction diagram
   - Three.js render pipeline explanation
   - Simulation tick lifecycle diagram
   - AI integration architecture
   - Save/load system design
   - Use Mermaid diagrams throughout

6. .github/PULL_REQUEST_TEMPLATE.md
   - PR description template
   - Checklist: tests added, docs updated, lint passes, no console errors
   - Screenshots section for UI changes
   - Breaking changes section

7. .github/ISSUE_TEMPLATE/
   - bug_report.md: Template for bug reports
   - feature_request.md: Template for feature requests
   - question.md: Template for questions

8. CHANGELOG.md
   - Start with v2.0.0 (current state)
   - Follow Keep a Changelog format
   - Sections: Added, Changed, Deprecated, Removed, Fixed, Security
   - Document recent changes based on git history

9. ADD JSDOC COMMENTS TO SERVICES
   - Add comprehensive JSDoc to all service functions
   - Include @param, @returns, @throws, @example tags
   - Document edge cases and limitations
   - Example:
     ```typescript
     /**
      * Places a building on the grid at the specified coordinates.
      * 
      * @param grid - Current game grid
      * @param x - X coordinate (0 to GRID_SIZE-1)
      * @param y - Y coordinate (0 to GRID_SIZE-1)
      * @param buildingType - Type of building to place
      * @param stats - Current city statistics
      * @returns Updated grid and stats, or error message
      * @throws {BuildingPlacementError} If position is occupied or invalid
      * 
      * @example
      * const result = ActionService.placeBuilding(grid, 5, 5, BuildingType.Cottage, stats);
      * if (result.success) {
      *   setGrid(result.newGrid);
      *   setStats(result.newStats);
      * }
      */
     ```

10. docs/TESTING_GUIDE.md
    - How to write tests for services, components, hooks
    - Testing patterns and best practices
    - How to mock dependencies (localStorage, Gemini API)
    - How to test Three.js components
    - Coverage requirements
    - CI/CD testing pipeline explanation

DOCUMENTATION STANDARDS:
- Use Markdown for all documentation
- Include code examples in all technical docs
- Use Mermaid for diagrams
- Keep language clear, concise, beginner-friendly
- Include links between related documents
- Add table of contents to long documents
- Use consistent formatting and style

CONSTRAINTS:
- Do not modify existing code functionality
- Ensure all code examples are correct and tested
- Reference actual file paths and line numbers where helpful
- Keep documentation up-to-date with current codebase state

EXPECTED OUTCOMES:
- New contributors can set up and start contributing in <30 minutes
- All services have complete API documentation
- Clear contribution guidelines reduce PR iteration cycles
- Documentation matches actual code (no outdated examples)
- Issue and PR templates improve communication quality
```

---

## GitHub Copilot IDE Prompt (for .github/copilot-instructions.md)

### Context
This prompt file configures GitHub Copilot to provide context-aware suggestions aligned with FableRealm's architecture and coding standards.

### File: .github/copilot-instructions.md

```markdown
# GitHub Copilot Instructions for FableRealm

## Project Overview
FableRealm is a 3D fairytale city-builder PWA built with React 19, TypeScript, Three.js (via React Three Fiber), Vite, and Google Gemini AI. The game uses a tick-based simulation engine with modular services and isometric 3D rendering.

## Technology Stack
- **Frontend**: React 19 with TypeScript (strict mode)
- **3D Graphics**: Three.js via @react-three/fiber and @react-three/drei
- **Build Tool**: Vite 6.x
- **AI Integration**: Google Gemini API (@google/genai)
- **State**: React hooks (useState, useEffect, useCallback, useRef)
- **Testing**: Vitest + React Testing Library
- **Styling**: Tailwind CSS (inline styles for now)

## Coding Standards

### TypeScript
- **Always** use strict type checking
- **Always** define return types for functions
- **Prefer** interfaces over types for object shapes
- **Use** enums for fixed sets of values (e.g., BuildingType)
- **Avoid** `any` type; use `unknown` if type is truly unknown
- **Use** optional chaining (`?.`) and nullish coalescing (`??`)

### React Components
- **Always** use functional components with hooks
- **Name** components in PascalCase (e.g., `BuildingPanel`)
- **Name** files matching component name (e.g., `BuildingPanel.tsx`)
- **Props**: Define explicit interface for all component props
- **Memoization**: Use `React.memo()` for expensive pure components
- **Hooks**: Extract complex logic into custom hooks (e.g., `useGameState`)

### Three.js / React Three Fiber
- **Use** `@react-three/fiber` for all Three.js integration
- **Use** `@react-three/drei` helpers when available (OrbitControls, Environment, etc.)
- **Prefer** InstancedMesh for duplicate objects (buildings of same type)
- **Optimize**: Use `useMemo` for geometries and materials
- **Performance**: Monitor with `useFrame` for render loop optimizations
- **Refs**: Use `useRef<THREE.Mesh>(null)` for accessing Three.js objects

### Service Layer Pattern
FableRealm uses a **service layer** architecture. Services contain pure business logic and export functions (not classes).

**Service Guidelines:**
- Place services in `/services` directory
- Export functions, not classes (functional programming style)
- Keep services pure (no side effects in calculation functions)
- Mock external dependencies (API calls, localStorage) for testing
- Document all service functions with JSDoc

**Existing Services:**
- `SimulationService`: Game tick calculation, coverage algorithms
- `ActionService`: Building placement, demolition, upgrades
- `SaveService`: LocalStorage save/load operations
- `GeminiService`: AI quest and news generation
- `SoundService`: Audio playback management

### State Management
- **App.tsx** holds root state (grid, stats, selected tool)
- Pass state down via props (prop drilling is acceptable for now)
- For complex state, consider extracting to custom hooks
- **Do not** introduce Redux/Zustand unless complexity requires it

### Naming Conventions
- **Variables**: camelCase (`const cityStats`, `let buildingType`)
- **Functions**: camelCase (`function calculateHappiness()`)
- **Components**: PascalCase (`function BuildingPanel()`)
- **Types/Interfaces**: PascalCase (`interface CityStats`, `type Grid`)
- **Enums**: PascalCase keys (`BuildingType.Cottage`)
- **Constants**: UPPER_SNAKE_CASE (`const GRID_SIZE`, `const TICK_RATE_MS`)
- **Files**: Match component/module name (`SimulationService.ts`, `UIOverlay.tsx`)

### File Organization
```
/services          # Business logic services
/components        # Reusable React components
  /3d              # Three.js components
  /ui              # 2D UI components
/hooks             # Custom React hooks
/types             # Shared TypeScript types
/constants         # Game constants
/utils             # Utility functions
/__tests__         # Test files (mirror source structure)
```

### Testing Requirements
- **Write tests** for all new services and complex components
- **Use** Vitest + React Testing Library
- **Test behavior**, not implementation (use `getByRole`, not `getByTestId`)
- **Mock** external dependencies (API calls, localStorage, timers)
- **Coverage**: Aim for 70%+ on services, 60%+ on components
- **Name**: Place tests in `__tests__` or use `.test.ts` / `.test.tsx` suffix

### Accessibility (a11y)
- **Use** semantic HTML elements (`<button>`, not `<div onClick>`)
- **Add** ARIA labels for icon buttons (`aria-label="Build cottage"`)
- **Ensure** keyboard navigation works (focus management, tab order)
- **Test** with screen readers when adding UI features
- **Use** RTL queries that promote accessibility (`getByRole`, `getByLabelText`)

### Performance Best Practices
- **Lazy load** heavy components (`const IsoMap = lazy(() => import('./components/IsoMap'))`)
- **Memoize** expensive calculations with `useMemo`
- **Memoize** callbacks passed to children with `useCallback`
- **Debounce** rapid user inputs (e.g., dragging to place multiple buildings)
- **Instance** duplicate 3D objects (use InstancedMesh for buildings)
- **Avoid** inline object/array creation in render (`style={{}}` is okay; `items={[]}` is not)

### Error Handling
- **Use** try-catch for async operations and external API calls
- **Define** custom error classes for domain errors (`GameStateError`, `BuildingPlacementError`)
- **Provide** user-friendly error messages in UI
- **Log** errors to console in development
- **Consider** error boundaries for React component errors

### Comments and Documentation
- **JSDoc** all service functions (params, returns, throws, examples)
- **Inline comments** for complex algorithms or non-obvious code
- **Avoid** obvious comments (`// increment by 1` is bad)
- **Document** magic numbers with constants (`const MAX_HAPPINESS = 100`)
- **Explain** business logic in comments (e.g., happiness calculation factors)

### Git Commit Messages
Follow Conventional Commits format:
```
type(scope): subject

Examples:
feat(buildings): add Blacksmith building type
fix(simulation): correct happiness calculation for isolated tiles
docs(readme): add installation instructions
test(services): add tests for ActionService
refactor(isomap): optimize rendering with instancing
perf(three): reduce draw calls with InstancedMesh
```

Types: feat, fix, docs, style, refactor, test, perf, chore

### Imports Organization
Organize imports in this order:
1. React and React-related libraries
2. Third-party libraries (Three.js, Gemini, etc.)
3. Local components
4. Local services
5. Local types and constants
6. Styles

Example:
```typescript
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import UIOverlay from './components/UIOverlay';
import IsoMap from './components/IsoMap';

import { SimulationService } from './services/simulationService';
import { ActionService } from './services/actionService';

import { Grid, CityStats, BuildingType } from './types';
import { GRID_SIZE, TICK_RATE_MS } from './constants';
```

### Common Patterns to Use

**Custom Hook Example:**
```typescript
function useGameLoop(onTick: () => void, interval: number) {
  useEffect(() => {
    const timer = setInterval(onTick, interval);
    return () => clearInterval(timer);
  }, [onTick, interval]);
}
```

**Three.js Component Example:**
```typescript
interface BuildingMeshProps {
  position: [number, number, number];
  buildingType: BuildingType;
  level: number;
}

function BuildingMesh({ position, buildingType, level }: BuildingMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => new THREE.BoxGeometry(1, level, 1), [level]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: getColor(buildingType) }), [buildingType]);
  
  return (
    <mesh ref={meshRef} position={position} geometry={geometry} material={material} />
  );
}
```

**Service Function Example:**
```typescript
/**
 * Calculates happiness for a tile based on surrounding factors.
 * 
 * @param tile - The tile to calculate happiness for
 * @param grid - The current game grid
 * @returns Happiness value from 0-100
 */
export function calculateTileHappiness(tile: TileData, grid: Grid): number {
  let happiness = 100;
  
  if (!tile.hasMana) happiness -= 20;
  if (!tile.hasEssence) happiness -= 20;
  if (!tile.hasGuards) happiness -= 15;
  // ... more factors
  
  return Math.max(0, Math.min(100, happiness));
}
```

## When Suggesting Code

1. **Understand context**: Read surrounding code and existing patterns before suggesting
2. **Follow conventions**: Match the project's style, naming, and organization
3. **Type everything**: Provide explicit types for all variables, parameters, returns
4. **Document**: Include JSDoc for functions, inline comments for complex logic
5. **Test-aware**: Suggest how to test the code you're generating
6. **Performance**: Consider performance implications, especially for 3D rendering
7. **Accessibility**: Ensure UI code is accessible (ARIA labels, keyboard navigation)
8. **Error handling**: Include error handling for operations that can fail

## What to Avoid

- ❌ `any` types (use proper types or `unknown`)
- ❌ Class components (use functional components)
- ❌ Inline styles for complex styling (consider Tailwind or CSS modules)
- ❌ Direct DOM manipulation (use React refs)
- ❌ Mutating state directly (use setState functions)
- ❌ Synchronous side effects in render
- ❌ Large components (split into smaller, focused components)
- ❌ Tight coupling between components and services

## Questions to Ask Before Generating

When I'm about to generate code, consider:
- Does this match the existing architecture and patterns?
- Is this properly typed with TypeScript?
- Will this work with the service layer pattern?
- How will this be tested?
- Are there performance implications for 3D rendering?
- Is this accessible for all users?
- Is this documented appropriately?

## Example Completions

When user types: "Create a new building type..."
→ Suggest changes to: types.ts (BuildingType enum), constants.tsx (BUILDINGS array), and provide 3D model placeholder

When user types: "Add test for simulation..."
→ Generate Vitest test with proper mocks, describe/it structure, and behavior-focused assertions

When user types: "Optimize rendering..."
→ Suggest React.memo, useMemo, useCallback, or InstancedMesh patterns

When user types: "Add accessibility..."
→ Add ARIA labels, semantic HTML, keyboard handlers, focus management

---

**Remember**: FableRealm is a production-grade game project. Prioritize code quality, performance, and maintainability in all suggestions.
```

---

## Summary

These prompts are designed to:
1. **Testing** - Establish quality assurance foundation
2. **PWA** - Implement offline-first capabilities
3. **Quality** - Enforce code standards and best practices
4. **Performance** - Optimize 3D rendering for scalability
5. **Documentation** - Improve developer experience and onboarding
6. **Copilot** - Configure AI assistance for consistent, high-quality suggestions

Each prompt is:
- **Context-rich**: Provides full background and understanding of the project
- **Specific**: Clear requirements and acceptance criteria
- **Actionable**: Can be executed independently by an AI agent
- **Constrained**: Boundaries to prevent unwanted changes
- **Measurable**: Clear success criteria and expected outcomes

Use these prompts sequentially or adapt them as needed for the specific development phase.
