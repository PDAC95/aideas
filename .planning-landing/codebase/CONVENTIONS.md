# Coding Conventions

**Analysis Date:** 2026-02-26

## Naming Patterns

**Files:**
- TypeScript/React components: PascalCase with `.tsx` extension (e.g., `Button.tsx`, `DashboardNav.tsx`)
- TypeScript utilities and hooks: camelCase with `.ts` extension (e.g., `utils.ts`, `client.ts`, `server.ts`)
- Python modules: snake_case with `.py` extension (e.g., `config.py`, `main.py`, `auth.py`)
- Route handlers: Named by function (e.g., `route.ts` for API routes, `page.tsx` for page components)
- UI components directory: `/components/ui/` for primitive components, `/components/dashboard/` for feature-specific components

**Functions:**
- React components: PascalCase (e.g., `Button`, `LoginPage`, `DashboardNav`)
- Regular TypeScript functions: camelCase (e.g., `createClient`, `handleLogin`, `get_supabase`)
- Python functions: snake_case (e.g., `get_settings`, `get_supabase`, `health_check`)
- Handler functions: Prefix with action name (e.g., `handleLogin`, `handleSignup`, `handleSignOut`)

**Variables:**
- TypeScript: camelCase for all variables (e.g., `email`, `password`, `firstName`, `sidebarOpen`, `supabase`)
- Boolean variables: Prefixed with `is` or action descriptors (e.g., `loading`, `error`, `success`, `sidebarOpen`)
- State setters: Use React convention `set` + CapitalizedName (e.g., `setEmail`, `setPassword`, `setLoading`)
- Python: snake_case for all variables (e.g., `supabase_url`, `cors_origins`)

**Types:**
- TypeScript interfaces and types: PascalCase (e.g., `UserInfo`)
- Pydantic models: PascalCase (e.g., `Settings`, `UserInfo`)
- Union types: Written inline with pipes (e.g., `string | null`, `str | None`)

## Code Style

**Formatting:**
- No explicit prettier or formatter configuration beyond ESLint defaults
- Use ESLint and eslint-config-next for web project linting
- Python code follows implicit PEP 8 standards via FastAPI conventions

**Linting:**
- Web: ESLint with Next.js config (`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`)
- Run with: `npm run lint` in web directory
- Python: No explicit linting configuration present - standard FastAPI/Pydantic conventions used

**Semicolons:**
- Semicolons used in TypeScript (e.g., `import { Button } from "@/components/ui/button";`)
- Optional but consistently present in the codebase

## Import Organization

**Order:**
1. React and Next.js imports (e.g., `import { useState } from "react";`, `import { useRouter } from "next/navigation";`)
2. Next.js-specific imports (e.g., `import Link from "next/link";`, `import { createClient } from "@/lib/supabase/server";`)
3. Component and local imports (e.g., `import { Button } from "@/components/ui/button";`)
4. Utility imports and hooks (e.g., `import { cn } from "@/lib/utils";`)

**Path Aliases:**
- TypeScript alias: `@/*` maps to `./src/*` (e.g., `@/components/ui/button`, `@/lib/supabase/server`)
- Standard relative imports for Python modules

**Examples:**
```typescript
// Web imports pattern from `/c/dev/12ai/web/src/app/(auth)/login/page.tsx`
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

```python
# Python imports pattern from `/c/dev/12ai/api/src/routes/auth.py`
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from ..config import get_settings
from supabase import create_client
```

## Error Handling

**Patterns:**
- Web (React): Local state management for errors with `setError` pattern
- Web: Error messages stored as `string | null` (e.g., `const [error, setError] = useState<string | null>(null);`)
- Web: Errors cleared before actions and on success
- Python: FastAPI `HTTPException` for API errors with status codes and detail messages
- Python: Try-catch blocks with generic exception handling converting to HTTPException

**Examples:**
```typescript
// Web error handling pattern
const [error, setError] = useState<string | null>(null);
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }
  // ...
};
```

```python
# Python error handling pattern
try:
    supabase = create_client(settings.supabase_url, settings.supabase_key)
    supabase.table("organizations").select("id").limit(1).execute()
    checks["database"] = "healthy"
except Exception as e:
    checks["database"] = f"unhealthy: {str(e)}"
```

## Logging

**Framework:** `console` (browser console) for web; `print()` for Python/FastAPI

**Patterns:**
- Minimal console logging in production code
- Print statements for startup/shutdown in Python (e.g., `print("Starting AIDEAS API...")`)
- Error details logged via exception messages

## Comments

**When to Comment:**
- API endpoints: Include docstring with endpoint purpose
- Complex logic: Minimal - code should be self-documenting
- Matcher patterns: Explain exclusion patterns (e.g., Next.js middleware matcher comments)

**Docstrings/JSDoc:**
- Python: Triple-quoted docstrings for functions and classes (e.g., `"""User information response."""`, `"""Get Supabase client."""`)
- TypeScript: Minimal JSDoc usage - types and names should be self-explanatory

## Function Design

**Size:** Functions are typically 10-40 lines of logic

**Parameters:**
- React components accept destructured props with explicit typing
- Single argument objects preferred over multiple parameters
- Supabase clients passed as function returns, not global singletons

**Return Values:**
- React components return JSX elements or null
- Async functions return promises with data/error patterns from Supabase
- Python routes return JSON-serializable dicts or Pydantic models
- Utility functions return single transformed values

**Examples:**
```typescript
// Component pattern from `/c/dev/12ai/web/src/components/ui/button.tsx`
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

## Module Design

**Exports:**
- TypeScript: Named exports for components and utilities (e.g., `export { Button, buttonVariants }`)
- React: Default export for page components (e.g., `export default function LoginPage()`)
- Python: Router objects exposed at module level for FastAPI inclusion

**Barrel Files:**
- `/c/dev/12ai/web/src/components/ui/` files export individual components
- No index.ts barrel files in use - direct path imports preferred
- `/c/dev/12ai/api/src/routes/__init__.py` imports routers but doesn't re-export

**Data Attributes:**
- Components include `data-slot` attributes for testing and styling (e.g., `data-slot="button"`, `data-slot="input"`)
- Variant information stored in data attributes (e.g., `data-variant={variant}`, `data-size={size}`)

---

*Convention analysis: 2026-02-26*
