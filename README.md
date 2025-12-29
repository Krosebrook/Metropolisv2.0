
# FableRealm: PWA Kingdom Architect

FableRealm is a production-grade fairytale city-builder and SaaS simulation built with React, Three.js, and Google Gemini.

## 🌟 Key Features
- **3D Isometric Engine**: High-performance rendering via `@react-three/fiber`.
- **AI Oracle**: Integration with Gemini-3 Flash for dynamic quests and herald news.
- **Wizard's Grimoire (Terminal)**: A developer console accessible via the backtick (`) key for state scrying and ethereal debugging.
- **PWA Ready**: Offline session persistence and standalone installation support.
- **Advanced Simulation**: Multi-factor happiness metrics including Arcane Safety, Wisdom Reach, and Industrial Proximity.

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS
- **Graphics**: Three.js, R3F
- **Intelligence**: Google GenAI SDK (Gemini-3 Flash)
- **Persistence**: LocalStorage with Profile-based Slotting

## 🕹 Terminal Commands
Access the console using the `~` or `` ` `` key.
- `scry [query]`: Ask the Royal Wizard for lore or strategic advice.
- `gift [amount]`: Infuse the treasury with gold.
- `stats`: Export the current kingdom state as JSON.
- `rain [type]`: Control the meteorological spirits (clear, rain, storm).

---

## 📋 Audit & Enhancement Documentation

A comprehensive codebase audit has been completed with actionable recommendations:

- **[AUDIT_SUMMARY.md](./AUDIT_SUMMARY.md)** - Quick overview and navigation guide
- **[CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md)** - Detailed analysis with recommendations
- **[RECOMMENDED_REPOSITORIES.md](./RECOMMENDED_REPOSITORIES.md)** - 6 exemplary projects to learn from
- **[GITHUB_AGENT_PROMPTS.md](./GITHUB_AGENT_PROMPTS.md)** - 5 specialized prompts + Copilot config
- **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - 6-8 week phased plan

### Key Recommendations
1. ✅ Add comprehensive testing (Vitest + React Testing Library)
2. ✅ Implement true PWA features (service worker, manifest)
3. ✅ Enable TypeScript strict mode
4. ✅ Add code quality tools (ESLint, Prettier, Husky)
5. ✅ Optimize 3D rendering with instancing
6. ✅ Enhance documentation and developer experience

**Current Rating:** ⭐⭐⭐⭐ (4/5) - Strong foundation, ready for production enhancements

See [AUDIT_SUMMARY.md](./AUDIT_SUMMARY.md) to get started.
