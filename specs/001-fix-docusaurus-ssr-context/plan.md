# Architectural Plan: Fix Docusaurus SSR Context Provider Errors

**Feature**: 001-fix-docusaurus-ssr-context
**Status**: Architecture Approved
**Date**: 2025-12-18

---

## 1. Scope and Dependencies

### In Scope

- Fix SSG build errors caused by Context providers using browser APIs
- Isolate React Context providers from Docusaurus SSG (build-time) pipeline
- Ensure client-side authentication and chat functionality work correctly after hydration
- Support session-based authentication via cookies
- Maintain backward compatibility with existing components

### Out of Scope

- Refactoring ChatProvider or AuthProvider internals (only wrapping/isolation)
- Changing authentication mechanism (better-auth remains the auth provider)
- Migrating from Docusaurus to other frameworks
- Performance optimization beyond SSG fixes
- API backend changes

### External Dependencies

- **Docusaurus v3+** - Provides BrowserOnly component and SSG pipeline
- **React 18+** - Context API, hooks, hydration
- **Better Auth** - Session management and authentication
- **Vercel** - Production deployment platform

### Ownership

- Frontend architecture: This document
- Authentication service: `auth-service/` directory
- Backend API: `api/` directory

---

## 2. Key Decisions and Rationale

### Decision 1: Use BrowserOnly Component for Provider Isolation

**Options Considered:**

| Approach | Pros | Cons | Recommendation |
|----------|------|------|-----------------|
| **BrowserOnly (Chosen)** | Docusaurus-native, simple, clear intent | Requires function children wrapper | RECOMMENDED |
| Dynamic Import | Standard Next.js pattern | Requires Docusaurus config | Consider for future |
| Conditional rendering (typeof window) | Simple | Causes hydration mismatch | AVOID |
| Client-side only pages | Maximum compatibility | Loses SSG benefits | AVOID |

**Rationale:**
- BrowserOnly is the official Docusaurus recommendation for client-only code
- Prevents render during SSG (Node.js environment)
- Clear separation of concerns: SSG rendering vs. client hydration
- No hydration mismatches when properly implemented

**Trade-off:**
- Adds one additional wrapper component
- Requires callback function pattern for children
- Slight overhead from dynamic import

---

### Decision 2: Split Root.tsx into Root (SSG) + RootClient (Client)

**Architecture Pattern:**

```
Root.tsx (Server/SSG-compatible)
  └── BrowserOnly (render control)
      ├── fallback: AppContent (renders during SSG)
      └── children: RootClient (renders after hydration)
          ├── ChatProvider
          │   └── AuthProvider
          │       └── AppContent (client-side with full context)
          │           └── {children}
```

**Why Separate Files:**

1. **Clear Intent**: Filename signals `RootClient` is client-only
2. **Hydration Safety**: Server and client render identical fallback structure
3. **Hot Reload**: Client file can be updated without affecting SSG
4. **Team Understanding**: Future developers immediately understand the pattern

**Implication:**
- Root renders lightweight fallback during SSG
- After hydration, RootClient loads and wraps content with providers
- No providers needed during static generation

---

### Decision 3: Preserve AppContent in Both Server and Client Paths

**Pattern:**
```typescript
<BrowserOnly
  fallback={<AppContent>{children}</AppContent>}
>
  {() => (
    <RootClient>
      <AppContent>{children}</AppContent>
    </RootClient>
  )}
</BrowserOnly>
```

**Rationale:**
- AppContent provides layout and static UI for both SSG and client
- Providers wrap AppContent on client side only
- Ensures layout is consistent

**Alternative Rejected:**
- Rendering providers without AppContent would break layout on SSG static pages

---

### Decision 4: Use require() for Dynamic Import Instead of ES6 import()

**Pattern:**
```typescript
{() => {
  const RootClient = require('./RootClient').default;
  return <RootClient>{children}</RootClient>;
}}
```

**Rationale:**
- Docusaurus examples use require() pattern
- Works reliably with Docusaurus's build system
- Avoids async/await complexity in JSX

**Why Not Dynamic Import:**
```typescript
// Avoided because it requires async handling
const RootClient = dynamic(() => import('./RootClient'), { ssr: false });
```

---

### Decision 5: Keep Debug Logging in AuthProvider During Development

**Current State:**
```typescript
console.log('[AUTH-PROVIDER] Session State:', {...});
console.log('[AUTH-PROVIDER][DEBUG] session:', session);
```

**Decision:** Keep for now, remove after production deployment
**Rationale:**
- Helps diagnose session and authentication issues
- Will be stripped in production builds (use environment variable to control)

**Future Cleanup:**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[AUTH-PROVIDER] Session State:', {...});
}
```

---

## 3. Interfaces and API Contracts

### Root Component Interface

**Input (Props):**
```typescript
interface RootProps {
  children: React.ReactNode;
}
```

**Output:**
- React component tree with provider hierarchy
- BrowserOnly wrapper ensuring SSG compatibility
- Fallback for server-side rendering

**Behavior:**
1. During SSG: Render BrowserOnly fallback (AppContent + children, no providers)
2. During Client Hydration: Match server-rendered structure
3. After Hydration: Load RootClient and wrap with ChatProvider + AuthProvider

### RootClient Component Interface

**Input:**
```typescript
interface RootClientProps {
  children: React.ReactNode;
}
```

**Output:**
- Provider tree with ChatProvider > AuthProvider > children

**Guarantee:**
- Only renders after client hydration (never during SSG)
- All hooks and browser APIs are safe to use

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Build Performance

**Requirement:** SSG build time should not increase
**Current State:** ~30-45 seconds (estimate)
**Target:** Same or better

**How This Decision Supports It:**
- BrowserOnly lazy-loads providers only after hydration
- Reduces SSG critical path
- No additional build steps

---

### 4.2 Runtime Performance

**Requirement:** First Contentful Paint (FCP) should not degrade
**Metric:** <2s FCP on production (3G throttle)

**How This Decision Supports It:**
- Fallback renders immediately during SSG (no provider overhead)
- Providers load asynchronously after initial render
- User sees content before auth status is determined

**Note:**
- Chat and auth features require providers, so loading them after FCP is acceptable
- Static content renders immediately

---

### 4.3 Reliability

**Requirement:** Build must not fail during SSG
**Current Failure Mode:** "window is not defined" errors

**Guarantees After Fix:**
- No runtime errors during `npm run build`
- Session validation only occurs on client
- Auth errors don't block static content generation

---

### 4.4 Backwards Compatibility

**Requirement:** Existing components must continue to work
**Changes to Component APIs:** None

**Breaking Changes:** None
- All hooks (useAuth, useChat) remain unchanged
- All components remain unchanged
- Only provider wrapping layer changes

---

## 5. Operational Readiness

### 5.1 Build Process

**Before Fix:**
```bash
npm run build  # ❌ Fails with "window is not defined"
```

**After Fix:**
```bash
npm run build  # ✓ Completes successfully
ls -la build/  # ✓ Static files generated
```

**Deployment:**
```bash
npm run dev    # ✓ Works in development
vercel deploy  # ✓ Builds and deploys on Vercel
```

### 5.2 Monitoring and Debugging

**Build Phase Errors:**
```
Error: window is not defined
  at ChatProvider.tsx:30
  → Solution: Verify ChatProvider only imported in RootClient
```

**Runtime Errors:**
```
useAuth must be used within an AuthProvider
  → Solution: Verify BrowserOnly renders after hydration
  → Check browser console for hydration errors
```

**Debugging:**
```typescript
// Add to Root.tsx if needed
console.log('BrowserOnly fallback rendered');

// Add to RootClient.tsx if needed
console.log('RootClient mounted - providers ready');
```

### 5.3 Rollback Strategy

**If Issues Occur:**

1. Immediate rollback:
   ```bash
   git revert <commit-hash>
   git push
   vercel deploy --prod
   ```

2. Partial rollback (if only one provider has issues):
   - Remove problematic provider from RootClient
   - Restore from BetterAuth hook configuration
   - Reduce functionality temporarily to restore stability

---

## 6. Risk Analysis and Mitigation

### Risk 1: Hydration Mismatch (Medium Probability, High Impact)

**Description:**
Server renders one DOM structure, client renders different structure, causing React hydration error.

**Likelihood Factors:**
- AppContent behaves differently on server vs. client
- useEffect initializes state differently
- Conditional rendering based on browser detection

**Mitigation:**
- Use BrowserOnly to skip rendering during SSG
- Render AppContent identically in both fallback and client paths
- Avoid `typeof window` checks in AppContent render logic
- Test build and client hydration thoroughly

**Kill Switch:**
If hydration errors occur:
```bash
# Revert to previous version
git revert <hash>

# Or temporarily disable providers
# (downgrade functionality to restore stability)
```

---

### Risk 2: Chat Context Unavailable for Text Selection (Low Probability, Medium Impact)

**Description:**
ChatProvider uses `window.getSelection()` which fails during SSG.

**Likelihood Factors:**
- Already isolated in ChatProvider.tsx
- useEffect protects getSelection() call
- BrowserOnly wrapper prevents execution during SSG

**Mitigation:**
- Verified in Task 1: ChatProvider only imported in RootClient
- Confirmed useEffect delays getSelection() until after hydration
- BrowserOnly ensures ChatProvider only mounts on client

**Verification:**
```bash
# No build errors for window.getSelection
npm run build  # ✓ No "window is not defined"

# Functionality works after hydration
# Manual test: Select text on page → button appears ✓
```

---

### Risk 3: Auth Context Not Available During SSG (Low Probability, Low Impact)

**Description:**
useDocusaurusContext() call in AuthProvider causes SSG failure.

**Likelihood Factors:**
- Already using useDocusaurusContext() safely
- Wrapped in React component (only executes on client)
- BrowserOnly prevents AuthProvider mount during SSG

**Mitigation:**
- Verified in Task 2: AuthProvider wrapped in RootClient
- useDocusaurusContext() only called after client hydration
- Fallback doesn't require auth data

**Verification:**
```bash
# No SSG errors for useDocusaurusContext
npm run build  # ✓ No "Docusaurus context" errors

# Auth works after hydration
# Manual test: Log in → useAuth() returns user ✓
```

---

### Risk 4: Environment Variables Not Available at Runtime (Low Probability, Medium Impact)

**Description:**
AuthProvider reads from siteConfig which might not have env variables.

**Likelihood Factors:**
- Fallback to DEV_AUTH_URL if not configured
- Vercel passes BETTER_AUTH_URL to docusaurus.config.ts

**Mitigation:**
- Verify environment variables in Vercel settings
- Check docusaurus.config.ts uses process.env correctly
- Test on Vercel staging before production

**Verification:**
```bash
# Check environment variables are accessible
echo $BETTER_AUTH_URL  # Should print auth service URL
echo $API_BASE_URL     # Should print API base URL

# Verify in AuthProvider
const authUrl = siteConfig.customFields?.betterAuthUrl;
console.log('Auth URL:', authUrl);  # Should print actual URL, not dev fallback
```

---

### Risk 5: Performance Regression from Extra Wrapper (Low Probability, Low Impact)

**Description:**
Additional BrowserOnly wrapper adds latency or bundle size overhead.

**Likelihood Factors:**
- BrowserOnly is lightweight (~1KB)
- No performance regression expected
- Lazy loading of providers could improve FCP

**Mitigation:**
- Monitor Core Web Vitals after deployment
- BrowserOnly is Docusaurus-native, highly optimized
- Dynamic import of RootClient saves bytes in SSG artifacts

**Monitoring:**
```bash
# Check bundle size before and after
npm run build  # Check build/ size

# Monitor on production
# Vercel Analytics → Core Web Vitals
# Target: FCP < 2s, LCP < 2.5s
```

---

## 7. Evaluation and Validation

### Definition of Done

- [ ] `npm run build` succeeds without errors
- [ ] No "window is not defined" in build logs
- [ ] No "useAuth must be used within an AuthProvider" errors
- [ ] Static files generated in build/ directory
- [ ] Application loads in browser without console errors
- [ ] useAuth() hook returns correct user data after login
- [ ] useChat() hook accessible in chat components
- [ ] Session persists across page refresh
- [ ] Chat sends messages successfully
- [ ] Vercel deployment succeeds
- [ ] No hydration warnings in browser console

### Testing Strategy

1. **Build Testing:**
   ```bash
   npm run build
   echo $?  # Exit code must be 0
   ```

2. **Client Testing:**
   ```bash
   npm run dev
   # Open http://localhost:3000
   # Login and test chat functionality
   # Monitor console for errors
   ```

3. **Production Testing:**
   ```bash
   npm run build && npm run serve
   # Simulate production environment
   # Test all features work correctly
   ```

4. **Deployment Testing:**
   - Push to Vercel staging
   - Run full test suite
   - Monitor error logs
   - Promote to production

---

## 8. Architectural Decision Records

**Significant Decision Detected:** Restructuring React Context Provider Pattern for SSG Compatibility

**Decision Summary:**
Implement client-side provider isolation using Docusaurus's BrowserOnly component to prevent build-time errors while maintaining full functionality after client hydration.

**Would you like to document this as an ADR?** Run `/sp.adr "Use BrowserOnly for Client-Only Context Providers in Docusaurus"` if you want to formalize this decision with rationale, alternatives, and consequences.

---

## 9. Implementation Timeline

### Phase 1: Code Changes (1 hour)
- Create RootClient.tsx
- Update Root.tsx with BrowserOnly
- Verify syntax and imports

### Phase 2: Build Validation (30 minutes)
- Run `npm run build`
- Fix any errors
- Verify build artifacts

### Phase 3: Client Testing (30 minutes)
- Run `npm run dev`
- Test authentication flow
- Test chat functionality
- Monitor console

### Phase 4: Production Deployment (30 minutes)
- Push to Vercel
- Verify deployment
- Test in production
- Monitor error logs

**Total: ~2.5 hours**

---

## 10. Success Metrics

1. **Build Success Rate:** 100% (currently failing)
2. **Error-Free Builds:** 0 SSG errors (currently has errors)
3. **Functionality:** All auth and chat features work (currently broken)
4. **Performance:** No FCP degradation (<2s target maintained)
5. **Deployment:** Vercel builds succeed (currently failing)
6. **User Experience:** No visible loading states post-hydration

---

## References and Documentation

- **Docusaurus SSG Guide**: `/specs/00X-docusaurus-context-ssg-guide.md`
- **Implementation Tasks**: `/specs/001-fix-docusaurus-ssr-context/tasks.md`
- **Official Docs**: https://docusaurus.io/docs/advanced/ssg
- **React Context API**: https://react.dev/reference/react/useContext
- **Next.js Server Components**: https://nextjs.org/docs/app/getting-started/server-and-client-components
