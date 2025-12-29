# FableRealm Enhancement Implementation Roadmap

**Version:** 2.0 → 3.0  
**Timeline:** 6-8 weeks  
**Goal:** Transform FableRealm into a production-grade, testable, performant PWA

---

## Overview

This roadmap provides a phased approach to implementing all recommendations from the codebase audit. Each phase builds on the previous one, ensuring stability and incremental progress.

---

## Phase 1: Foundation (Week 1-2)

**Goal:** Establish quality foundations with testing, linting, and type safety

### Priority: CRITICAL

#### 1.1 Testing Infrastructure
- [ ] Install Vitest, React Testing Library, jsdom
- [ ] Create `vitest.config.ts` with proper configuration
- [ ] Create `src/setupTests.ts` with Testing Library matchers
- [ ] Add test scripts to package.json
- [ ] Write initial tests for SimulationService (5-10 test cases)
- [ ] Write initial tests for ActionService (5-10 test cases)
- [ ] Achieve 30%+ initial code coverage

**GitHub Agent Prompt:** Use "Agent Prompt 1: Testing Infrastructure Setup"

**Success Criteria:**
- ✅ `npm run test` passes with 0 errors
- ✅ Coverage report generated successfully
- ✅ Core simulation logic has test coverage
- ✅ CI can run tests (prepare for Phase 2)

**Time Estimate:** 3-4 days

---

#### 1.2 Code Quality Tooling
- [ ] Install ESLint with TypeScript and React plugins
- [ ] Install Prettier with config
- [ ] Create `.eslintrc.json` and `.prettierrc`
- [ ] Configure Husky with pre-commit hooks
- [ ] Configure lint-staged for staged files only
- [ ] Add lint/format scripts to package.json
- [ ] Fix linting errors in existing code
- [ ] Format all files with Prettier

**GitHub Agent Prompt:** Use "Agent Prompt 3: Code Quality & Linting Setup" (Part 2-4)

**Success Criteria:**
- ✅ `npm run lint` passes with 0 errors (warnings OK)
- ✅ `npm run format:check` passes
- ✅ Pre-commit hook prevents committing invalid code
- ✅ All files formatted consistently

**Time Estimate:** 2-3 days

---

#### 1.3 TypeScript Strict Mode
- [ ] Enable strict mode in `tsconfig.json`
- [ ] Enable additional strict flags (noUncheckedIndexedAccess, etc.)
- [ ] Fix type errors in services layer (SimulationService, ActionService, etc.)
- [ ] Fix type errors in components (App.tsx, IsoMap.tsx, etc.)
- [ ] Add return types to all functions
- [ ] Remove all `any` types
- [ ] Add null checks where needed

**GitHub Agent Prompt:** Use "Agent Prompt 3: Code Quality & Linting Setup" (Part 1)

**Success Criteria:**
- ✅ `npm run type-check` passes with 0 errors
- ✅ No `any` types in codebase
- ✅ All functions have explicit return types
- ✅ No implicit type coercion

**Time Estimate:** 2-3 days

**⚠️ Risk:** May uncover hidden bugs. Test thoroughly after fixes.

---

#### 1.4 CI Pipeline Setup
- [ ] Create `.github/workflows/ci.yml`
- [ ] Configure jobs: lint, type-check, test, build
- [ ] Run on push to main and PRs
- [ ] Add status badges to README
- [ ] Configure branch protection rules (require CI to pass)

**Success Criteria:**
- ✅ CI runs on all PRs
- ✅ CI fails on lint/type/test errors
- ✅ Badge shows build status in README
- ✅ Main branch protected

**Time Estimate:** 1 day

---

### Phase 1 Deliverables
- ✅ Testing infrastructure with 30%+ coverage
- ✅ ESLint + Prettier + Husky configured
- ✅ TypeScript strict mode enabled
- ✅ CI pipeline running on all PRs

**Total Time: 8-11 days**

---

## Phase 2: PWA Implementation (Week 3)

**Goal:** Transform app into a true Progressive Web App with offline support

### Priority: HIGH

#### 2.1 Service Worker & Manifest
- [ ] Install `vite-plugin-pwa`
- [ ] Configure Vite PWA plugin in `vite.config.ts`
- [ ] Create `public/manifest.json` with proper metadata
- [ ] Generate app icons (192x192, 512x512)
- [ ] Update `index.html` with manifest link and meta tags
- [ ] Test service worker registration in browser
- [ ] Test caching strategies work correctly

**GitHub Agent Prompt:** Use "Agent Prompt 2: PWA Implementation"

**Success Criteria:**
- ✅ Lighthouse PWA score > 90
- ✅ App installable on desktop and mobile
- ✅ Service worker caches static assets
- ✅ Offline mode shows cached UI

**Time Estimate:** 2-3 days

---

#### 2.2 Offline Support
- [ ] Create `src/hooks/useOnlineStatus.ts` hook
- [ ] Add offline detection to App.tsx
- [ ] Show offline banner in UI when disconnected
- [ ] Disable AI features (Gemini) when offline
- [ ] Test game state saves correctly when offline
- [ ] Test game loads from cache when offline
- [ ] Add offline indicator to UIOverlay

**Success Criteria:**
- ✅ Game playable offline (no AI features)
- ✅ Clear offline indicator shown to user
- ✅ Save/load works offline
- ✅ Smooth transition between online/offline

**Time Estimate:** 1-2 days

---

#### 2.3 Install Prompt
- [ ] Create `src/hooks/useInstallPrompt.ts`
- [ ] Add install button to UIOverlay
- [ ] Show prompt when app is installable
- [ ] Hide prompt after installation
- [ ] Track installation state in localStorage
- [ ] Add analytics event for installations (optional)

**Success Criteria:**
- ✅ Install button appears when installable
- ✅ Clicking button prompts installation
- ✅ Button hides after install
- ✅ Works on Chrome, Edge, Safari

**Time Estimate:** 1 day

---

### Phase 2 Deliverables
- ✅ Full PWA with service worker and manifest
- ✅ Offline mode functional
- ✅ Install prompt working
- ✅ Lighthouse PWA score > 90

**Total Time: 4-6 days**

---

## Phase 3: Performance Optimization (Week 4)

**Goal:** Optimize 3D rendering for larger cities and better FPS

### Priority: HIGH

#### 3.1 Three.js Instancing
- [ ] Analyze current rendering performance (FPS, draw calls)
- [ ] Create `components/3d/InstancedBuildings.tsx` component
- [ ] Group buildings by type in IsoMap
- [ ] Render each group as InstancedMesh
- [ ] Handle dynamic updates (add/remove buildings)
- [ ] Implement raycasting for instance selection
- [ ] Test with large city (20x20 grid, 300+ buildings)
- [ ] Measure performance improvement

**GitHub Agent Prompt:** Use "Agent Prompt 4: Performance Optimization - Three.js Instancing"

**Success Criteria:**
- ✅ 2-3x FPS improvement for large cities
- ✅ Draw calls reduced by 80%+
- ✅ Selection and hover still work
- ✅ No visual regressions

**Time Estimate:** 3-4 days

---

#### 3.2 Code Splitting & Lazy Loading
- [ ] Lazy load IsoMap component
- [ ] Lazy load WizardConsole component
- [ ] Lazy load AdvisorPanel component
- [ ] Add Suspense boundaries with loading indicators
- [ ] Measure bundle size before/after
- [ ] Test all lazy-loaded components work correctly

**Success Criteria:**
- ✅ Initial bundle size reduced by 20%+
- ✅ Faster initial page load
- ✅ Smooth lazy loading with spinners
- ✅ No layout shift during loading

**Time Estimate:** 1-2 days

---

#### 3.3 React Performance Optimization
- [ ] Add React.memo to pure components
- [ ] Add useMemo to expensive calculations
- [ ] Add useCallback to event handlers passed to children
- [ ] Use React DevTools Profiler to identify slow renders
- [ ] Fix identified performance bottlenecks
- [ ] Add performance monitoring to WizardConsole

**Success Criteria:**
- ✅ Fewer unnecessary re-renders
- ✅ Profiler shows improved render times
- ✅ 60 FPS maintained during gameplay

**Time Estimate:** 1-2 days

---

### Phase 3 Deliverables
- ✅ Instanced rendering for buildings
- ✅ Code splitting reduces bundle size
- ✅ Optimized React rendering
- ✅ Performance stats in wizard console

**Total Time: 5-8 days**

---

## Phase 4: Documentation (Week 5)

**Goal:** Comprehensive documentation for developers and contributors

### Priority: MEDIUM

#### 4.1 API Documentation
- [ ] Add JSDoc to all service functions
- [ ] Create `API_DOCUMENTATION.md`
- [ ] Document all TypeScript types and interfaces
- [ ] Add code examples for common operations
- [ ] Create state flow diagrams (Mermaid)
- [ ] Document component props

**GitHub Agent Prompt:** Use "Agent Prompt 5: Documentation & Developer Experience" (Item 2, 9)

**Success Criteria:**
- ✅ All services have JSDoc comments
- ✅ API_DOCUMENTATION.md is complete
- ✅ Diagrams explain system architecture
- ✅ Code examples are tested and working

**Time Estimate:** 2-3 days

---

#### 4.2 Contribution Guidelines
- [ ] Create `CONTRIBUTING.md`
- [ ] Create `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Create `.github/ISSUE_TEMPLATE/bug_report.md`
- [ ] Create `.github/ISSUE_TEMPLATE/feature_request.md`
- [ ] Create `.github/ISSUE_TEMPLATE/question.md`
- [ ] Document coding standards
- [ ] Document PR process and review checklist

**GitHub Agent Prompt:** Use "Agent Prompt 5: Documentation & Developer Experience" (Item 1, 6, 7)

**Success Criteria:**
- ✅ Clear contribution process documented
- ✅ Issue templates guide reporters
- ✅ PR template ensures quality submissions

**Time Estimate:** 1-2 days

---

#### 4.3 Enhanced README & Guides
- [ ] Update README.md with badges, quick start, features
- [ ] Create `docs/BUILDING_GUIDE.md` (how to add buildings)
- [ ] Create `docs/ARCHITECTURE_DEEP_DIVE.md`
- [ ] Create `docs/TESTING_GUIDE.md`
- [ ] Create `CHANGELOG.md`
- [ ] Add screenshots and GIFs to README
- [ ] Document roadmap and planned features

**GitHub Agent Prompt:** Use "Agent Prompt 5: Documentation & Developer Experience" (Item 3, 4, 5, 8, 10)

**Success Criteria:**
- ✅ New contributors can start in <30 minutes
- ✅ All major features documented
- ✅ Architecture is well-explained
- ✅ Testing guide helps developers write tests

**Time Estimate:** 2-3 days

---

### Phase 4 Deliverables
- ✅ Complete API documentation
- ✅ Contribution guidelines and templates
- ✅ Enhanced README and guides
- ✅ Comprehensive developer documentation

**Total Time: 5-8 days**

---

## Phase 5: Advanced Features (Week 6)

**Goal:** Enhanced testing, security, and developer experience

### Priority: MEDIUM

#### 5.1 Expanded Test Coverage
- [ ] Write tests for remaining services (GeminiService, SaveService, SoundService)
- [ ] Write tests for UI components (UIOverlay, StartScreen, AdvisorPanel)
- [ ] Write integration tests for App.tsx
- [ ] Mock Gemini API for AI tests
- [ ] Mock localStorage for save tests
- [ ] Achieve 70%+ code coverage

**Success Criteria:**
- ✅ Coverage > 70% on services
- ✅ Coverage > 60% on components
- ✅ All critical paths tested
- ✅ Tests are maintainable and readable

**Time Estimate:** 3-4 days

---

#### 5.2 Security Improvements
- [ ] Create `.env.example` for environment variables
- [ ] Move API keys to environment variables
- [ ] Add `.env` to `.gitignore`
- [ ] Document environment setup in README
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Add Content Security Policy headers (document for deployment)
- [ ] Add security section to CONTRIBUTING.md

**Success Criteria:**
- ✅ No hardcoded secrets in codebase
- ✅ `npm audit` shows 0 high/critical issues
- ✅ Environment variables documented
- ✅ CSP documented for deployment

**Time Estimate:** 1-2 days

---

#### 5.3 Accessibility Improvements
- [ ] Audit keyboard navigation
- [ ] Add keyboard shortcuts to documentation
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Add ARIA labels to all icon buttons
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Run Lighthouse accessibility audit
- [ ] Fix identified accessibility issues
- [ ] Add focus indicators to all interactive elements

**Success Criteria:**
- ✅ Lighthouse accessibility score > 90
- ✅ All features keyboard accessible
- ✅ Screen reader can navigate UI
- ✅ WCAG AA compliant

**Time Estimate:** 2-3 days

---

### Phase 5 Deliverables
- ✅ 70%+ test coverage
- ✅ Security hardened (no secrets, audited deps)
- ✅ Accessibility improved (a11y score > 90)

**Total Time: 6-9 days**

---

## Phase 6: Polish & Deploy (Week 7-8)

**Goal:** Final polish, deployment setup, and documentation

### Priority: LOW (Nice to have)

#### 6.1 Deployment Setup
- [ ] Create `.github/workflows/deploy.yml` for automatic deployment
- [ ] Configure deployment to Vercel/Netlify/GitHub Pages
- [ ] Set up environment variables in hosting platform
- [ ] Configure custom domain (if applicable)
- [ ] Test production build
- [ ] Add deployment documentation to README

**Success Criteria:**
- ✅ Automatic deployment on merge to main
- ✅ Production site accessible and working
- ✅ Environment variables configured
- ✅ Deployment documented

**Time Estimate:** 2-3 days

---

#### 6.2 Monitoring & Analytics
- [ ] Add Google Analytics or Plausible (optional)
- [ ] Add error tracking with Sentry (optional)
- [ ] Add performance monitoring
- [ ] Create monitoring dashboard
- [ ] Document monitoring setup

**Success Criteria:**
- ✅ Usage tracked (if analytics added)
- ✅ Errors reported and tracked
- ✅ Performance metrics collected

**Time Estimate:** 1-2 days

---

#### 6.3 Final Polish
- [ ] Run full test suite
- [ ] Run Lighthouse on all pages
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Fix any bugs discovered
- [ ] Update CHANGELOG with all changes
- [ ] Create GitHub release (v3.0.0)
- [ ] Write release notes

**Success Criteria:**
- ✅ All tests pass
- ✅ Lighthouse scores > 90 across the board
- ✅ Works on all major browsers
- ✅ Mobile experience is smooth
- ✅ Release notes are comprehensive

**Time Estimate:** 2-3 days

---

### Phase 6 Deliverables
- ✅ Automatic deployment pipeline
- ✅ Monitoring and analytics (optional)
- ✅ Production-ready release

**Total Time: 5-8 days**

---

## Summary Timeline

| Phase | Duration | Priority | Key Deliverables |
|-------|----------|----------|------------------|
| Phase 1: Foundation | 8-11 days | CRITICAL | Testing, linting, TypeScript strict, CI |
| Phase 2: PWA | 4-6 days | HIGH | Service worker, offline, install prompt |
| Phase 3: Performance | 5-8 days | HIGH | Instancing, code splitting, optimization |
| Phase 4: Documentation | 5-8 days | MEDIUM | API docs, guides, contribution guidelines |
| Phase 5: Advanced | 6-9 days | MEDIUM | Tests, security, accessibility |
| Phase 6: Polish | 5-8 days | LOW | Deployment, monitoring, release |
| **TOTAL** | **33-50 days** | | **6-8 weeks** |

---

## Resource Requirements

### Tools & Services
- GitHub Actions (CI/CD) - Free for public repos
- Vitest + RTL (Testing) - Free
- ESLint + Prettier (Quality) - Free
- Vercel/Netlify (Hosting) - Free tier available
- Sentry (Error tracking) - Optional, free tier available

### Skills Needed
- TypeScript proficiency
- React + Three.js experience
- Testing experience (unit + integration)
- PWA knowledge (service workers, manifest)
- Performance optimization skills
- Documentation writing

---

## Risk Management

### High Risks
1. **TypeScript Strict Mode**: May uncover many type errors
   - **Mitigation**: Allocate extra time, fix incrementally
   
2. **Instancing Refactor**: Complex change affecting core rendering
   - **Mitigation**: Thorough testing, feature flag, easy rollback

3. **Breaking Changes**: Changes may break existing saves
   - **Mitigation**: Version saves, migration script

### Medium Risks
4. **Test Coverage**: May be time-consuming to reach 70%
   - **Mitigation**: Prioritize critical paths, skip trivial code

5. **Browser Compatibility**: PWA features vary by browser
   - **Mitigation**: Test on all major browsers, document limitations

### Low Risks
6. **Performance Regressions**: Optimization may introduce bugs
   - **Mitigation**: Benchmark before/after, comprehensive testing

---

## Success Metrics

### Technical Metrics
- ✅ Test coverage > 70%
- ✅ TypeScript strict mode: 0 errors
- ✅ Lighthouse scores > 90 (Performance, PWA, Accessibility, Best Practices)
- ✅ CI pipeline: 100% passing on main branch
- ✅ FPS: 60 FPS maintained for cities up to 20x20
- ✅ Bundle size: Reduced by 20% from current

### Developer Experience Metrics
- ✅ New contributor onboarding time < 30 minutes
- ✅ PR review cycles reduced (clear guidelines)
- ✅ Code quality issues caught by pre-commit hooks
- ✅ Documentation completeness: 100% of services documented

### User Experience Metrics
- ✅ App installable on desktop and mobile
- ✅ Offline mode functional
- ✅ Smooth gameplay (no frame drops)
- ✅ Accessible to keyboard and screen reader users

---

## Rollout Strategy

### Incremental Rollout
1. Create feature branches for each phase
2. Merge to `develop` branch after each phase completion
3. Test thoroughly on `develop`
4. Merge to `main` only after full phase validation
5. Tag releases for each major milestone

### Communication
- Update GitHub project board with progress
- Weekly status updates in team meetings
- Document blockers and decisions in GitHub issues
- Celebrate milestones with release notes

---

## Next Steps

### Immediate Actions (This Week)
1. Review this roadmap with team
2. Adjust priorities based on team feedback
3. Create GitHub project board with roadmap tasks
4. Start Phase 1: Testing Infrastructure Setup

### Week 1 Kickoff
1. Run "Agent Prompt 1: Testing Infrastructure Setup"
2. Set up first test files
3. Configure CI pipeline
4. Begin TypeScript strict mode migration

---

## Appendix: Quick Reference

### Key Documents Created
- `CODEBASE_AUDIT.md` - Detailed audit findings
- `RECOMMENDED_REPOSITORIES.md` - 6 repos to reference
- `GITHUB_AGENT_PROMPTS.md` - 5 agent prompts + 1 Copilot prompt
- `IMPLEMENTATION_ROADMAP.md` - This document

### GitHub Agent Prompts
1. Testing Infrastructure Setup
2. PWA Implementation
3. Code Quality & Linting Setup
4. Performance Optimization - Three.js Instancing
5. Documentation & Developer Experience

### GitHub Copilot Configuration
- `.github/copilot-instructions.md` - IDE-wide coding standards

### Reference Repositories
1. alan2207/bulletproof-react - Architecture patterns
2. pmndrs/react-three-fiber - Three.js + React
3. GoogleChromeLabs/pwa-training - PWA best practices
4. goldbergyoni/nodebestpractices - JavaScript/TS quality
5. shoelace-style/shoelace - Accessibility patterns
6. excalidraw/excalidraw - Canvas app architecture

---

**Last Updated:** December 29, 2024  
**Version:** 1.0  
**Status:** Ready for Implementation
