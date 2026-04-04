# Component Spec: [Component Name]

---

## Overview
One or two sentences. What is this component and where does it live in the app?

---

## Location
- **File path:** `client/src/components/[folder]/[ComponentName]/[ComponentName].jsx`
- **Used in:** [Parent component or page that renders this]

---

## Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `propName` | `string` | Yes | What it does |
| `onAction` | `function` | No | Callback when X happens |

---

## Data
- **API endpoint(s):** `GET /api/...`
- **Request payload:** (if POST/PUT)
- **Response shape:** List the fields the component actually uses

---

## States
- **Loading:** What renders while data is being fetched
- **Empty:** What renders when there is no data
- **Error:** What renders if the request fails
- **Populated:** What the component looks like with data

---

## Interactions
- Clicking X does Y
- Submitting the form calls Z endpoint with these fields
- Hovering over X shows Y

---

## Edge Cases
- What happens if the user is not authenticated
- What happens if a field is missing or null
- Any validation rules (max length, required fields, etc.)

---

## Out of Scope
List anything that might seem related but should NOT be built as part of this component.
