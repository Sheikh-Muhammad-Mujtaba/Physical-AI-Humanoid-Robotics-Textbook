---
id: 0001
title: create spec for ui polish select to ask
stage: spec
date: 2025-12-09
surface: CLI
model: N/A
feature: 001-ui-polish-select-to-ask
branch: 001-ui-polish-select-to-ask
user: N/A
command: /sp.specify
labels: []
links:
  spec: specs/001-ui-polish-select-to-ask/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/001-ui-polish-select-to-ask/spec.md
  - specs/001-ui-polish-select-to-ask/checklists/requirements.md
tests:
  - N/A
---

## Prompt

---
description: Create or update the feature specification from a natural language feature description.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

The text the user typed after `/sp.specify` in the triggering message **is** the feature description. Assume you always have it available in this conversation even if `read the prompt.txt using the cat command to add new specification as I just update them` appears literally below. Do not ask the user to repeat it unless they provided an empty command.

Given that feature description, do this:

1. **Generate a concise short name** (2-4 words) for the branch:
   - Analyze the feature description and extract the most meaningful keywords
   - Create a 2-4 word short name that captures the essence of the feature
   - Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
   - Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)
   - Keep it concise but descriptive enough to understand the feature at a glance
   - Examples:
     - "I want to add user authentication" → "user-auth"
     - "Implement OAuth2 integration for the API" → "oauth2-api-integration"
     - "Create a dashboard for analytics" → "analytics-dashboard"
     - "Fix payment processing timeout bug" → "fix-payment-timeout"

2. **Check for existing branches before creating new one**:
   
   a. First, fetch all remote branches to ensure we have the latest information:
      ```bash
      git fetch --all --prune
      ```
   
   b. Find the highest feature number across all sources for the short-name:
      - Remote branches: `git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-<short-name>$'`
      - Local branches: `git branch | grep -E '^[* ]*[0-9]+-<short-name>$'`
      - Specs directories: Check for directories matching `specs/[0-9]+-<short-name>`
   
   c. Determine the next available number:
      - Extract all numbers from all three sources
      - Find the highest number N
      - Use N+1 for the new branch number
   
   d. Run the script `.specify/scripts/powershell/create-new-feature.ps1 -Json "read the prompt.txt using the cat command to add new specification as I just update them"` with the calculated number and short-name:
      - Pass `--number N+1` and `--short-name "your-short-name"` along with the feature description
      - Bash example: `.specify/scripts/powershell/create-new-feature.ps1 -Json "read the prompt.txt using the cat command to add new specification as I just update them" --json --number 5 --short-name "user-auth" "Add user authentication"`
      - PowerShell example: `.specify/scripts/powershell/create-new-feature.ps1 -Json "read the prompt.txt using the cat command to add new specification as I just update them" -Json -Number 5 -ShortName "user-auth" "Add user authentication"`
   
   **IMPORTANT**:
   - Check all three sources (remote branches, local branches, specs directories) to find the highest number
   - Only match branches/directories with the exact short-name pattern
   - If no existing branches/directories found with this short-name, start with number 1
   - You must only ever run this script once per feature
   - The JSON is provided in the terminal as output - always refer to it to get the actual content you're looking for
   - The JSON output will contain BRANCH_NAME and SPEC_FILE paths
   - For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot")

3. Load `.specify/templates/spec-template.md` to understand required sections.

4. Follow this execution flow:

    1. Parse user description from Input
       If empty: ERROR "No feature description provided"
    2. Extract key concepts from description
       Identify: actors, actions, data, constraints
    3. For unclear aspects:
       - Make informed guesses based on context and industry standards
       - Only mark with [NEEDS CLARIFICATION: specific question] if:
         - The choice significantly impacts feature scope or user experience
         - Multiple reasonable interpretations exist with different implications
         - No reasonable default exists
       - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total**
       - Prioritize clarifications by impact: scope > security/privacy > user experience > technical details
    4. Fill User Scenarios & Testing section
       If no clear user flow: ERROR "Cannot determine user scenarios"
    5. Generate Functional Requirements
       Each requirement must be testable
       Use reasonable defaults for unspecified details (document assumptions in Assumptions section)
    6. Define Success Criteria
       Create measurable, technology-agnostic outcomes
       Include both quantitative metrics (time, performance, volume) and qualitative measures (user satisfaction, task completion)
       Each criterion must be verifiable without implementation details
    7. Identify Key Entities (if data involved)
    8. Return: SUCCESS (spec ready for planning)

5. Write the specification to SPEC_FILE using the template structure, replacing placeholders with concrete details derived from the feature description (arguments) while preserving section order and headings.

6. **Specification Quality Validation**: After writing the initial spec, validate it against quality criteria:

   a. **Create Spec Quality Checklist**: Generate a checklist file at `FEATURE_DIR/checklists/requirements.md` using the checklist template structure with these validation items:

      ```markdown
      # Specification Quality Checklist: [FEATURE NAME]
      
      **Purpose**: Validate specification completeness and quality before proceeding to planning
      **Created**: [DATE]
      **Feature**: [Link to spec.md]
      
      ## Content Quality
      
      - [ ] No implementation details (languages, frameworks, APIs)
      - [ ] Focused on user value and business needs
      - [ ] Written for non-technical stakeholders
      - [ ] All mandatory sections completed
      
      ## Requirement Completeness
      
      - [ ] No [NEEDS CLARIFICATION] markers remain
      - [ ] Requirements are testable and unambiguous
      - [ ] Success criteria are measurable
      - [ ] Success criteria are technology-agnostic (no implementation details)
      - [ ] All acceptance scenarios are defined
      - [ ] Edge cases are identified
      - [ ] Scope is clearly bounded
      - [ ] Dependencies and assumptions identified
      
      ## Feature Readiness
      
      - [ ] All functional requirements have clear acceptance criteria
      - [ ] User scenarios cover primary flows
      - [ ] Feature meets measurable outcomes defined in Success Criteria
      - [ ] No implementation details leak into specification
      
      ## Notes
      
      - Items marked incomplete require spec updates before `/sp.clarify` or `/sp.plan`
      ```

   b. **Run Validation Check**: Review the spec against each checklist item:
      - For each item, determine if it passes or fails
      - Document specific issues found (quote relevant spec sections)

   c. **Handle Validation Results**:

      - **If all items pass**: Mark checklist complete and proceed to step 6

      - **If items fail (excluding [NEEDS CLARIFICATION])**:
        1. List the failing items and specific issues
        2. Update the spec to address each issue
        3. Re-run validation until all items pass (max 3 iterations)
        4. If still failing after 3 iterations, document remaining issues in checklist notes and warn user

      - **If [NEEDS CLARIFICATION] markers remain**:
        1. Extract all [NEEDS CLARIFICATION: ...] markers from the spec
        2. **LIMIT CHECK**: If more than 3 markers exist, keep only the 3 most critical (by scope/security/UX impact) and make informed guesses for the rest
        3. For each clarification needed (max 3), present options to user in this format:

           ```markdown
           ## Question [N]: [Topic] 
           
           **Context**: [Quote relevant spec section]
           
           **What we need to know**: [Specific question from NEEDS CLARIFICATION marker]
           
           **Suggested Answers**:
           
           | Option | Answer | Implications |
           |--------|--------|--------------|
           | A      | [First suggested answer] | [What this means for the feature] |
           | B      | [Second suggested answer] | [What this means for the feature] |
           | C      | [Third suggested answer] | [What this means for the feature] |
           | Custom | Provide your own | [explain] |
           
           **Your choice**: _[Wait for user]_
           ```

        4. Wait for user to confirm choices for all questions (e.g., "Q1: A, Q2: C, Q3: B")
        5. Update the spec by replacing each [NEEDS CLARIFICATION] marker with the user's selected or provided answer
        6. Re-run validation until all items pass

   d. **Update Checklist**: After each validation cycle, update the checklist file with the pass/fail status

7. When the spec is complete, create a branch, spec file, results, and go to the next phase: `/sp.plan` or `/sp.implement`.

**Specification Best Practices**:

- **Clarity**: Write in plain language that anyone can understand, from developers to business stakeholders.
- **Completeness**: Include all mandatory sections. The more detail, the better.
- **Testability**: Every requirement should be a "testable and verifiable" item.
- **User-Centric**: Focus on user journeys and value, not implementation details.
- **Independence**: Each user story must be an independent, testable, and deployable slice of functionality.

**Handling Unclear Requirements**:

- **Make informed guesses**: Use context, industry standards, and common patterns to fill in gaps.
- **Assume reasonable defaults**: If a detail isn't specified, choose a sensible default and document it in the "Assumptions" section.
- **Use [NEEDS CLARIFICATION] sparingly**: Maximum 3 markers for critical decisions that:
  - Significantly impact feature scope or user experience
  - Have multiple reasonable interpretations with different implications
  - Have no reasonable default
- **Prioritize clarifications**: Scope > security/privacy > user experience > technical details.

**Success Criteria Best Practices**:

- **Measurable**: Include quantitative metrics (time, performance, volume) and qualitative measures (user satisfaction, task completion).
- **Technology-Agnostic**: No mention of languages, frameworks, or tools.
- **User-Focused**: Describe outcomes from the user or business perspective, not system behavior.
- **Verifiable**: Can be proven true or false without implementation details.

**Good Examples of Success Criteria**:

- "Users can complete account creation in under 2 minutes"
- "System supports 1000 concurrent users without degradation"
- "95% of search results are returned in under 100ms"
- "Task completion rate improves by 40%"

**Bad Examples of Success Criteria** (implementation-focused):

- "Response time is under 200ms" (unless users see results)
- "Database can handle 1000 queries per second" (unless tied to user-facing metrics)
- "React components render in 100ms" (user-facing)
- "API hits a 99% cache hit rate" (technology-specific)

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent-native tools when possible.

1) Determine Stage
   - Stage: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route is automatically determined by stage: 
     - `constitution` → `history/prompts/constitution/`
     - Feature stages → `history/prompts/<feature-name>/` (spec, plan, tasks, red, green, refactor, explainer, misc)
     - `general` → `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent-native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Open the file and fill remaining placeholders (YAML + body), embedding full PROMPT_TEXT (verbatim) and concise RESPONSE_TEXT.
   - If the script fails:
     - Read `.specify/templates/phr-template.prompt.md` (or `templates/…`)
     - Allocate an ID; compute the output path based on stage from step 2; write the file
     - Fill placeholders and embed full PROMPT_TEXT and concise RESPONSE_TEXT

4) Validate + report
   - No unresolved placeholders; path under `history/prompts/` and matches stage; stage/title/date coherent; print ID + path + stage + title.
   - On failure: warn, don't block. Skip only for `/sp.phr`.

## Response snapshot

Created a new feature branch `001-ui-polish-select-to-ask` and a specification file at `specs/001-ui-polish-select-to-ask/spec.md`. The spec outlines the user stories, functional requirements, and success criteria for the "UI Polish, Select-to-Ask, and Deployment Fixes" feature. A quality checklist has also been created.

## Outcome

- ✅ Impact: High - A new feature is now formally specified and ready for planning.
- 🧪 Tests: N/A
- 📁 Files: 
  - `specs/001-ui-polish-select-to-ask/spec.md`
  - `specs/001-ui-polish-select-to-ask/checklists/requirements.md`
  - `history/prompts/001-ui-polish-select-to-ask/0001-create-spec-for-ui-polish-select-to-ask.spec.prompt.md`
- 🔁 Next prompts: `/sp.plan`
- 🧠 Reflection: The process of creating a feature spec is well-defined and helps ensure all aspects of a feature are considered before implementation. The automatic creation of the branch and spec file is a great time-saver.

## Evaluation notes (flywheel)

- Failure modes observed: Incorrect script path in the instructions.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A