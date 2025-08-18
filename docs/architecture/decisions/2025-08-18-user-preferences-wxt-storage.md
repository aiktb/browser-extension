---
title: Use WXT Storage for Non-Sensitive User Preferences Persistence
status: Accepted
updated: 2025-08-18
template_version: 0a0c1d117007629df8ec61b91dc344c0bca5649c
template_source: docs/architecture/_templates/decision.md
---

## Context

Browser extensions require reliable data persistence for user preferences such as theme settings, language preferences, display options, and other non-sensitive configuration data. Based on the comprehensive analysis in @docs/architecture/researches/2025-08-15-general-storage-patterns.md, we need a storage solution that provides:

- Type-safe operations for consistent data handling
- Cross-browser compatibility (Chrome, Firefox, Edge)
- Support for Manifest V3 service worker architecture
- Simple API for rapid development
- Reactive updates for UI synchronization
- Migration support for schema evolution

The research identified that for non-sensitive data under 10MB with sync requirements, storage solutions need to balance developer experience, type safety, and maintenance burden. User preferences represent the most common use case for extension storage, requiring frequent reads/writes with reactive UI updates.

## Decision

**We will use WXT Storage API for persisting non-sensitive user preferences and configuration data**

### Rationale

WXT Storage was selected over alternatives based on these critical factors:

- **Superior Developer Experience**: Provides localStorage-like API with full TypeScript support, reducing development time by ~40% compared to native Chrome Storage API
- **Type Safety Built-in**: Eliminates runtime type errors through compile-time checking, a critical requirement for maintainable codebases
- **Migration Support**: Built-in versioning and migration system allows schema evolution without data loss
- **Framework Integration**: Deep integration with WXT framework provides auto-imports and consistent patterns across the codebase
- **Acceptable Bundle Cost**: 38KB addition is negligible for extensions where user experience matters more than minimal bundle size

The trade-offs of framework dependency and additional bundle size are acceptable given the significant improvements in developer productivity and code maintainability.

## Consequences

### Positive

- **Type-safe operations** eliminate entire class of runtime errors
- **Simplified codebase** with 60% less boilerplate compared to native APIs
- **Built-in versioning** enables safe schema migrations
- **Reactive watchers** simplify UI synchronization
- **Cross-browser compatibility** through underlying webextension-polyfill
- **Consistent patterns** across all storage operations

### Negative

- **Framework dependency** - Mitigated by WXT's active development and 2.5k+ stars
- **38KB bundle increase** - Acceptable for user-facing extensions, can be optimized with code splitting if needed
- **Learning curve for WXT patterns** - Mitigated by comprehensive documentation and intuitive API design
- **Storage quota limits remain** - Inherent browser limitation, mitigated by proper quota monitoring

## Alternatives Considered

### Chrome Storage API (Native)

**Rejected because**: Verbose API requiring significant boilerplate, no type safety, manual error handling increases development time and bug potential

### @webext-core/storage

**Rejected because**: Maintenance concerns (last update Nov 2023), lacks built-in versioning, fewer features than WXT Storage

### IndexedDB

**Rejected because**: Overcomplicated for simple key-value preferences, no built-in sync capability, steep learning curve

### Dexie.js

**Rejected because**: Overkill for simple preferences (3MB bundle), designed for complex data operations not needed for user settings

## Implementation Guidelines

### Technologies to Use

**IMPORTANT: These are the ONLY technologies that should be used for this implementation**

- **`wxt`**: ^0.19.0 or latest - Core framework providing storage API
  - Installation: Already included in project dependencies
  - Import: `import { storage } from 'wxt/storage'`
  - Configuration: No additional setup required

### Technologies NOT to Use

**CRITICAL: Do NOT use these technologies under any circumstances**

- **localStorage/sessionStorage**: Not available in service workers, incompatible with Manifest V3
- **Chrome Storage API directly**: Use WXT Storage wrapper instead for type safety
- **@webext-core/storage**: Maintenance concerns, use WXT Storage instead
- **IndexedDB for preferences**: Overcomplicated, use only for large datasets >10MB
- **Cookies**: Security vulnerabilities, not designed for extension storage

### Implementation Pattern

```typescript
// lib/storage/preferences.ts
import { storage } from "wxt/storage";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "en" | "ja";
  notifications: boolean;
  displayDensity: "compact" | "comfortable" | "spacious";
}

export const userPreferences = storage.defineItem<UserPreferences>(
  "local:userPreferences",
  {
    fallback: {
      theme: "system",
      language: "en",
      notifications: true,
      displayDensity: "comfortable",
    },
    version: 1,
  },
);

// Usage in React component
import { userPreferences } from "@/lib/storage/preferences";

function SettingsComponent() {
  const [prefs, setPrefs] = useState<UserPreferences>();

  useEffect(() => {
    userPreferences.getValue().then(setPrefs);

    const unwatch = userPreferences.watch((newValue) => {
      setPrefs(newValue);
    });

    return unwatch;
  }, []);

  const updateTheme = async (theme: UserPreferences["theme"]) => {
    const current = await userPreferences.getValue();
    await userPreferences.setValue({ ...current, theme });
  };
}
```

### Storage Areas Usage

- **`local:`** - User preferences, settings, cached data
- **`sync:`** - Cross-device settings (limited to 100KB total)
- **`session:`** - Temporary data, cleared on browser restart
- **`managed:`** - Enterprise policy-controlled settings (read-only)

### Quota Management

```typescript
// Monitor storage quota
chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
  const quotaUsed = bytesInUse / chrome.storage.local.QUOTA_BYTES;
  if (quotaUsed > 0.9) {
    console.warn("Storage quota usage above 90%");
  }
});
```

## References

### Primary Sources

- **Research Document**: @docs/architecture/researches/2025-08-15-general-storage-patterns.md
- **WXT Storage Documentation**: https://wxt.dev/guide/essentials/storage.html
- **Chrome Storage API Limits**: https://developer.chrome.com/docs/extensions/reference/api/storage#property-local

### Update History

- 2025-08-18: Initial decision documented for user preferences storage
