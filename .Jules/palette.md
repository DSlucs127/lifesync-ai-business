## 2025-05-20 - Icon-Only Buttons Missing Labels
**Learning:** This app heavily relies on icon-only buttons for critical navigation (Work Mode, Settings, Chat) without ARIA labels, making it inaccessible to screen reader users.
**Action:** Systematically audit all icon-only buttons during UI development and enforce `aria-label` or `title` (though `aria-label` is preferred for screen readers) as a required prop in component reviews.
