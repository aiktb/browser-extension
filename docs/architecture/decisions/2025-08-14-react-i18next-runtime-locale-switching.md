---
title: Use react-i18next for Runtime Locale Switching
status: Accepted
updated: 2025-08-14
template_version: 0a0c1d117007629df8ec61b91dc344c0bca5649c
template_source: docs/architecture/_templates/decision.md
---

## Context

Our browser extension requires runtime language switching capability to allow users to change the interface language without modifying browser settings. Initial implementation attempted to use `@wxt-dev/i18n` with custom runtime switching logic, resulting in complex workarounds with runtime fetching of messages.json files, message passing complexity between background and content scripts, poor user experience requiring page reloads, and violation of browser extension architecture patterns.

Research revealed that the browser.i18n API (which `@wxt-dev/i18n` wraps) fundamentally does not support runtime locale changes by design. The language is determined solely by the browser or system language settings.

## Decision

**We will use `react-i18next` for internationalization in our browser extension**

### Rationale

This decision was made based on the following key factors:

- The native browser.i18n API fundamentally cannot support runtime language switching, which is a critical requirement for our user experience
- `react-i18next` provides a mature, battle-tested solution with extensive community support and documentation
- The trade-off of increased bundle size (~40KB) is acceptable compared to the complexity and maintenance burden of custom solutions
- Integration with React follows standard patterns, reducing the learning curve for developers
- Type-safe implementation with TypeScript ensures compile-time safety for translation keys

## Consequences

### Positive

- Full runtime language switching capability without page reloads
- Rich feature set including pluralization, interpolation, and formatting
- Consistent developer experience with standard React patterns
- Type-safe with TypeScript support for translation keys
- No complex workarounds or message passing required
- Mature ecosystem with extensive community support

### Negative

- Cannot localize manifest.json - extension name/description will be in default language (mitigated by clear app branding)
- Larger bundle size (~40KB gzipped) - mitigated by code splitting where possible
- Translations bundled in JavaScript rather than using browser's native localization - mitigated by lazy loading translations
- Slight performance overhead compared to native browser.i18n - mitigated by translation caching

## Alternatives Considered

### @wxt-dev/i18n (Native Browser i18n)

**Rejected because**: Cannot support runtime locale switching due to fundamental API limitations. The browser.i18n API only reads the browser/system language at extension initialization.

### Custom Hybrid Solution

**Rejected because**: Excessive complexity with runtime fetching of message files, performance issues from constant file I/O, maintenance burden of custom implementation, and violation of browser extension architecture patterns.

### Other i18n Libraries (vue-i18n, lingui)

**Rejected because**: They don't offer significant advantages over react-i18next for our React-based extension. `vue-i18n` is framework-specific to Vue, and `lingui` has a smaller community and less mature ecosystem.

## Implementation Guidelines

### Technologies to Use

**IMPORTANT: These are the ONLY technologies that should be used for this implementation**

- **`react-i18next`**: ^15.0.0 - React bindings for i18next framework
  - Installation: `pnpm add react-i18next i18next`
  - Configuration: Initialize in `lib/i18n.ts` with language detection from browser.storage.sync

- **`i18next`**: ^23.0.0 - Core internationalization framework
  - Installation: Included with react-i18next
  - Configuration: Configure with JSON resource bundles and fallback language

- **`browser.storage.sync`**: Native API - User language preference persistence
  - Installation: Built-in browser API
  - Configuration: Store as `{ language: SupportedLocale }` with type guards

### Technologies NOT to Use

**CRITICAL: Do NOT use these technologies under any circumstances**

- **@wxt-dev/i18n**: Cannot support runtime language switching
- **chrome.i18n / browser.i18n directly**: Use react-i18next instead for runtime switching
- **dangerouslySetInnerHTML for translations**: Use Trans component to prevent XSS
- **Untyped language codes**: Always use SupportedLocale type with validation

## References

### Primary Sources

- **Research Document**: @docs/architecture/rfc/2025-08-10-browser-extension-i18n-pattern.md
- **Legacy Decision**: @docs/architecture/decisions/2025-08-10-use-react-i18next-for-runtime-locale-switching.md

### Update History

- 2025-08-15: Change the reference path by changing the name of the research file from which it is referenced
- 2025-08-14: Initial decision documented using new template format
- 2025-08-10: Original decision documented (legacy format)
