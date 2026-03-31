# Testing Patterns

**Analysis Date:** 2026-02-26

## Test Framework

**Runner:**
- Not detected - no test runner is configured for web or API projects

**Assertion Library:**
- Not detected - no testing library found in dependencies

**Run Commands:**
- Not available - testing infrastructure not yet implemented

## Test File Organization

**Location:**
- Not applicable - no test files present in source directories

**Naming:**
- Not applicable - no test file naming convention established

**Structure:**
- Not applicable - no test infrastructure in place

## Test Structure

**Suite Organization:**
- Not applicable - no tests currently written

**Patterns:**
- Not applicable - no testing patterns established

## Mocking

**Framework:**
- Not detected - no mocking library installed

**Patterns:**
- Not applicable - no mocking patterns established

**What to Mock:**
- TBD: Supabase clients should be mocked in tests
- TBD: API endpoints should be mocked or use test fixtures
- Recommendation: Mock external services (Supabase auth, database queries, Stripe API)

**What NOT to Mock:**
- TBD: Utility functions and pure logic should be tested directly
- Recommendation: Test component rendering logic with actual React hooks (using React Testing Library when added)

## Fixtures and Factories

**Test Data:**
- Not applicable - no test fixtures currently in use

**Location:**
- Not determined - create `__tests__/fixtures` for Python and `src/__tests__/fixtures` for TypeScript when testing is added

## Coverage

**Requirements:**
- Not enforced - no coverage thresholds or tooling configured

**View Coverage:**
- Not applicable - no coverage tooling installed

## Test Types

**Unit Tests:**
- Not yet implemented
- Recommended approach: Test utilities, services, and individual components in isolation
- Python: Use pytest with FastAPI TestClient
- TypeScript: Use Vitest or Jest with React Testing Library

**Integration Tests:**
- Not yet implemented
- Recommended approach: Test API endpoints with test database
- Test user flows (login, signup, dashboard access)

**E2E Tests:**
- Not used - no E2E testing framework configured
- Consider for future: Playwright or Cypress for full user journey testing

## Common Patterns

**Async Testing:**
- Not yet established
- Recommendation when testing added: Use `async`/`await` with proper error handling
- Python pattern (when added):
  ```python
  async def test_health_check():
      response = client.get("/health")
      assert response.status_code == 200
      assert response.json()["status"] in ["healthy", "degraded"]
  ```

**Error Testing:**
- Not yet established
- Recommendation: Test error states in React components
- Recommendation: Test exception handling in Python routes
- Pattern to follow (example):
  ```typescript
  // React component error test
  const handleLogin = async (e: React.FormEvent) => {
    // ...
    if (error) {
      setError(error.message);
      return;
    }
  };
  ```

## Recommended Testing Setup

**For Web (TypeScript/React):**
1. Install testing dependencies:
   - `vitest` - Test runner
   - `@testing-library/react` - Component testing
   - `@testing-library/user-event` - User interaction simulation
   - `jsdom` - DOM environment

2. Create test files alongside source:
   - `src/app/(auth)/login/page.test.tsx`
   - `src/components/ui/button.test.tsx`
   - `src/lib/utils.test.ts`

3. Test patterns to establish:
   - Component rendering tests
   - User interaction tests (form submission, button clicks)
   - Supabase integration with mocked clients
   - Router navigation after actions

**For API (Python/FastAPI):**
1. Install testing dependencies:
   - `pytest` - Test runner
   - `pytest-asyncio` - Async test support
   - `httpx` - HTTP testing (included with FastAPI)

2. Create test structure:
   - `api/tests/` directory
   - `api/tests/test_health.py`
   - `api/tests/test_auth.py`
   - `api/tests/conftest.py` - Shared fixtures

3. Test patterns to establish:
   - Health check endpoint tests
   - Auth endpoint tests with mocked Supabase
   - Error handling and status code verification
   - Configuration validation tests

## Current Test Dependencies

**Installed (indirectly via dependencies):**
- Test files exist in `node_modules/@supabase/ssr/` and `node_modules/@radix-ui/` - these are external dependencies' tests, not project tests

**Not Installed:**
- No test runner configured
- No assertion library in use
- No mocking framework
- No test utilities library

---

*Testing analysis: 2026-02-26*
