# Recommended Repositories to Reference

This document lists 6 carefully selected open-source repositories that demonstrate best practices relevant to FableRealm's architecture and goals. Each repository offers valuable patterns, code organization, and implementation strategies that can be adapted for this project.

---

## 1. **alan2207/bulletproof-react**
**Repository:** https://github.com/alan2207/bulletproof-react  
**Stars:** ~25k+ | **Tech:** React, TypeScript, Testing

### Why Reference This?
The gold standard for scalable React architecture in 2024. Bulletproof React demonstrates production-grade patterns for organizing large React applications.

### Key Learnings for FableRealm:
- **Feature-based architecture**: Organize code by features rather than technical layers
- **Testing strategy**: Comprehensive testing setup with Jest/Vitest + React Testing Library
- **Type safety**: Strict TypeScript configuration and patterns
- **Project structure**: Clear separation of concerns with `/features`, `/components`, `/hooks`
- **Documentation**: Excellent README and contribution guidelines

### What to Implement:
```
/features
  /simulation
    /api         # API calls
    /components  # Feature-specific components
    /hooks       # Feature-specific hooks
    /types       # Feature types
    /utils       # Feature utilities
    index.ts     # Public API
```

### Specific Files to Study:
- `docs/project-structure.md` - Architecture patterns
- `src/features/` - Feature organization examples
- `.github/workflows/` - CI/CD pipeline setup
- `tsconfig.json` - Strict TypeScript configuration

---

## 2. **pmndrs/react-three-fiber**
**Repository:** https://github.com/pmndrs/react-three-fiber  
**Stars:** ~27k+ | **Tech:** React, Three.js, TypeScript

### Why Reference This?
The official React renderer for Three.js. Essential for understanding how to properly integrate Three.js with React's component model.

### Key Learnings for FableRealm:
- **Performance optimization**: Instancing, memoization, and render optimization
- **Hook patterns**: Custom hooks for 3D interactions (`useFrame`, `useThree`)
- **Component composition**: Building complex 3D scenes with declarative React
- **TypeScript integration**: Proper typing for Three.js objects in React
- **Examples**: Rich collection of game and visualization examples

### What to Implement:
```typescript
// Instancing pattern for duplicate buildings
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function InstancedBuildings({ positions, buildingType }) {
  const meshRef = useRef()
  
  useFrame(() => {
    // Optimize render loop
  })
  
  return (
    <instancedMesh ref={meshRef} args={[null, null, positions.length]}>
      <boxGeometry />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
```

### Specific Files to Study:
- `examples/` - Various game and visualization patterns
- `packages/fiber/src/core/hooks.tsx` - Custom hook implementations
- `markdown/recipes.md` - Performance recipes
- `packages/test-renderer/` - Testing strategies for 3D components

---

## 3. **GoogleChromeLabs/pwa-training**
**Repository:** https://github.com/GoogleChromeLabs/pwa-training  
**Stars:** ~1k+ | **Tech:** PWA, Service Workers, Workbox

### Why Reference This?
Official Google training materials for building Progressive Web Apps with modern best practices.

### Key Learnings for FableRealm:
- **Service worker strategies**: Offline-first, cache-first, network-first patterns
- **Workbox integration**: Automated service worker generation
- **Background sync**: Save game state even when offline
- **Push notifications**: Future feature for quest alerts
- **Installation flow**: Smooth install experience

### What to Implement:
```typescript
// vite.config.ts with PWA plugin
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ]
})
```

### Specific Files to Study:
- `app-shell-and-caching/` - Offline strategies
- `workbox/` - Service worker patterns
- `installable-and-offline/` - PWA installation

---

## 4. **goldbergyoni/nodebestpractices**
**Repository:** https://github.com/goldbergyoni/nodebestpractices  
**Stars:** ~99k+ | **Tech:** Node.js, JavaScript, TypeScript, Testing

### Why Reference This?
Comprehensive guide to JavaScript/TypeScript best practices, testing, error handling, and code quality.

### Key Learnings for FableRealm:
- **Error handling**: Proper error boundaries and error recovery
- **Testing practices**: Unit, integration, and E2E testing strategies
- **Code quality**: Linting, formatting, and code review practices
- **Security**: Common vulnerabilities and how to prevent them
- **Performance**: Optimization techniques for JavaScript applications

### What to Implement:
```typescript
// Custom error classes for game-specific errors
export class GameStateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GameStateError'
  }
}

export class BuildingPlacementError extends Error {
  constructor(message: string, public readonly position: { x: number; y: number }) {
    super(message)
    this.name = 'BuildingPlacementError'
  }
}

// Error boundary component
class GameErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('Game error:', error, errorInfo)
  }
}
```

### Specific Files to Study:
- `sections/testingandquality/` - Testing strategies
- `sections/errorhandling/` - Error patterns
- `sections/security/` - Security best practices
- `sections/performance/` - Performance optimization

---

## 5. **shoelace-style/shoelace**
**Repository:** https://github.com/shoelace-style/shoelace  
**Stars:** ~12k+ | **Tech:** Web Components, TypeScript, Testing

### Why Reference This?
While FableRealm uses React, Shoelace demonstrates excellent component design, documentation, and accessibility patterns that translate well to any UI framework.

### Key Learnings for FableRealm:
- **Accessibility**: WCAG-compliant components with proper ARIA labels
- **Documentation**: Excellent component documentation with live examples
- **TypeScript patterns**: Advanced TypeScript for component APIs
- **Testing**: Comprehensive test coverage for UI components
- **Design system**: Consistent theming and styling approach

### What to Implement:
```typescript
// Accessible building toolbar component
interface BuildingButtonProps {
  buildingType: BuildingType
  cost: number
  selected: boolean
  disabled: boolean
  onClick: () => void
}

export function BuildingButton({
  buildingType,
  cost,
  selected,
  disabled,
  onClick
}: BuildingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Build ${buildingType} for ${cost} gold`}
      className={`building-button ${selected ? 'selected' : ''}`}
    >
      <BuildingIcon type={buildingType} aria-hidden="true" />
      <span className="building-name">{buildingType}</span>
      <span className="building-cost">{cost}g</span>
    </button>
  )
}
```

### Specific Files to Study:
- `src/components/` - Component implementation patterns
- `docs/pages/` - Documentation structure
- `src/internal/test/` - Testing utilities
- `src/themes/` - Theming approach

---

## 6. **excalidraw/excalidraw**
**Repository:** https://github.com/excalidraw/excalidraw  
**Stars:** ~80k+ | **Tech:** React, TypeScript, Canvas, PWA

### Why Reference This?
Excalidraw is a production-grade canvas-based application with excellent performance, offline support, and collaborative features. Many patterns translate directly to game development.

### Key Learnings for FableRealm:
- **Canvas optimization**: High-performance rendering techniques
- **State management**: Complex state handling for interactive applications
- **Undo/Redo**: Command pattern implementation
- **Keyboard shortcuts**: Comprehensive keyboard navigation
- **Export/Import**: Save state serialization and restoration
- **PWA implementation**: Real-world offline-first architecture

### What to Implement:
```typescript
// Command pattern for undo/redo
interface Command {
  execute(): void
  undo(): void
}

class PlaceBuildingCommand implements Command {
  constructor(
    private grid: Grid,
    private position: { x: number; y: number },
    private buildingType: BuildingType,
    private previousState: TileData
  ) {}

  execute() {
    this.grid[this.position.y][this.position.x] = {
      ...this.previousState,
      buildingType: this.buildingType
    }
  }

  undo() {
    this.grid[this.position.y][this.position.x] = this.previousState
  }
}

// Command history manager
class CommandHistory {
  private history: Command[] = []
  private currentIndex = -1

  execute(command: Command) {
    command.execute()
    this.history = this.history.slice(0, this.currentIndex + 1)
    this.history.push(command)
    this.currentIndex++
  }

  undo() {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].undo()
      this.currentIndex--
    }
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      this.history[this.currentIndex].execute()
    }
  }
}
```

### Specific Files to Study:
- `src/scene/` - Canvas rendering optimization
- `src/actions/` - Command pattern implementation
- `src/history/` - Undo/redo implementation
- `public/sw.js` - Service worker implementation
- `package.json` - Build and deployment scripts

---

## Implementation Priority Matrix

| Repository | Architecture | Testing | Performance | PWA | TypeScript | Priority |
|-----------|-------------|---------|-------------|-----|------------|----------|
| bulletproof-react | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | HIGH |
| react-three-fiber | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | HIGH |
| pwa-training | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | HIGH |
| nodebestpractices | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | MEDIUM |
| shoelace | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | MEDIUM |
| excalidraw | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | HIGH |

---

## Action Items

### Week 1-2: Architecture & Testing
1. Study `bulletproof-react` structure and adapt feature-based organization
2. Review `react-three-fiber` examples for performance patterns
3. Set up testing infrastructure based on `bulletproof-react` patterns

### Week 3-4: PWA & Performance
4. Implement PWA features from `pwa-training` examples
5. Optimize Three.js rendering using `react-three-fiber` patterns
6. Add performance monitoring

### Week 5-6: Quality & Polish
7. Implement error handling patterns from `nodebestpractices`
8. Improve accessibility following `shoelace` examples
9. Add undo/redo system inspired by `excalidraw`

---

## Conclusion

These repositories represent the best of modern web development practices. By studying and adapting patterns from these projects, FableRealm can achieve:
- **Production-grade architecture** (bulletproof-react, excalidraw)
- **Optimal 3D performance** (react-three-fiber)
- **True PWA capabilities** (pwa-training, excalidraw)
- **Robust testing** (bulletproof-react, nodebestpractices)
- **Excellent accessibility** (shoelace)
- **Advanced features** (excalidraw)

Start with the HIGH priority repositories and incrementally adopt patterns that fit FableRealm's specific needs.
