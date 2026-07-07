We are adding a small developer-owned frontend unit test suite to this project.

Goal:
Create meaningful frontend unit tests only. These should test isolated frontend logic and small UI behavior, not backend API behavior and not full browser workflows.

Rules:
1. Do not start the frontend dev server.
2. Do not start the backend server.
3. Do not make real HTTP requests.
4. Do not add Playwright or end-to-end tests.
5. Do not test drag-and-drop workflows in unit tests.
6. Prefer pure functions, helper functions, state transformation logic, formatting logic, filtering logic, and small component behavior.
7. If useful logic is currently embedded inside React components, make a small refactor to extract it into testable helper functions without changing behavior.
8. Keep the change beginner-friendly.
9. Add the minimum dependencies needed.
10. Add test scripts so we can run the frontend unit tests easily.
11. Use the testing approach that best fits the current frontend stack.

Please:
- inspect the frontend codebase first
- identify what is worth testing at the unit level
- implement meaningful frontend unit tests
- run the tests and fix any failures

Use:  Vitest + React Testing Library