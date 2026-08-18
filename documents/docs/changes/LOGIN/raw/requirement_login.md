# Requirement Document - Login

## 1. Screen Overview

- **Screen name:** Login
- **Business purpose of the screen:** Authenticate users before allowing access to the EDCAP system.
- **Reason for improvement / creation:** The new system requires a standard internal login screen using `username/password` as the primary authentication method.
- **Goal of the new version:** Provide a simple, secure, and user-friendly login flow that supports internal account authentication and redirects authenticated users to the correct post-login screen.

---

## 2. Scope

### In scope

- Login screen with `username` and `password` fields.
- Client-side validation before authentication request is sent.
- Authentication against the internal account data source.
- Creation of a valid authenticated state after successful login.
- Redirect after successful login.
- Safe and standardized error messages.
- Loading / disabled state during login submission.
- Handling inactive accounts.
- Logout support from an authentication-state perspective.
- Basic protection against repeated failed login attempts, depending on backend security policy.

### Out of scope

- Google login / SSO / OAuth.
- New account registration.
- Self-service password reset.
- Multi-factor authentication (MFA) in this version.
- User invitation flow.
- User profile management.
- Role and permission management screen.
- Remember device.
- Social login.

> Note: This requirement is for the standard login screen of the new EDCAP system.

---

## 3. Current State Summary

Summary based on the target system definition:

- **Current sections**
  - A complete login screen has not been standardized.
  - A standard internal authentication form has not been fully defined.
  - The `username/password` sign-in flow has not been fully described.

- **Current displayed information**
  - No standardized display structure for login information.
  - No standardized error message, success state, loading state, or disabled state.
- No confirmed behavior for inactive accounts.

- **Current user flow / interactions**
  - User opens the application.
  - If the user is not authenticated, the user should be redirected to the login screen.
  - User enters `username/password`.
  - User submits credentials for authentication.

- **Current strengths**
  - The authentication flow is simple and easy to understand.
  - The approach fits an internal account model.

- **Current issues / limitations**
  - Authentication rules and error messages need to be standardized.
  - The internal account data source needs to be confirmed.
  - Session creation and redirect behavior after login need to be clearly defined.
  - Account lock / inactive behavior needs to be clarified.
  - Audit logging expectations need to be confirmed.

---

## 4. Target State Summary

According to the target design / wireframe / product direction:

- **Target structure**
  - Centered login screen with a minimal form.
  - Branding or system identification at the top of the screen.
  - Main form area containing `username`, `password`, and the `Login` button.
  - Error message area displayed only when validation or authentication fails.

- **Target content organization**
  - Header: system name / branding.
  - Main content: login form.
  - Footer or lower area: error message, loading state, and optional support note if required.

- **Target visual hierarchy**
  - `Login` button is the primary CTA.
  - `username/password` fields are the main user input area.
  - Error messages must be visible but not expose sensitive information.
  - Loading state must clearly indicate that the authentication request is being processed.

- **Target interaction expectations**
  - User enters `username/password` and presses Enter or clicks `Login`.
  - The system validates required fields before sending the request.
  - If authentication succeeds, the system redirects the user to the post-login page.
  - If authentication fails, the system shows a generic error message.
  - If the account is inactive, the system shows a safe account access message.

- **Expected user experience improvements**
  - Login is easy and requires minimal steps.
  - Login behavior matches the internal account model.
  - Error handling is safe and consistent.
  - Sensitive authentication details are not exposed.
  - Success, failure, loading, and inactive states are clearly defined.

---

## 5. Change Requirements

| Section | Current State | Target State | Requirement | Keep / Change / New | Notes |
|---|---|---|---|---|---|
| Authentication method | Not standardized | Username/password | Build internal login flow using a form | New | Google / OAuth are out of scope |
| Login form | No standard form | Form with `username` and `password` | Create a minimal and easy-to-use login form | New | Password must be masked by default |
| Identity source | Not fully defined | Internal account data source | Use the designed internal account table as authentication source | New | Table and column names must be confirmed |
| Validation | Not standardized | Required-field validation before submit | Validate `username` and `password` before API call | New | API must not be called when required fields are empty |
| Error handling | Not standardized | Safe generic authentication error | Display safe error messages without exposing account existence | New | Do not reveal whether username exists |
| Loading state | Not defined | Button disabled while submitting | Prevent duplicate submission | New | Enter key and button click should share same behavior |
| Post-login state | Not fully defined | Valid authenticated state | Create session/token after successful login | New | Cookie or token strategy depends on architecture |
| Protected route handling | Not fully defined | Redirect unauthenticated users to login | Apply route guard behavior | New | Preserve `returnUrl` if required |
| Already authenticated behavior | Not defined | Redirect away from login page | Authenticated users should not stay on login page | New | Redirect to default landing page |
| Audit logging | Not confirmed | Login event recorded if enabled | Record login success/failure events | New | Do not log password |

---

## 6. Functional Requirements

### 6.1 Username Input

- **Purpose:** Collect the user's login identifier.
- **Displayed information:** `username` input field, clear label, and optional short placeholder.
- **Display rules:**
  - Field is required.
  - Leading and trailing spaces should be trimmed before submission.
  - The system must not automatically transform the value in a way that may confuse the user.
- **User interactions:**
  - User can type or paste a username.
  - User can use Tab to move to the password field.
- **Conditions / state behavior:**
  - Validate on blur or on submit.
  - If empty, block submission.
- **Empty state:** Display message: `Please enter your username`.
- **Error state:** Highlight the field and block submission if empty.

### 6.2 Password Input

- **Purpose:** Collect the password used for authentication.
- **Displayed information:** `password` input field with masked characters by default.
- **Display rules:**
  - Password must be hidden by default.
  - Password value must not be logged.
  - Password value must not be displayed in plain text unless a show/hide feature is explicitly supported.
  - Paste should be supported unless security policy says otherwise.
- **User interactions:**
  - User enters password.
  - User may toggle show/hide password if the UI supports it.
  - User can press Enter to submit the login form.
- **Conditions / state behavior:**
  - Validate on blur or on submit.
  - If empty, block submission.
- **Empty state:** Display message: `Please enter your password`.
- **Error state:** If authentication fails, show a generic authentication error instead of a technical reason.

### 6.3 Login Submission

- **Purpose:** Send login credentials to authenticate the user.
- **Displayed information:** `Login` button, loading state, success/failure message area.
- **Display rules:**
  - While processing, disable the Login button.
  - Prevent duplicate submission.
  - Support both button click and Enter key submission.
- **User interactions:**
  - User clicks `Login`.
  - User presses Enter from the password field.
- **Conditions / state behavior:**
  - If validation fails, do not call the API.
  - If authentication succeeds, create authenticated state and redirect.
  - If authentication fails, remain on the login page and show a generic error.
  - If the account is inactive or locked, show a safe account access message.
- **Empty state:** Not applicable.
- **Error state:** Show a generic message such as `Invalid username or password` or `Your account is not available`.

### 6.4 Authenticated Entry / Redirect

- **Purpose:** Move authenticated users into the system.
- **Displayed information:** No separate visible section is required on the login screen.
- **Display rules:**
  - After successful login, redirect to the default landing page or the last allowed page if `returnUrl` exists.
  - If the user already has a valid session, redirect away from the login page.
- **User interactions:** No additional user action is required after successful login.
- **Conditions / state behavior:**
  - Valid session allows access to protected screens.
  - Invalid or expired session redirects the user back to the login page.
- **Empty state:** Not applicable.
- **Error state:** If session creation fails, remain on login page and show a generic system error.

### 6.5 Logout / Session Invalidation

- **Purpose:** Remove the authenticated state and return the user to an unauthenticated state.
- **Displayed information:** Logout action is not part of the login screen, but the login feature must support the resulting unauthenticated state.
- **Display rules:**
  - After logout, protected screens must no longer be accessible.
  - The user should be redirected to the login page.
- **User interactions:** User triggers logout from authenticated area.
- **Conditions / state behavior:**
  - Local authentication state must be cleared.
  - Server-side session or refresh token should be invalidated if applicable.
- **Empty state:** Not applicable.
- **Error state:** If logout API fails, the system should still clear local state if security policy allows.

#### State Matrix - Login Result

| Metric / State | Displayed status/tag | Display condition |
|---|---|---|
| Initial | Empty form | User opens login page without session |
| Validation error | Field-level validation | `username` or `password` is empty |
| Loading | Login button disabled | Login request is being processed |
| Success | `Login successful` or redirect immediately | Username/password are valid, account is active, and session is created |
| Invalid credentials | `Invalid username or password` | Credentials do not match a valid account |
| Inactive account | `Your account is not available` | Account is inactive, disabled, or not yet activated |
| System error | `Unable to login. Please try again later.` | API or authentication service error |
| Session expired | Redirect to login | Existing session is no longer valid |

---

## 7. Business Rules

- `username` and `password` are required fields.
- Authentication data must be checked against a valid record in the designed internal account table.
- Password must be stored and verified as a one-way hash. Plain text password must never be stored.
- The system must not return messages such as `username does not exist` or `password is incorrect`.
- Only active and valid accounts are allowed to login.
- After successful login, the user must receive the correct role / permission mapping.
- `password` must not be written to logs, analytics, debug output, API response, or audit trail.
- Authenticated users must not use the login page as a normal page.
- Unauthenticated users must not access protected screens or protected APIs.
- Session expiration must return the user to the login page.
- If `returnUrl` exists and is allowed, the user should be redirected to it after login.

---

## 8. Data / API / Integration Notes

- **Primary API(s):**
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`

- **Data sources:**
  - Internal account table is the primary authentication source.
  - Role / team / permission-related tables are used to determine authorization after login.

- **Authorization boundary:**
  - Only users with a valid, active account and successful authentication can receive a session/token.
  - Protected APIs must verify the authenticated state.
  - Frontend route guards are not enough by themselves; backend APIs must also enforce authentication.

- **Backward compatibility constraints:**
  - Do not add another login method to the standard login UI in this ticket.
  - SSO/OAuth may be considered in a later ticket.

- **Logging / observability expectations:**
  - Record login success/failure events if audit logging is enabled.
  - Store timestamp, result, trace ID, and source metadata such as IP/user-agent if policy allows.
  - Do not log password or token values.
  - API responses should include `traceId` when available.

### 8.1 Login API Example

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "username": "user01",
  "password": "********"
}
```

Success response:

```json
{
  "user": {
    "userId": "usr_001",
    "username": "user01",
    "displayName": "PM Role",
    "role": "PM",
    "permissions": [
      "dashboard:view",
      "project:view"
    ]
  },
  "accessToken": "<token>",
  "refreshToken": "<refreshToken>",
  "traceId": "trc_123"
}
```

Failure response:

```json
{
  "message": "Invalid username or password.",
  "traceId": "trc_456"
}
```

---

## 9. Open Questions

- What is the official name of the internal account table?
- What are the exact column names for `username` and `password_hash`?
- Will the system use session cookie, access token, or access token + refresh token?
- How should invalid login attempts be handled safely?
- What is the default redirect page after successful login?
- Should the system preserve `returnUrl` when redirecting from a protected screen?
- Should login audit logging be included in MVP?
- How should inactive, locked, disabled, and not-yet-activated accounts be distinguished internally?
- Is `username` case-sensitive or case-insensitive?
- Is password reset completely out of scope for this ticket or only not visible on the login screen?

---

## 10. Acceptance Criteria

1. **AC-LGN-01:** The login screen displays a form with `username` and `password`.
2. **AC-LGN-02:** If the user submits the form without `username`, the system blocks submission and displays a clear validation message.
3. **AC-LGN-03:** If the user submits the form without `password`, the system blocks submission and displays a clear validation message.
4. **AC-LGN-04:** If the user enters valid credentials for an active account, login succeeds.
5. **AC-LGN-05:** If the user enters invalid credentials, the system shows a generic error message and does not reveal whether the username exists.
6. **AC-LGN-06:** Password is masked by default and must not appear in logs, responses, or debug output.
7. **AC-LGN-07:** After successful login, the system creates a valid authenticated state for protected screens and APIs.
8. **AC-LGN-08:** After successful login, the user is redirected to the default landing page or allowed `returnUrl`.
9. **AC-LGN-09:** An authenticated user who opens the login page is redirected away from the login page.
10. **AC-LGN-10:** An unauthenticated user who opens a protected screen is redirected to the login page.
11. **AC-LGN-11:** Inactive / locked / disabled accounts cannot login and receive a safe account access message.
12. **AC-LGN-12:** During login request processing, the Login button is disabled and a loading state is shown.
13. **AC-LGN-13:** Duplicate submission is prevented while login is processing.
14. **AC-LGN-14:** The system handles invalid login attempts safely without exposing account state.
15. **AC-LGN-15:** Logout invalidates or clears the authenticated state and prevents access to protected screens.
16. **AC-LGN-16:** Login success/failure events are recorded if audit logging is enabled.

### 10.1 Traceability To `spec-pack.md`

- Each `AC-LGN-xx` must map directly to the same ID in `spec-pack.md`.
- Acceptance criteria in this document are business / UAT level.
- `spec-pack.md` should expand these into API, validation, data contract, test case, and error handling details.

---

## 11. Summary of Required Changes

### Top required improvements

- Build an internal login flow using `username/password`.
- Define the internal account source and permission mapping clearly.
- Standardize validation, loading, success, failure, and inactive states.
- Standardize safe authentication error messages.
- Define post-login redirect and protected route behavior.
- Ensure password and token values are never logged or exposed.

### Items that should remain unchanged

- Login remains the only standard entry point before accessing the system.
- After successful authentication, the user is redirected into the main application.
- Authorization after login must follow the existing role / team / permission model.
- Alternative login methods such as SSO/OAuth remain out of scope for this ticket.

### Items that need confirmation before design/development starts

- Official internal account table name.
- Actual column names for `username` and `password_hash`.
- Authentication storage strategy: session cookie, token, or token + refresh token.
- Invalid login attempt handling policy.
- Default redirect page after login.
- Whether `returnUrl` must be supported in MVP.
- Whether login audit logging is required in MVP.
