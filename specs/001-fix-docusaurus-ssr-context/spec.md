# Specification: Fix Docusaurus SSR Context Provider Errors

**Feature**: 001-fix-docusaurus-ssr-context
**Status**: Ready for Development
**Created**: 2025-12-18
**Priority**: P0 (Blocks Production)

---

## Problem Statement

### Current Behavior

The Docusaurus build fails with these errors:
1. `ReferenceError: window is not defined` (during static site generation)
2. `Error: useAuth must be used within an AuthProvider` (in specific contexts)
3. Build cannot complete: `npm run build` exits with error code

### Root Cause

React Context providers (`ChatProvider`, `AuthProvider`) are rendered directly in `Root.tsx`, which is executed during Docusaurus's static site generation (SSG) phase. This phase runs in a Node.js environment where:
- Browser APIs like `window` and `document` don't exist
- React hooks can't access DOM or browser context
- `useDocusaurusContext()` has no Docusaurus context during build

### Impact

- Production builds fail completely
- Deployment to Vercel blocked
- Users cannot access the application
- No static site is generated

---

## Requirements

### Functional Requirements

**FR-001:** Application must build successfully without errors
- Test: `npm run build` exits with code 0
- Acceptance: No errors logged during build

**FR-002:** AuthProvider must only render after client hydration
- Test: useAuth() hook available in components
- Acceptance: `npm run dev` loads without "useAuth must be used within" errors

**FR-003:** ChatProvider must only render after client hydration
- Test: useChat() hook available in chat components
- Acceptance: Text selection button works after page loads

**FR-004:** Static content must render without providers
- Test: Root.tsx BrowserOnly fallback renders AppContent
- Acceptance: Server-side rendering completes for all pages

**FR-005:** Client-side providers must wrap all children after hydration
- Test: All components can call useAuth() and useChat()
- Acceptance: Chat and auth functionality work without errors

**FR-006:** Browser APIs must be isolated to client-only code
- Test: No access to `window` during build
- Acceptance: `npm run build` has no "window is not defined" errors

**FR-007:** Environment variables must be accessible at runtime
- Test: AuthProvider reads BETTER_AUTH_URL from Docusaurus config
- Acceptance: Production deployment uses correct auth service URL

### Non-Functional Requirements

**NFR-001: Build Performance**
- Requirement: Build time ≤ 60 seconds
- Measurement: `time npm run build`
- Acceptance: No regression from current build time

**NFR-002: First Contentful Paint (FCP)**
- Requirement: FCP < 2 seconds (3G throttle)
- Measurement: Lighthouse, browser DevTools
- Acceptance: No degradation post-deployment

**NFR-003: Bundle Size**
- Requirement: No increase in client JavaScript bundle
- Measurement: `npm run build` artifact sizes
- Acceptance: Bundle size maintained or reduced

**NFR-004: Backwards Compatibility**
- Requirement: No breaking changes to component APIs
- Measurement: Existing component usage continues to work
- Acceptance: All components that call useAuth() and useChat() work without modification

---

## Configuration Reference

### Docusaurus Configuration

**File**: `docusaurus.config.ts`

```typescript
const config: Config = {
  customFields: {
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
  },
};
```

**Required Environment Variables:**
| Variable | Required | Format | Example | Notes |
|----------|----------|--------|---------|-------|
| `BETTER_AUTH_URL` | Yes | URL | `https://auth.example.com` | Auth service endpoint |
| `API_BASE_URL` | Yes | URL | `https://api.example.com` | API service endpoint |
| `VERCEL_URL` | No | Domain | `my-app.vercel.app` | Auto-set by Vercel |

### Provider Configuration

**AuthProvider (`src/components/AuthProvider.tsx`):**
```typescript
const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || DEV_AUTH_URL;
const apiBaseUrl = (siteConfig.customFields?.apiBaseUrl as string) || DEV_API_BASE_URL;
const frontendUrl = typeof window !== 'undefined' ? window.location.origin : (siteConfig.url || DEV_FRONTEND_URL);
```

**ChatProvider (`src/lib/ChatProvider.tsx`):**
- Uses browser APIs: `window.getSelection()`, `document.addEventListener()`
- Requires client-side rendering only

---

## Error Handling Matrix

### Error: "window is not defined"

| Error Code | Message | Cause | Resolution | Documentation |
|-----------|---------|-------|-----------|----------------|
| SSG-001 | `ReferenceError: window is not defined at ChatProvider.tsx:30` | ChatProvider accesses `window.getSelection()` during SSG | Move ChatProvider to RootClient (wrapped in BrowserOnly) | Section 3.1 |
| SSG-001 | `ReferenceError: window is not defined at Root.tsx:29` | Root.tsx accesses `window.location` during SSG | Use `typeof window !== 'undefined'` check OR use BrowserOnly wrapper | Section 3.2 |

### Error: "useAuth must be used within an AuthProvider"

| Error Code | Message | Cause | Resolution | Documentation |
|-----------|---------|-------|-----------|----------------|
| AUTH-001 | `Error: useAuth must be used within an AuthProvider` | Component calls useAuth() before AuthProvider renders | Verify AuthProvider wraps all auth-dependent components | Section 3.1 |
| AUTH-001 | Same error during static page generation | useAuth() called during SSG when AuthProvider not available | Wrap useAuth() calls in client-only code or BrowserOnly | Section 2.2 |

### Error: Hydration Mismatch

| Error Code | Message | Cause | Resolution | Documentation |
|-----------|---------|-------|-----------|----------------|
| HYD-001 | `Warning: Expected server HTML to contain...` | Server renders different DOM than client | Ensure identical rendering between BrowserOnly fallback and client | Section 4.3 |

---

## Architecture Design

### Component Hierarchy

**Before Fix (Fails During SSG):**
```
Root.tsx
  ├── ChatProvider (FAIL: window.getSelection() undefined)
  └── AuthProvider (FAIL: useDocusaurusContext() invalid)
      └── AppContent
          └── {children}
```

**After Fix (Safe for SSG):**
```
Root.tsx
  └── BrowserOnly
      ├── fallback: AppContent (SSG-only path)
      │   └── {children}
      └── children() → RootClient (Client-side path)
          ├── ChatProvider (OK: runs on client)
          └── AuthProvider (OK: runs on client)
              └── AppContent
                  └── {children}
```

### Data Flow

```
Build Phase (npm run build)
  1. Docusaurus runs React in Node.js
  2. Root.tsx executes
  3. BrowserOnly renders fallback → AppContent (no providers)
  4. Build completes without errors
  5. Static HTML generated

Runtime Phase (npm run dev / npm run serve)
  1. Browser receives static HTML (no providers active)
  2. React hydration begins
  3. BrowserOnly loads RootClient
  4. RootClient mounts ChatProvider + AuthProvider
  5. Providers initialize session and chat state
  6. useAuth() and useChat() hooks become available
```

---

## Implementation Specifications

### File 1: `/src/theme/RootClient.tsx` (New)

```typescript
'use client';

import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import { AuthProvider } from '../components/AuthProvider';

/**
 * RootClient - Client-only provider wrapper
 *
 * This component is only rendered after client hydration.
 * All browser APIs and React hooks are safe to use here.
 *
 * Provider Order:
 * 1. ChatProvider (must be outer to support useChat in any component)
 * 2. AuthProvider (provides user session context)
 * 3. Children (all pages/components wrapped by providers)
 */
export default function RootClient({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ChatProvider>
  );
}
```

**Contract:**
- Input: `children: React.ReactNode` - Pages and components to wrap
- Output: Provider tree wrapping children
- Guarantee: Only renders on client after hydration
- Browser APIs: Fully available
- React Hooks: All hooks allowed

---

### File 2: `/src/theme/Root.tsx` (Modified)

```typescript
import React from 'react';
import { BrowserOnly } from '@docusaurus/core/BrowserOnly';
import AppContent from './AppContent';

/**
 * Root - Main theme wrapper component
 *
 * Uses BrowserOnly to conditionally render:
 * - During SSG: Renders fallback (AppContent without providers)
 * - During client: Renders RootClient (AppContent with providers)
 *
 * This pattern ensures:
 * 1. No browser API calls during static generation
 * 2. No React hooks during SSG
 * 3. Providers available for client-side features
 * 4. No hydration mismatches
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <BrowserOnly
      fallback={
        // Rendered during SSG and initial server render
        <AppContent>
          {children}
        </AppContent>
      }
    >
      {() => {
        // Rendered after client hydration
        const RootClient = require('./RootClient').default;
        return (
          <RootClient>
            <AppContent>
              {children}
            </AppContent>
          </RootClient>
        );
      }}
    </BrowserOnly>
  );
}
```

**Contract:**
- Input: `children: React.ReactNode` - Docusaurus pages and content
- Output: Wrapped component tree with conditional provider rendering
- SSG Path: BrowserOnly fallback (no providers)
- Client Path: RootClient with providers
- Guarantee: Build succeeds, client functionality works

---

## Acceptance Criteria

### Build Acceptance

```bash
# Success criteria
npm run build
echo $?  # Exit code must be 0

# Verify no errors in output
npm run build 2>&1 | grep -i "error"  # Should return nothing
npm run build 2>&1 | grep "window is not defined"  # Should return nothing
npm run build 2>&1 | grep "useAuth must be used"  # Should return nothing

# Verify static files generated
test -d build/ && test -f build/index.html && echo "SUCCESS"
```

### Functionality Acceptance

```typescript
// Test: useAuth hook available after login
function TestAuth() {
  const { user, isAuthenticated } = useAuth();
  return <div>{isAuthenticated ? user.name : 'Not logged in'}</div>;
}
// Acceptance: Component renders user name without "useAuth must be used within" error

// Test: useChat hook available in chat components
function TestChat() {
  const { isChatOpen, openChat } = useChat();
  return <button onClick={openChat}>{isChatOpen ? 'Close' : 'Open'}</button>;
}
// Acceptance: Button renders and click handler works without errors

// Test: Text selection button appears
// Manual: Select text on page → button should appear after selection
// Acceptance: No console errors, button renders correctly
```

### Console Validation

```javascript
// After hydration, console should show:
// ✓ No "ReferenceError: window is not defined"
// ✓ No "useAuth must be used within an AuthProvider"
// ✓ No "useDocusaurusContext" errors
// ✓ Possible (optional) auth debug logs
// ✓ Session loaded successfully

// Do NOT see:
// ✗ Hydration mismatches
// ✗ "window is not defined"
// ✗ Provider context errors
```

---

## Testing Strategy

### Unit Tests

- AuthProvider hook initialization
- ChatProvider hook initialization
- useAuth() returns correct user data
- useChat() returns correct context

### Integration Tests

```bash
# Build test
npm run build

# Client test
npm run dev
# Manual: Log in, test chat, verify no errors

# Production test
npm run build && npm run serve
# Manual: Full functionality test in preview
```

### Deployment Test

```bash
# Push to Vercel staging
git push origin main

# Verify build succeeds on Vercel
vercel status

# Test authentication and chat on staging
# Manual: Full user workflow on production environment
```

---

## Rollout Plan

### Phase 1: Development Validation
- [ ] Create RootClient.tsx
- [ ] Update Root.tsx
- [ ] Run `npm run build` locally
- [ ] Run `npm run dev` locally
- [ ] Test authentication flow
- [ ] Test chat functionality

### Phase 2: Staging Deployment
- [ ] Commit changes
- [ ] Push to staging branch
- [ ] Verify Vercel deployment succeeds
- [ ] Run full test suite on staging
- [ ] Verify error logs are clean

### Phase 3: Production Deployment
- [ ] Merge to main branch
- [ ] Trigger production deployment
- [ ] Monitor error logs
- [ ] Verify user traffic flows normally
- [ ] Test critical paths

---

## Metrics and Monitoring

### Build Metrics

| Metric | Target | Current | Success |
|--------|--------|---------|---------|
| Build Success Rate | 100% | Failing | After deployment |
| Build Time | <60s | Unknown | After deployment |
| Error Count | 0 | >1 | After deployment |

### Runtime Metrics

| Metric | Target | Current | Success |
|--------|--------|---------|---------|
| Page Load Time (FCP) | <2s | ~1.5s | No regression |
| Auth Success Rate | 100% | ~50% (errors) | 100% post-fix |
| Chat Message Success | 100% | Fails (no auth) | 100% post-fix |
| Console Errors | 0 | >5 | 0 post-fix |

---

## Dependencies and Constraints

### Required Libraries

- `@docusaurus/core/BrowserOnly` - For SSG client-only code
- `react@18+` - For Context API and hooks
- `better-auth@latest` - For session management
- `docusaurus@3+` - For SSG pipeline

### Constraints

- Cannot remove or replace React Context pattern (API stability)
- Cannot break existing component APIs (backwards compatibility)
- Must support both development (`npm run dev`) and production builds
- Must work with Vercel deployment process

---

## Success Definition

**The fix is successful when:**

1. Build Succeeds
   - `npm run build` exits with code 0
   - No errors or warnings during build
   - Static files generated in `build/` directory

2. Client Functionality Works
   - `npm run dev` loads without errors
   - useAuth() hook returns user data
   - useChat() hook accessible in chat components
   - Text selection button appears

3. Production Ready
   - Vercel deployment succeeds
   - Session authentication works in production
   - Chat functionality available
   - No error rate increase in monitoring

4. No Regressions
   - Build time unchanged
   - Page load time unchanged
   - Bundle size unchanged
   - All existing features work

---

## References

- **Docusaurus Documentation**: https://docusaurus.io/docs/advanced/ssg
- **Context API Guide**: `/specs/00X-docusaurus-context-ssg-guide.md`
- **Implementation Plan**: `/specs/001-fix-docusaurus-ssr-context/plan.md`
- **Task Breakdown**: `/specs/001-fix-docusaurus-ssr-context/tasks.md`

---

**Document Version**: 1.0
**Last Updated**: 2025-12-18
**Owner**: Frontend Architecture
**Status**: Ready for Development
