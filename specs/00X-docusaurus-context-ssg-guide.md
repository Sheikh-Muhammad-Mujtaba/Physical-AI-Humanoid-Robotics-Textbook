# Docusaurus Context API and SSG Integration Guide

**Document Version**: 1.0
**Date**: 2025-12-18
**Status**: Reference Guide for Production Implementation
**Scope**: Session-based authentication with React Context API in Docusaurus static site generation

## Executive Summary

This document provides authoritative guidance on safely implementing React Context providers (AuthProvider, ChatProvider) within Docusaurus's static site generation (SSG) pipeline. It synthesizes official documentation from React, Next.js, and Docusaurus to eliminate the error: `"useAuth must be used within an AuthProvider"`.

### Core Problem Identified

Your project currently wraps providers in `Root.tsx`, which Docusaurus renders during SSG. Both `AuthProvider` and `ChatProvider` use React hooks (`useContext`, `useEffect`, `useDocusaurusContext`) and browser APIs (like `window.getSelection()` in ChatProvider), which are incompatible with server-side rendering.

---

## Section 1: React Context API Architecture for SSR/SSG

[Source: Next.js App Router - Server and Client Components v2025]

### 1.1 Fundamental Constraint

**Context is fundamentally a client-side feature.** It requires:
- React state management (client-only)
- Provider hydration (client-only)
- Hook calls within component trees (client-only during SSR)

### 1.2 Context Limitations During Server-Side Rendering

**Server Components cannot:**
- Use `useContext()` hook
- Access React Context directly
- Call hooks that depend on client state

**Implication for Docusaurus SSG:**
During the `npm run build` phase, Docusaurus renders your entire site to static HTML. This rendering process runs in a Node.js environment where `window`, `document`, and browser APIs don't exist. If your Root.tsx tries to use `useDocusaurusContext()` or render hooks, the build will fail or crash.

### 1.3 Recommended Architecture Pattern

Create a **Client Component boundary** that wraps context providers:

```typescript
// src/theme/RootClient.tsx (Client Component)
'use client'  // This directive is Next.js; Docusaurus uses dynamic imports instead

import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import { AuthProvider } from '../components/AuthProvider';
import AppContent from './AppContent';

export default function RootClient({ children }: { children: React.ReactNode }) {
  // All hooks, context calls, and browser APIs work here
  return (
    <ChatProvider>
      <AuthProvider>
        <AppContent>
          {children}
        </AppContent>
      </AuthProvider>
    </ChatProvider>
  );
}
```

---

## Section 2: Docusaurus-Specific SSG Handling

[Source: Docusaurus v3 - Static Site Generation (SSG)]

### 2.1 Docusaurus SSG Architecture

Docusaurus is a **static site generator** that:
1. Renders React components to HTML at **build time** (not runtime)
2. Deploys the generated HTML files to a CDN
3. Becomes a **single-page application (SPA)** on the client side

**Critical**: SSG does NOT support context providers during the build phase because it runs in Node.js, not a browser environment.

### 2.2 Client-Only Components Pattern

Docusaurus provides three mechanisms for client-only code:

#### Pattern 1: BrowserOnly Component (Recommended for Providers)
```typescript
// src/theme/Root.tsx
import { BrowserOnly } from '@docusaurus/core/BrowserOnly';
import AppContent from './AppContent';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <BrowserOnly>
      {() => {
        // Dynamic import for client-side code
        const RootClient = require('./RootClient').default;
        return (
          <RootClient>
            <AppContent>{children}</AppContent>
          </RootClient>
        );
      }}
    </BrowserOnly>
  );
}
```

**Why this works:**
- `BrowserOnly` wraps children in a function (not JSX directly)
- React skips evaluating the function during SSR
- Children only render after the first client render

**Important Note**: The Docusaurus docs state:
> "The children of `<BrowserOnly>` is not a JSX element, but a function that returns an element."

Failing to use a function will still cause the SSR error.

#### Pattern 2: useIsBrowser Hook (For Conditional Logic, NOT Providers)
```typescript
// Only use this for conditional operations, NOT rendering different UI
const isBrowser = useIsBrowser();

if (isBrowser) {
  // Perform side effects
  doSomethingWithDOM();
}
```

**Why NOT for providers:**
The hook returns `false` during SSR and `true` after hydration. If you conditionally render providers based on this, React will see different markup on the server vs. client, causing hydration mismatches.

#### Pattern 3: ExecutionEnvironment (For Imperative Code Only)
```typescript
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  // Imperative code like API calls, NOT rendering
  fetchData();
}
```

### 2.3 Critical Hydration Warning

[Source: Docusaurus SSG Documentation]

**Do NOT use:**
```typescript
// WRONG - causes hydration mismatch
if (typeof window !== 'undefined') {
  return <ProviderA>{children}</ProviderA>;
}
return <ProviderB>{children}</ProviderB>;
```

**Why this fails:**
1. During SSG (Node.js): `typeof window === 'undefined'` is true → renders `ProviderB`
2. During client hydration (browser): `typeof window !== 'undefined'` is true → renders `ProviderA`
3. React sees different markup → hydration error, DOM misalignment

---

## Section 3: Your Project Implementation

### 3.1 Current Architecture Issues

Your `Root.tsx` directly nests providers:

```typescript
// src/theme/Root.tsx (CURRENT - SSG INCOMPATIBLE)
import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import { AuthProvider } from '../components/AuthProvider';
import AppContent from './AppContent';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <AuthProvider>
        <AppContent>
          {children}
        </AppContent>
      </AuthProvider>
    </ChatProvider>
  );
}
```

**Why this causes SSG failure:**

1. **ChatProvider uses browser APIs:**
   ```typescript
   // From ChatProvider.tsx line 30
   const selectedText = window.getSelection()?.toString().trim();
   // window is undefined during Node.js SSR
   ```

2. **AuthProvider calls useDocusaurusContext():**
   ```typescript
   // From AuthProvider.tsx line 20
   const { siteConfig } = useDocusaurusContext();
   // This hook is a React hook, invalid during SSR
   ```

3. **Both call useState/useEffect during render:**
   ```typescript
   const [isChatOpen, setChatOpen] = useState(false); // Line 17
   useEffect(() => { document.addEventListener(...) }); // Line 47
   // These hooks require a browser environment
   ```

**Result:** During `npm run build`, Docusaurus attempts to render these providers during SSG. The Node.js environment doesn't have `window` or DOM APIs, causing the build to fail with errors like:
- `ReferenceError: window is not defined`
- `Error: useDocusaurusContext must be used inside a Docusaurus context`
- `Error: useAuth must be used within an AuthProvider` (on specific pages)

### 3.2 Recommended Fix: Wrap Providers in BrowserOnly

**File: `/src/theme/Root.tsx`**

```typescript
import React from 'react';
import { BrowserOnly } from '@docusaurus/core/BrowserOnly';
import AppContent from './AppContent';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <BrowserOnly
      fallback={
        // Render minimal fallback during SSG/SSR
        <AppContent>
          {children}
        </AppContent>
      }
    >
      {() => {
        // This code only runs after client hydration
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

**File: `/src/theme/RootClient.tsx` (New File)**

```typescript
'use client'; // TypeScript directive (not enforced in Docusaurus, but documents intent)

import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import { AuthProvider } from '../components/AuthProvider';

export default function RootClient({ children }: { children: React.ReactNode }) {
  // All browser-dependent code is isolated here
  // These providers will only mount after the client hydrates
  return (
    <ChatProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ChatProvider>
  );
}
```

**Why this works:**
1. `BrowserOnly` renders the `fallback` during SSG (no providers needed)
2. After client-side hydration, it dynamically imports and renders `RootClient`
3. `RootClient` contains all hooks and browser APIs
4. React hydrates without mismatches
5. Your providers are available for all subsequent client-side components

---

## Section 4: React Hooks in SSG Context

[Source: React Hooks Best Practices - Docusaurus Documentation]

### 4.1 UseEffect Timing in SSG

**During SSG:** `useEffect` is NOT called (only during client render)
**During Client Hydration:** `useEffect` runs after the first render
**After Hydration:** `useEffect` runs on subsequent state changes

**Implication:** If your component initializes state in `useEffect`, it won't run during SSG. This is correct behavior; delay DOM-dependent logic to `useEffect`.

### 4.2 useContext Hook Restrictions

`useContext()` must be called within a component that:
1. Is rendered by a provider
2. Exists in a client-side component tree (not during SSR)

**For AuthProvider:**
- Called in `useAuth()` hook (line 72: `useContext(AuthContext)`)
- Used by ChatBot, LoginOverlay, UserMenu, etc.
- These components are only rendered after client hydration

**For ChatProvider:**
- Called in `useChat()` hook (line 62)
- Used by TextSelectionButton and other UI components
- Safe because wrapped in BrowserOnly

### 4.3 Best Practice: Delay Initialization

```typescript
// Instead of initializing in render:
const ChatProvider = ({ children }) => {
  const [state, setState] = useState(null); // ❌ Initializes during SSR

  // Use useEffect to delay initialization:
  useEffect(() => {
    setState(/* browser-dependent value */); // ✓ Runs only on client
  }, []);

  return <Context.Provider value={state}>{children}</Context.Provider>;
};
```

---

## Section 5: Environment Variable and Configuration Management

[Source: Docusaurus Configuration - Runtime Environment Variables]

### 5.1 Accessing Configuration During SSG

Your `AuthProvider` accesses `siteConfig` from Docusaurus:

```typescript
const { siteConfig } = useDocusaurusContext();
const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || DEV_AUTH_URL;
```

**Important Caveat:**
- `useDocusaurusContext()` is a React hook
- Can only be called in client components or after hydration
- Cannot be called during SSG (Node.js environment)

### 5.2 Accessing Config During Build

If you need to access configuration during the build phase, use the Docusaurus plugin API:

```typescript
// src/plugins/auth-plugin.ts
import type { Plugin, LoadContext } from '@docusaurus/types';

export default function authPlugin(context: LoadContext): Plugin<void> {
  const { siteConfig } = context;
  const authUrl = siteConfig.customFields?.betterAuthUrl || 'http://localhost:3001';

  // Use authUrl for build-time configuration
  console.log('Build-time auth URL:', authUrl);

  return {
    name: 'docusaurus-auth-plugin',
    // Plugin hooks for build-time logic
  };
}
```

### 5.3 Runtime Configuration Pattern

Pass configuration via Docusaurus to your client components:

**In docusaurus.config.ts:**
```typescript
const config: Config = {
  customFields: {
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
  },
};
```

**In RootClient.tsx (after hydration):**
```typescript
// Now safe to call useDocusaurusContext
const { siteConfig } = useDocusaurusContext();
const authUrl = siteConfig.customFields?.betterAuthUrl;
```

---

## Section 6: Error Resolution Reference

### 6.1 "useAuth must be used within an AuthProvider"

**Root Cause:**
- Component calling `useAuth()` is not wrapped by AuthProvider
- AuthProvider is not rendering during SSG
- Page/component renders before client hydration

**Diagnosis:**
1. Check if component is imported during SSG (check `src/pages/` or Docusaurus doc pages)
2. Verify AuthProvider wraps all components that call `useAuth()`
3. Confirm AuthProvider is inside BrowserOnly wrapper

**Resolution:**
- Wrap AuthProvider in BrowserOnly (see Section 3.2)
- Move auth-dependent components to client-only sections
- Use conditional rendering to skip auth-protected features during SSG

### 6.2 "window is not defined"

**Root Cause:**
- Accessing browser API (window, document, localStorage) during SSG
- Component renders in Node.js environment

**Example from Your Code:**
```typescript
// ChatProvider.tsx line 30
const selectedText = window.getSelection()?.toString().trim();
// ^^^ Fails during Node.js SSG
```

**Resolution:**
- Wrap in BrowserOnly
- Or move browser API calls to useEffect

### 6.3 Hydration Mismatch

**Symptom:** Console warning:
```
Warning: useLayoutEffect does nothing on the server, because its effect cannot
be encoded into the server rendering output format. This will lead to a mismatch
between the initial, non-hydrated UI and the hydrated UI. To fix, useLayoutEffect
must be replaced with useEffect.
```

**Root Cause:**
- Server renders one DOM structure
- Client renders different DOM structure
- React cannot reconcile them

**Resolution:**
- Use BrowserOnly to skip rendering during SSG
- Ensure providers initialize the same state on server and client
- Use useEffect instead of useLayoutEffect for side effects

---

## Section 7: Testing and Validation

### 7.1 Build-Time Validation

```bash
# Test that SSG works without errors
npm run build

# Check that static files are generated
ls -la build/

# Verify no hydration errors in console output
```

### 7.2 Runtime Validation

1. **Auth Flow:**
   - User logs in → session cookie set
   - Reload page → useAuth() returns user
   - Call useAuth() in chatbot component → no error

2. **Chat Flow:**
   - Select text → text selection button appears
   - Open chat → ChatProvider state accessible
   - Send message → useChat() hook works

3. **No SSG Errors:**
   - `npm run build` completes without errors
   - No "window is not defined" errors
   - No "useAuth must be used within AuthProvider" during build

---

## Section 8: Architectural Decisions and Tradeoffs

### 8.1 BrowserOnly vs. Dynamic Import

**Option 1: BrowserOnly (Recommended)**
```typescript
<BrowserOnly fallback={<Fallback />}>
  {() => <Providers>{children}</Providers>}
</BrowserOnly>
```
- Pros: Simple, Docusaurus-native, clear intent
- Cons: Additional wrapper component

**Option 2: Dynamic Import**
```typescript
const Providers = dynamic(() => import('./RootClient'), { ssr: false });
```
- Pros: Standard Next.js pattern
- Cons: Requires additional configuration in Docusaurus

**Recommendation:** Use BrowserOnly for Docusaurus projects.

### 8.2 Fallback Content During SSG

Your `Root.tsx` BrowserOnly wrapper accepts a `fallback`:
```typescript
<BrowserOnly fallback={<AppContent>{children}</AppContent>}>
  {() => <RootClient>{children}</RootClient>}
</BrowserOnly>
```

**Decision:** Render AppContent without providers during SSG. This ensures:
- Site is fully navigable during initial page load
- Providers load after hydration
- No blank screen or loading state

---

## Section 9: Documentation Sources and References

### Official Documentation Used

1. [Next.js App Router - Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
   - Context API limitations in SSR
   - Client component boundary patterns
   - Recommended provider architecture

2. [Docusaurus - Static Site Generation (SSG)](https://docusaurus.io/docs/advanced/ssg)
   - BrowserOnly component
   - useIsBrowser hook
   - ExecutionEnvironment detection
   - Hydration best practices

3. [React Documentation - useContext Hook](https://react.dev/reference/react/useContext)
   - Context usage patterns
   - Provider requirements

4. [Docusaurus - Swizzling and Theming](https://docusaurus.io/docs/swizzling/overview)
   - Root component wrapping
   - Theme architecture

### Articles and Guides

- [Making Sense of React Server Components - Josh W. Comeau](https://www.joshwcomeau.com/react/server-components/)
- [React-based Static Site Generators in 2025: Performance and Scalability - Crystallize](https://crystallize.com/blog/react-static-site-generators)

---

## Section 10: Implementation Checklist

- [ ] Create `/src/theme/RootClient.tsx` with ChatProvider and AuthProvider
- [ ] Update `/src/theme/Root.tsx` to use BrowserOnly wrapper
- [ ] Test `npm run build` succeeds without errors
- [ ] Test user login flow works correctly
- [ ] Test chat functionality after login
- [ ] Verify no "useAuth must be used within AuthProvider" errors
- [ ] Verify no "window is not defined" errors
- [ ] Test on production Vercel deployment
- [ ] Verify session persistence across page refreshes
- [ ] Check browser console for hydration warnings

---

## Appendix A: Complete Reference Implementation

### /src/theme/Root.tsx
```typescript
import React from 'react';
import { BrowserOnly } from '@docusaurus/core/BrowserOnly';
import AppContent from './AppContent';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <BrowserOnly
      fallback={
        <AppContent>
          {children}
        </AppContent>
      }
    >
      {() => {
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

### /src/theme/RootClient.tsx
```typescript
'use client';

import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import { AuthProvider } from '../components/AuthProvider';

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

---

**Document Created**: 2025-12-18
**Last Updated**: 2025-12-18
**Next Review**: Upon next major Docusaurus or React upgrade
