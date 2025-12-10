---
id: 0006
title: Refactor backend to use OpenAI Agent SDK with Gemini
stage: refactor
date: 2025-12-08
surface:
model:
feature: 002-chatbot-history-l10n
branch:
user:
command:
labels: []
links:
  spec:
  ticket:
  adr:
  pr:
files:
- api/index.py
- api/requirements.txt
- api/utils/helpers.py
- README.md
- specs/002-chatbot-history-l10n/quickstart.md
tests:

---

## Prompt

ok just skip it and now review the back end and make sure you use open ai agent sdk for the user query responce openai_github_io_openai-agents-python use context7 mcp for the details to use updated version

read the exp.py it have the example how other mother can be used with openai agent sdk also search docs for it

no dont use lite llm use the chat completion model and asyncio and using it attach the gemini chat completion end point

## Response snapshot

I have refactored the backend to use the OpenAI Agent SDK with a Gemini model.

This involved:
- Updating `api/requirements.txt` to include `openai` and `openai-agents`.
- Refactoring `api/index.py` to use the `Agent` and `Runner` from the `openai-agents` SDK.
- Creating a custom `OpenAIChatCompletionsModel` that points to the Gemini API endpoint.
- Creating a `search_tool` to encapsulate the RAG logic.
- Removing the old `GeminiHelper`.
- Updating the documentation to reflect the changes in environment variables.

## Outcome

- ✅ Impact: The backend now uses the OpenAI Agent SDK with a Gemini model, as requested by the user.
- 🧪 Tests: No new tests were added.
- 📁 Files: Modified `api/index.py`, `api/requirements.txt`, `README.md`, `specs/002-chatbot-history-l10n/quickstart.md`. Removed `api/utils/helpers.py`.
- 🔁 Next prompts:
- 🧠 Reflection: The request to use a Gemini model with the OpenAI Agent SDK without LiteLLM was challenging due to lack of direct documentation. The solution was to use the `AsyncOpenAI` client with a custom `base_url` pointing to the Gemini API, which is a clever workaround.

## Evaluation notes (flywheel)

- Failure modes observed:
- Graders run and results (PASS/FAIL):
- Prompt variant (if applicable):
- Next experiment (smallest change to try):