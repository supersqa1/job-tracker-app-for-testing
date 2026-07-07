We are adding a small developer unit test suite to this project.

Goal:
Create meaningful unit tests only. These should test isolated logic, not full API behavior and not browser workflows.

Rules:
1. Do not start the backend server.
2. Do not make real HTTP requests.
3. Do not use FastAPI TestClient.
4. Do not connect to the real SQLite database.
5. Do not add Playwright or end-to-end tests.
6. Prefer pure functions, helper functions, validation behavior, and state transformation logic.
7. If useful logic is currently embedded inside React components, suggest a small refactor to extract it into testable helper functions.
8. Keep the change small and beginner-friendly.
9. Add the minimum dependencies needed.
10. Add test scripts so we can run the tests easily.

Please:
- inspect the codebase first
- identify what is worth unit testing
- run the tests and fix any failures

Use: PyTest