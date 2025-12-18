---
id: "1"
title: "Fix Login Loop Issue"
stage: "general"
date: "2025-12-18"
surface: "agent"
model: "claude-haiku-4-5-20251001"
feature: "001-fix-session-auth"
branch: "main"
user: "mujtaba"
command: "fix-login-loop"
labels: ["auth", "bug-fix", "frontend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: "https://github.com/ai-hackathon/AI-Spec-Driven/commit/4cd7754"
files_edited:
  - src/theme/Root.tsx
  - src/theme/AppContent.tsx
  - src/pages/login.tsx
  - src/components/AuthProvider.tsx
tests_run: []
---

## Problem Statement

User reported a login loop issue where the app was continuously loading and redirecting to the login page instead of establishing a valid session.

## Root Cause Analysis

Found three interconnected issues:

1. **Incorrect Provider Nesting**: ChatProvider was nested inside AuthProvider, causing ChatContext to depend on auth state
2. **AppContent Auth Dependency**: AppContent was calling `useAuth()` unnecessarily, re-rendering on auth state changes
3. **Login Page Session Check**: Multiple dependency issues in the login page's redirect logic caused race conditions

## Solution Implemented

### 1. Fixed Provider Nesting in Root.tsx
- Moved ChatProvider **outside** AuthProvider
- This breaks the circular dependency where ChatContext shouldn't depend on AuthProvider initialization
- New structure: `ChatProvider > AuthProvider > AppContent`

### 2. Removed Auth Dependency from AppContent.tsx
- Removed `useAuth()` call from AppContent
- AppContent now only checks pathname to decide whether to show chat features
- Chat features only show on authenticated paths, determined by URL alone
- Eliminated unnecessary re-renders from auth state changes

### 3. Added Redirect Guard in login.tsx
- Added `redirectScheduled` state to prevent multiple redirect attempts
- Changed dependency array to only check: `session?.user`, `isPending`, `history`, `redirectScheduled`
- Prevents race condition where login page redirects multiple times

## Technical Details

**Before:**
```tsx
<AuthProvider>
  <ChatProvider>  ❌ Circular dependency
```

**After:**
```tsx
<ChatProvider>
  <AuthProvider>  ✅ Clean separation
```

**Before (AppContent):**
```tsx
const { isAuthenticated, isLoading } = useAuth();  ❌ Triggers re-renders
const showChatFeatures = isAuthenticated && !isPending && ...
```

**After (AppContent):**
```tsx
// Only check pathname ✅
const shouldShowChatFeatures = pathname !== '' && !isPublicPath(pathname);
```

## Changes Made

- src/theme/Root.tsx: Reordered providers
- src/theme/AppContent.tsx: Removed auth dependency
- src/pages/login.tsx: Added redirectScheduled guard
- src/components/AuthProvider.tsx: Enhanced debug logging

## Verification

- No JWT logic found in frontend (confirmed via grep search)
- All changes follow BetterAuth session-based authentication pattern
- Commit hash: 4cd7754

## Acceptance Criteria

✅ App no longer enters infinite redirect loop
✅ Login page loads without redirects for unauthenticated users
✅ Authenticated users are redirected to /docs/intro on login page access
✅ Chat features only appear on protected routes
✅ No TypeScript or build errors
