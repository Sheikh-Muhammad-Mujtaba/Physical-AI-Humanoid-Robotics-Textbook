---
id: 0001
title: Create Plan for Flatten Project Structure
stage: plan
date: 2025-12-10
surface: 
model: 
feature: 002-flatten-project-structure
branch: 002-flatten-project-structure
user: 
command: /sp.plan ok now create a plan for this spec
labels: []
links:
  spec: specs/002-flatten-project-structure/spec.md
  plan: specs/002-flatten-project-structure/plan.md
  ticket: 
  adr: 
  pr: 
files:
- specs/002-flatten-project-structure/plan.md
tests:

---

## Prompt

## Task 1: Flatten Project Structure - Move Docusaurus to Root

**Objective:** Migrate Docusaurus configuration and source files from `textbook/` subdirectory
 to project root for simplified deployment and better monorepo alignment.

**Current Structure:**
```
AI-Spec-Driven/
├── api/
├── textbook/
│   ├── docusaurus.config.ts
│   ├── package.json
│   ├── src/
│   ├── docs/
│   ├── blog/
│   ├── static/
│   ├── scripts/
│   ├── i18n/
│   └── build/
└── vercel.json
```

**Target Structure:**
```
AI-Spec-Driven/
├── api/
│   ├── index.py
│   ├── utils/
│   └── requirements.txt
├── src/                    (from textbook/src)
├── docs/                   (from textbook/docs)
├── blog/                   (from textbook/blog)
├── static/                 (from textbook/static)
├── scripts/                (from textbook/scripts)
├── i18n/                   (from textbook/i18n)
├── docusaurus.config.ts    (from textbook/)
├── sidebars.ts             (from textbook/)
├── package.json            (merged from textbook/)
├── tsconfig.json           (from textbook/)
├── tailwind.config.js      (from textbook/)
├── postcss.config.js       (from textbook/)
├── vercel.json             (updated for root)
└── lighthouserc.js         (from textbook/)
```

**Steps:**

1. **Copy all Docusaurus configuration files to root:**
   - Copy `textbook/docusaurus.config.ts` → `docusaurus.config.ts`
   - Copy `textbook/sidebars.ts` → `sidebars.ts`
   - Copy `textbook/tailwind.config.js` → `tailwind.config.js`
   - Copy `textbook/postcss.config.js` → `postcss.config.js`
   - Copy `textbook/tsconfig.json` → `tsconfig.json`
   - Copy `textbook/lighthouserc.js` → `lighthouserc.js`
   - Copy `textbook/.npmignore` → `.npmignore`

2. **Copy all source directories to root:**
   - Copy `textbook/src/**` → `src/`
   - Copy `textbook/docs/**` → `docs/`
   - Copy `textbook/blog/**` → `blog/`
   - Copy `textbook/static/**` → `static/`
   - Copy `textbook/scripts/**` → `scripts/`
   - Copy `textbook/i18n/**` → `i18n/`

3. **Merge `package.json`:**
   - Extract all dependencies from `textbook/package.json`
   - Add Docusaurus scripts to root `package.json`:
     ```json
     {
       "scripts": {
         "docusaurus": "docusaurus",
         "start": "docusaurus start",
         "build": "docusaurus build",
         "clear": "docusaurus clear",
         "serve": "docusaurus serve",
         "swizzle": "docusaurus swizzle",
         "write-translations": "docusaurus write-translations",
         "write-heading-ids": "docusaurus write-heading-ids",
         "typecheck": "tsc"
       }
     }
     ```

4. **Update `vercel.json` for new structure:**
   - Change `buildCommand` from `cd textbook && npm install && npm run build` to `npm install 
&& npm run build`
   - Change route destination from `/textbook/build/$1` to `/build/$1`

5. **Delete old `textbook/` directory** after verification

6. **Test locally:**
   ```bash
   npm install
   npm run build
   npm start
   ```

7. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

**Success Criteria:**
- ✅ All Docusaurus files copied to root
- ✅ Build completes without errors
- ✅ Static files generated in `build/`
- ✅ Frontend accessible at root domain on Vercel
- ✅ API routes at `/api/*` working
- ✅ No broken imports or file references

**Files to Modify:**
- `vercel.json` - Update build command and routes
- `package.json` - Add Docusaurus scripts and dependencies
- Directory structure - Flatten from `textbook/*` to root

---

## Task 2: Fix syntax error in ChatAPI (if textbook still exists)

**The Issue:**
The function `handleResponseError` is missing

## Response snapshot

I have created a new implementation plan for "Flatten Project Structure".
The plan is located at `specs/002-flatten-project-structure/plan.md`.

## Outcome

- ✅ Impact: Created a new implementation plan for 'Flatten Project Structure'.
- 🧪 Tests: No tests were run.
- 📁 Files: Created 1 file: the implementation plan.
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: The plan is broken down into phases that align with the user's request.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): None.