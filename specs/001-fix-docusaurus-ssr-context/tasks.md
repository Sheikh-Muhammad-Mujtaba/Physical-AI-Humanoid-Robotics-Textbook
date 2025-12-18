# Task Breakdown: Fix Docusaurus SSR Context Errors

**Feature**: 001-fix-docusaurus-ssr-context
**Status**: Ready for Implementation
**Priority**: P0 (Blocks Production Build)
**Estimated Effort**: 2-3 hours

---

## Overview

Fix "useAuth must be used within an AuthProvider" and SSG build failures by properly isolating React Context providers from Docusaurus's server-side rendering pipeline. The root cause is that `ChatProvider` and `AuthProvider` use browser APIs and React hooks during SSG (Node.js execution), causing the build to fail.

## Task 1: Create RootClient.tsx Client-Only Component

**Acceptance Criteria:**
- New file created at `/src/theme/RootClient.tsx`
- File contains ChatProvider wrapping AuthProvider wrapping children
- No `useDocusaurusContext()` calls in this file
- No direct browser API access in this file
- File exports a React component as default

**Implementation Steps:**

1. Create new file `/src/theme/RootClient.tsx`
2. Add TypeScript directive `'use client'` at top (documents intent, not enforced in Docusaurus)
3. Import ChatProvider from `../contexts/ChatContext`
4. Import AuthProvider from `../components/AuthProvider`
5. Create functional component `RootClient` that:
   - Accepts `children: React.ReactNode`
   - Wraps children with ChatProvider
   - Wraps ChatProvider with AuthProvider
   - Returns the complete provider tree

**Code Reference:**
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

**Test:**
```bash
# Verify file is created and has correct structure
cat src/theme/RootClient.tsx
```

---

## Task 2: Wrap Root.tsx with BrowserOnly

**Acceptance Criteria:**
- File `/src/theme/Root.tsx` updated
- BrowserOnly wrapper imports from `@docusaurus/core/BrowserOnly`
- BrowserOnly has a fallback that renders AppContent without providers
- BrowserOnly children are a function (not JSX directly)
- Children function dynamically imports and renders RootClient
- Existing children are still rendered through AppContent

**Implementation Steps:**

1. Open `/src/theme/Root.tsx`
2. Add import: `import { BrowserOnly } from '@docusaurus/core/BrowserOnly';`
3. Remove direct imports of ChatProvider and AuthProvider (they're now in RootClient)
4. Replace the return statement with:
   ```typescript
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
   ```

**Complete File:**
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

**Test:**
```bash
# Verify file structure
cat src/theme/Root.tsx

# Check for BrowserOnly import
grep "BrowserOnly" src/theme/Root.tsx

# Check for dynamic require pattern
grep "require.*RootClient" src/theme/Root.tsx
```

---

## Task 3: Test Build Succeeds

**Acceptance Criteria:**
- `npm run build` completes without errors
- No "window is not defined" errors in build output
- No "useDocusaurusContext" errors in build output
- No hydration warnings in build output
- Build artifacts created in `/build` directory
- No broken references to removed providers

**Implementation Steps:**

1. Run clean build:
   ```bash
   rm -rf build node_modules/.cache
   npm run build
   ```

2. Monitor output for errors:
   - "window is not defined" - indicates browser code running during SSG
   - "useAuth must be used within an AuthProvider" - indicates context not available during SSG
   - "useDocusaurusContext" - indicates hook called outside Docusaurus context
   - Hydration mismatches - indicates server/client render differences

3. Verify build directory is created:
   ```bash
   ls -la build/
   ```

4. Check for specific success indicators:
   ```bash
   # Should show no errors (exit code 0)
   echo $?
   ```

**Error Recovery:**
- If "window is not defined" error: Verify ChatProvider and AuthProvider are only imported in RootClient, not Root
- If "useAuth" error: Check that useAuth() is not called before BrowserOnly completes
- If build still fails: Run `npm run build -- --verbose` for detailed logs

---

## Task 4: Test Client-Side Functionality

**Acceptance Criteria:**
- Application starts successfully in development (`npm run dev`)
- No console errors on page load
- useAuth() returns valid data after client hydration
- useChat() context is accessible in chat components
- Login flow works correctly
- Chat sends messages successfully
- No hydration mismatches in console

**Implementation Steps:**

1. Start development server:
   ```bash
   npm run dev
   ```

2. Open browser and navigate to application

3. Check browser console for errors:
   - No "useAuth must be used within an AuthProvider"
   - No hydration warnings
   - No "window is not defined" errors

4. Test authentication flow:
   - Log in with valid credentials
   - Verify session cookie is set
   - Refresh page
   - Verify user is still authenticated (useAuth() returns user)

5. Test chat flow:
   - Navigate to a page with chat widget
   - Select text on page
   - Verify text selection button appears
   - Click to open chat
   - Verify useChat() context works
   - Send a message
   - Verify message is processed

6. Monitor Network tab:
   - Verify `/chat` API calls include credentials (cookies)
   - No 401 Unauthorized errors

---

## Task 5: Test Production Build Locally

**Acceptance Criteria:**
- Production build created with `npm run build`
- Preview server starts with `npm run serve`
- All functionality works in preview
- No console errors on any page
- Auth session persists across page navigation
- Chat functionality works in preview

**Implementation Steps:**

1. Create production build:
   ```bash
   npm run build
   ```

2. Start preview server:
   ```bash
   npm run serve
   ```

3. Test in preview:
   - Navigate to different pages
   - Log in and verify persistence
   - Test chat on multiple pages
   - Check console for errors

4. Verify static assets are served correctly:
   - CSS loads properly
   - JavaScript runs without errors
   - No 404 errors for assets

---

## Task 6: Verify Vercel Deployment Compatibility

**Acceptance Criteria:**
- No build errors when pushed to Vercel
- All environment variables properly configured
- Session authentication works on production domain
- CORS headers correctly configured for auth service
- Chat API requests succeed with credentials

**Implementation Steps:**

1. Ensure environment variables are set in Vercel:
   - `BETTER_AUTH_URL` - Points to auth-service
   - `API_BASE_URL` - Points to API service
   - `VERCEL_URL` - Automatically set by Vercel

2. Verify in `docusaurus.config.ts`:
   ```typescript
   customFields: {
     betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
     apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
   },
   ```

3. Check that AuthProvider uses these values:
   ```typescript
   const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || DEV_AUTH_URL;
   ```

4. After deployment:
   - Test login on production domain
   - Verify session cookie domain is correct
   - Test chat API requests
   - Monitor browser console for errors

---

## Task 7: Documentation and Cleanup

**Acceptance Criteria:**
- No console.log debug statements remain
- All TypeScript types are correct
- No unused imports
- Comments explain the BrowserOnly pattern
- Code follows project conventions

**Implementation Steps:**

1. Remove debug logging from AuthProvider:
   - Check `/src/components/AuthProvider.tsx` for console.log statements
   - Keep only essential error logging
   - Remove development-only debug logs

2. Verify TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Check for unused imports:
   ```bash
   # Search for unused React imports (if not using JSX)
   grep -n "import React" src/theme/Root.tsx
   ```

4. Add helpful comments to Root.tsx:
   ```typescript
   // BrowserOnly ensures providers only render on client side
   // This prevents "useAuth must be used within an AuthProvider" during SSG
   ```

---

## Rollout Checklist

- [ ] Task 1: RootClient.tsx created and tested
- [ ] Task 2: Root.tsx wrapped with BrowserOnly
- [ ] Task 3: Build completes without errors
- [ ] Task 4: Client-side functionality verified
- [ ] Task 5: Production build works locally
- [ ] Task 6: Vercel deployment succeeds
- [ ] Task 7: Documentation and cleanup complete
- [ ] All console errors resolved
- [ ] No hydration warnings
- [ ] Auth session persists correctly
- [ ] Chat functionality works end-to-end

---

## Risks and Mitigation

### Risk 1: Hydration Mismatch (Probability: Medium)
**If:** Server renders AppContent differently than client renders it
**Then:** React console warnings, potential layout issues
**Mitigation:** Ensure AppContent and its children render identically on server and client

### Risk 2: Provider Order Breaking Components (Probability: Low)
**If:** ChatProvider depends on AuthProvider or vice versa
**Then:** useChat() fails in components that need auth, or useAuth() fails in chat components
**Mitigation:** Test all component combinations, verify dependency direction

### Risk 3: Session Not Available After Hydration (Probability: Low)
**If:** useSession() hook doesn't re-fetch after client hydration
**Then:** User appears logged out after page refresh
**Mitigation:** Verify better-auth's useSession() hook refetches on mount, verify session cookie is present

### Risk 4: Build Cache Issues (Probability: Low)
**If:** Node modules or build cache becomes corrupted
**Then:** Build fails with cryptic errors
**Mitigation:** Run `npm ci` and `rm -rf .next build node_modules/.cache` if issues occur

---

## Success Metrics

1. Build succeeds: `npm run build` completes with exit code 0
2. No SSG errors: No "window is not defined" or "useAuth must be used" errors
3. Functionality: All auth and chat features work post-hydration
4. Performance: No hydration warnings in console
5. Deployment: Production deployment on Vercel succeeds
6. User experience: No visible loading states or re-renders after hydration

---

## References

- [Docusaurus SSG Documentation](https://docusaurus.io/docs/advanced/ssg)
- [BrowserOnly Component Documentation](https://docusaurus.io/docs/advanced/ssg#browseronly)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Context API and SSR Best Practices](../00X-docusaurus-context-ssg-guide.md)
