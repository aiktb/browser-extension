---
title: Use Custom tRPC v11 Implementation for Type-Safe Extension Messaging
status: Accepted
updated: 2025-08-18
template_version: 0a0c1d117007629df8ec61b91dc344c0bca5649c
template_source: docs/architecture/_templates/decision.md
---

## Context

WXT browser extension requires type-safe messaging between different execution contexts (background script, content scripts, popup, options page). Native Chrome messaging APIs (`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`) lack type safety, leading to runtime errors and poor developer experience.

Research in @docs/architecture/rfc/2025-08-11-type-safe-messaging-patterns.md compared the following options:

1. @webext-core/messaging - Lightweight with excellent TypeScript support
2. trpc-chrome - Only supports tRPC v10, stagnant maintenance
3. trpc-browser - Only supports tRPC v10, relatively active maintenance
4. Custom tRPC v11 implementation - Latest features with minimal bundle size

Currently available tRPC-based solutions (trpc-chrome, trpc-browser) only support tRPC v10 with unclear v11 migration paths. These libraries also have relatively large bundle sizes of 30-40KB.

## Decision

**We will use a custom tRPC v11 implementation**

### Rationale

We chose to build a custom implementation referencing webext-core/messaging's lightweight architecture patterns while leveraging tRPC v11's latest features and Zod for complete type safety because:

- It provides access to tRPC v11's latest optimizations and features without waiting for external libraries
- It enables full control over bundle size through modular architecture and tree-shaking
- It aligns with our goal of maintaining minimal dependencies while ensuring type safety
- The trade-off of initial development effort (2-3 days) is acceptable given long-term benefits

## Consequences

### Positive

- **Latest technology stack**: Leverage tRPC v11's newest features and optimizations
- **Bundle size control**: Continuous monitoring via tools like Vite/webpack Bundle Analyzer with potential for smaller size than existing libraries
- **Complete type safety**: TypeScript type inference with Zod runtime validation
- **Tree-shakeable**: Modular architecture enables optimal bundling
- **Full control**: Complete control over implementation details
- **Future extensibility**: Easy to extract as library or deploy to other projects
- **tRPC v11+ compatibility**: No dependency on external library updates

### Negative

- **Initial development effort** - Requires 2-3 days of development (mitigated by clear architecture design)
- **Maintenance responsibility** - Need to maintain and test custom implementation (mitigated by comprehensive test coverage)
- **Lack of community support** - No community support compared to existing libraries (mitigated by clean, documented code)
- **Potential bug risk** - Unknown bugs in custom implementation (mitigated by gradual rollout and testing)

## Alternatives Considered

### @webext-core/messaging

**Rejected because**: Cannot leverage tRPC's advanced features (middleware, batching, subscriptions). Given future project requirements, we need a more flexible solution.

### trpc-browser

**Rejected because**: Only supports tRPC v10 with large bundle size (30-40KB) and unclear v11 migration path. As of August 12, 2025, peer dependencies are locked to v10 with no public roadmap or issues for v11 support.

### trpc-chrome

**Rejected because**: Only supports v10 (v11 support pending - see jlalmes/trpc-chrome#17). Maintenance risk remains until issue is resolved.

## Implementation Guidelines

### Technologies to Use

**IMPORTANT: These are the ONLY technologies that should be used for this implementation**

- **`@trpc/server`**: v11.x - Server-side RPC processing, router definitions, procedure execution
  - Installation: `pnpm add @trpc/server@^11.0.0`
  - Configuration: Used in background script for defining API endpoints

- **`@trpc/client`**: v11.x - Client-side RPC calls, proxy client creation
  - Installation: `pnpm add @trpc/client@^11.0.0`
  - Configuration: Used in popup and content scripts for API consumption

- **`zod`**: v3.x - Schema definitions, runtime validation, TypeScript type inference
  - Installation: `pnpm add zod@^3.0.0`
  - Configuration: Define schemas for all message types and API contracts

### Technologies NOT to Use

**CRITICAL: Do NOT use these technologies under any circumstances**

- **trpc-chrome**: Use our custom implementation instead (v10 only, no v11 support)
- **trpc-browser**: Use our custom implementation instead (v10 only, bundle size concerns)
- **@webext-core/messaging**: Use our tRPC-based solution for advanced features
- **Direct chrome.runtime messaging**: Always use the type-safe tRPC layer

### Architecture Overview

Implementation structure in `lib/messaging/`:

1. **Core Messaging Layer** (`core.ts`)
   - Generic messaging foundation based on webext-core patterns
   - Message ID generation and routing
   - Error serialization/deserialization
   - Listener design depends on implementation (single or multiple)

2. **tRPC v11 Integration Layer** (`trpc.ts`)
   - tRPC v11 server/client configuration
   - Custom link implementation
   - Type inference preservation
   - Validator integration (bundle contribution depends on APIs used and tree-shaking)

3. **Extension-Specific Features** (`adapters/`)
   - Tab messaging support
   - Context preservation
   - Subscription handling
   - Development-time HMR consideration (not guaranteed)

### Responsibility Separation

**External Dependencies:**

- `@trpc/server`: Server-side (background script) RPC processing, router definition, procedure execution
- `@trpc/client`: Client-side (popup, content scripts) RPC calls, proxy client creation
- `zod`: I/O schema definition, runtime type validation, TypeScript type auto-inference

**lib/messaging Responsibilities:**

- `core.ts`: Generic messaging system, message routing implementation
- `trpc.ts`: tRPC-browser messaging integration, custom link implementation, Observable pattern for async processing
- `adapters/`: Framework-specific browser API implementations (WXT, Chrome, webextension-polyfill)

This design ensures single responsibility principle, improving testability and maintainability.

## References

### Primary Sources

- **Research Document**: @docs/architecture/rfc/2025-08-11-type-safe-messaging-patterns.md
- **Related Decision**: N/A

### External References

- webext-core messaging implementation: https://github.com/aklinker1/webext-core
- trpc-browser GitHub: https://github.com/janek26/trpc-browser
- tRPC v11 documentation: https://trpc.io/docs/v11
- Chrome Extension Messaging API: https://developer.chrome.com/docs/extensions/develop/concepts/messaging
- tRPC Subscriptions (v11 SSE): https://trpc.io/docs/server/subscriptions
- WXT Messaging Guide: https://wxt.dev/guide/essentials/messaging

### Update History

- 2025-08-11: Initial decision documented
- 2025-08-18: Reformatted using new decision template

🔄 Revisit this ADR once tRPC v11 support is released in either adapter (on resolution of jlalmes/trpc-chrome#17 or when trpc-browser publishes v11 compatibility).
