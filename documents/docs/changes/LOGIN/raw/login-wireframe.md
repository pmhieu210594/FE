# Wireframe - Login

> Converted from a UI concept into a Markdown wireframe for handoff, UI review, BA specification, or developer handoff.

## 1. Overall Screen

- **Screen type:** Login screen
- **Style:** Desktop web app, centered authentication layout
- **Display language:** Vietnamese
- **Main goal:** Let users sign in with `username/password` and enter the system securely

---

## 2. Layout Structure

```text
+----------------------------------------------------------------------------------+
| HEADER                                                                           |
| [SYSTEM LOGO]                                                                    |
+----------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------+
| MAIN AUTH AREA                                                                   |
|                                                                                  |
|                    +----------------------------------------+                    |
|                    |  Welcome to [SYSTEM NAME]             |                    |
|                    |  Sign in to continue                   |                    |
|                    |----------------------------------------|                    |
|                    |  Username                             |                    |
|                    |  [______________________________]     |                    |
|                    |                                        |                    |
|                    |  Password                             |                    |
|                    |  [______________________________] [eye]|                    |
|                    |                                        |                    |
|                    |  [ ] Remember me                       |                    |
|                    |                                        |                    |
|                    |  [   Đăng nhập   ]                     |                    |
|                    |                                        |                    |
|                    |  [Error / status message area]         |                    |
|                    +----------------------------------------+                    |
|                                                                                  |
+----------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------+
| FOOTER / SUPPORT                                                                 |
| [Help text / contact / version note]                                             |
+----------------------------------------------------------------------------------+
```

---

## 3. Detailed Breakdown by Section

## 3.1 Header

**Components:**
- System logo
- Optional system name

**Purpose:**
- Create brand recognition
- Keep the screen visually anchored

**Wireframe:**
```text
[ SYSTEM LOGO ]
```

---

## 3.2 Main Auth Area

This is the primary focus area of the screen.

### Visual concept
- A centered card or panel
- Clear hierarchy from title to form to action button
- Minimal distraction
- Mobile-friendly stacked layout in smaller widths

### Content
- Greeting / heading
- Short subtitle
- Username input
- Password input
- Remember me checkbox
- Submit button
- Error / status message area

**Wireframe:**
```text
+----------------------------------------+
| Welcome to [SYSTEM NAME]               |
| Sign in to continue                    |
|----------------------------------------|
| Username                               |
| [______________________________]       |
|                                        |
| Password                               |
| [______________________________] [eye] |
|                                        |
| [ ] Remember me                        |
|                                        |
| [          Đăng nhập          ]       |
|                                        |
| Forgot password?                       |
|                                        |
| [ Error / status message ]             |
+----------------------------------------+
```

---

## 3.3 Username Field

**Components:**
- Label: `Username`
- Input box
- Validation state on blur / submit

**Behavior:**
- Accept plain text
- Trim leading/trailing spaces on submit
- Show inline validation if empty

**Wireframe:**
```text
Username
[______________________________]
```

---

## 3.4 Password Field

**Components:**
- Label: `Password`
- Password input
- Eye icon toggle for show/hide

**Behavior:**
- Mask input by default
- Allow user to toggle visibility
- Show inline validation if empty

**Wireframe:**
```text
Password
[______________________________] [eye]
```

---

## 3.5 Remember Me

**Purpose:**
- Let users keep the session for a longer period if the product policy allows it

**Notes:**
- Optional in MVP
- Can be hidden if session policy does not support it

**Wireframe:**
```text
[ ] Remember me
```

---

## 3.6 Submit Button

**Components:**
- Primary button: `Đăng nhập`

**Behavior:**
- Disabled while request is in progress
- Supports Enter key submit
- Shows loading state when authenticating

**Wireframe:**
```text
[          Đăng nhập          ]
```

---

## 3.7 Error / Status Area

**Purpose:**
- Display validation errors and authentication failures
- Keep feedback visible without overwhelming the screen

**Example states:**
- Missing username
- Missing password
- Invalid credentials
- Account locked / inactive
- Server unavailable

**Wireframe:**
```text
[ Error / status message ]
```

---

## 3.9 Footer / Support Area

**Components:**
- Help text
- Contact / support note
- Version note if needed

**Purpose:**
- Provide a small support anchor for users who cannot sign in

**Wireframe:**
```text
[ Help text / contact / version note ]
```

---

## 4. Main Interaction Flow

### Interaction 1
- User opens the login page
- The username field is focused by default

### Interaction 2
- User enters `username` and `password`
- User clicks `Đăng nhập` or presses Enter

### Interaction 3
- If data is invalid, the relevant validation message appears
- The form stays on screen

### Interaction 4
- If authentication succeeds, the user is redirected into the system
- The login card is replaced by the authenticated flow

### Interaction 5
- If account is inactive, the user sees a status message and cannot continue

---

## 5. Main Data Components

### Form data
- Username
- Password
- Remember me flag

### Validation data
- Required field checks
- Authentication status
- Account state

### System feedback
- Loading
- Success redirect
- Error message
- Locked / inactive state
