# Proposal: Add `unique_pattern` Field to Rule Schema

## Status
🟡 **Proposed** - Not yet implemented

## Problem Statement

Currently, the `url_fragment` field serves two conflicting purposes:

1. **Detection**: Determine if a rule should apply to a tab
2. **Uniqueness**: Determine if two tabs are duplicates (when `unique: true`)

This creates an architectural limitation where users cannot have both:
- A flexible detection pattern (e.g., REGEX with `\d+`)
- Granular uniqueness based on captured groups (e.g., templates with `$1`)

### Current Limitation Example

**What users want to do:**
```json
{
  "detection": "REGEX",
  "url_fragment": "github\\.com/.+/issues/$1",  // ❌ Invalid regex!
  "tab": {
    "unique": true,
    "url_matcher": "github\\.com/.+/issues/(\\d+)"
  }
}
```

**Why it doesn't work:**
- `url_fragment` with `$1` is not a valid regex pattern for detection
- `CONTAINS` with `$1` literally searches for the string "$1" in URLs
- Without `$1`, all GitHub issues are considered identical duplicates

## Proposed Solution

Add a new optional field `unique_pattern` to the rule schema that:
- Contains a **template** with placeholders (`$1`, `$2`, etc.)
- Is used **exclusively** for determining tab uniqueness
- Works with `url_matcher` to extract and substitute values
- Falls back to `url_fragment` if not specified (backward compatible)

## Schema Changes

### Before (Current)
```typescript
interface Rule {
  url_fragment: string;  // Used for BOTH detection AND uniqueness
  detection?: 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'REGEX' | 'EXACT';
  tab: {
    unique?: boolean;
    url_matcher?: string | null;
    // ...
  };
}
```

### After (Proposed)
```typescript
interface Rule {
  url_fragment: string;  // Used ONLY for detection
  detection?: 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'REGEX' | 'EXACT';
  tab: {
    unique?: boolean;
    url_matcher?: string | null;
    unique_pattern?: string | null;  // ← NEW: Used ONLY for uniqueness
    // ...
  };
}
```

## How It Works

### 1. Detection Phase
**Uses `url_fragment` + `detection` type**

```javascript
// Check if rule applies to current URL
const currentUrl = "https://github.com/owner/repo/issues/123";
const urlFragment = "github\\.com/.+/issues/\\d+";
const detectionType = "REGEX";

if (new RegExp(urlFragment).test(currentUrl)) {
  // ✅ Rule applies!
}
```

### 2. Capture Phase
**Uses `url_matcher` to extract data**

```javascript
const urlMatcher = "github\\.com/.+/issues/(\\d+)";
const matches = new RegExp(urlMatcher).exec(currentUrl);
// matches[1] = "123"
```

### 3. Uniqueness Phase
**Uses `unique_pattern` template to generate unique identifier**

```javascript
const uniquePattern = "github.com/issues/$1";
const uniqueId = _processUrlFragment(uniquePattern, currentUrl, urlMatcher);
// uniqueId = "github.com/issues/123"
```

### 4. Comparison
**Compare unique IDs between tabs**

```javascript
// Tab 1: github.com/owner/repo/issues/123 → uniqueId: "github.com/issues/123"
// Tab 2: github.com/owner/repo/issues/456 → uniqueId: "github.com/issues/456"
// Tab 3: github.com/other/repo/issues/123 → uniqueId: "github.com/issues/123"

// Result: Tab 1 and Tab 3 are duplicates (same issue number)
//         Tab 2 is unique (different issue number)
```

## Usage Examples

### Example 1: GitHub Issues (Unique by Issue Number)

**Goal**: Allow one tab per issue number, regardless of repository.

```json
{
  "name": "GitHub Issues - Unique per Issue Number",
  "detection": "REGEX",
  "url_fragment": "github\\.com/.+/issues/\\d+",
  "tab": {
    "title": "Issue #$1",
    "unique": true,
    "url_matcher": "github\\.com/.+/issues/(\\d+)",
    "unique_pattern": "github.com/issues/$1"
  }
}
```

**Behavior**:
- `microsoft/vscode/issues/123` → Unique ID: `github.com/issues/123`
- `furybee/chrome-tab-modifier/issues/123` → Unique ID: `github.com/issues/123`
- ✅ Only ONE tab with issue #123 allowed (closes duplicate)

---

### Example 2: GitHub Issues (Unique by Repo + Issue)

**Goal**: Allow one tab per issue number PER repository.

```json
{
  "name": "GitHub Issues - Unique per Repo & Issue",
  "detection": "REGEX",
  "url_fragment": "github\\.com/.+/issues/\\d+",
  "tab": {
    "title": "$1/$2 #$3",
    "unique": true,
    "url_matcher": "github\\.com/([^/]+)/([^/]+)/issues/(\\d+)",
    "unique_pattern": "github.com/$1/$2/issues/$3"
  }
}
```

**Behavior**:
- `microsoft/vscode/issues/123` → Unique ID: `github.com/microsoft/vscode/issues/123`
- `microsoft/vscode/issues/456` → Unique ID: `github.com/microsoft/vscode/issues/456`
- `furybee/chrome-tab-modifier/issues/123` → Unique ID: `github.com/furybee/chrome-tab-modifier/issues/123`
- ✅ Multiple repos can have issue #123 simultaneously

---

### Example 3: Jira Tickets

**Goal**: One tab per Jira ticket (e.g., PROJ-123).

```json
{
  "name": "Jira Tickets",
  "detection": "REGEX",
  "url_fragment": "atlassian\\.net/browse/[A-Z]+-\\d+",
  "tab": {
    "title": "Jira: $1",
    "unique": true,
    "url_matcher": "atlassian\\.net/browse/([A-Z]+-\\d+)",
    "unique_pattern": "jira/$1"
  }
}
```

**Behavior**:
- `mysite.atlassian.net/browse/PROJ-123` → Unique ID: `jira/PROJ-123`
- `company.atlassian.net/browse/PROJ-123` → Unique ID: `jira/PROJ-123`
- ✅ Same ticket across different Jira instances = duplicate

---

### Example 4: Gmail Conversations

**Goal**: One tab per email conversation.

```json
{
  "name": "Gmail Conversations",
  "detection": "CONTAINS",
  "url_fragment": "mail.google.com/mail",
  "tab": {
    "unique": true,
    "url_matcher": "mail\\.google\\.com/mail/.+#.+/([a-f0-9]+)",
    "unique_pattern": "gmail/conversation/$1"
  }
}
```

**Behavior**:
- `mail.google.com/mail/u/0/#inbox/abc123` → Unique ID: `gmail/conversation/abc123`
- `mail.google.com/mail/u/1/#inbox/abc123` → Unique ID: `gmail/conversation/abc123`
- ✅ Same conversation across different accounts = duplicate

---

### Example 5: Simple Unique (Just First Capture)

**Goal**: Minimal configuration.

```json
{
  "detection": "REGEX",
  "url_fragment": "example\\.com/item/\\d+",
  "tab": {
    "unique": true,
    "url_matcher": "example\\.com/item/(\\d+)",
    "unique_pattern": "$1"
  }
}
```

**Behavior**:
- `example.com/item/123?ref=twitter` → Unique ID: `123`
- `example.com/item/123?ref=facebook` → Unique ID: `123`
- ✅ Same item with different query params = duplicate

## Implementation Details

### Code Changes Required

#### 1. Update Type Definition (`src/common/types.ts`)

```typescript
export interface TabSettings {
  // ... existing fields
  unique_pattern?: string | null;  // NEW
}
```

#### 2. Update `handleSetUnique` (`src/background/TabRulesService.ts`)

```typescript
async handleSetUnique(message: any, currentTab: chrome.tabs.Tab): Promise<void> {
  const rule = message.rule as Rule;

  // NEW: Use unique_pattern if available, fallback to url_fragment
  const uniqueTemplate = rule?.tab?.unique_pattern || message.url_fragment;

  // Verify current tab matches the pattern
  if (rule?.tab?.url_matcher) {
    const regex = new RegExp(rule.tab.url_matcher);
    if (!regex.test(currentTab.url)) return;
  }

  // Generate unique identifier for current tab
  const processedUnique = _processUrlFragment(
    uniqueTemplate,
    currentTab.url,
    rule?.tab?.url_matcher
  );

  const tabs = await this.queryTabs({});

  for (const tab of tabs) {
    if (!tab.url || !tab.id) continue;

    // Skip tabs that don't match the pattern
    if (rule?.tab?.url_matcher) {
      const regex = new RegExp(rule.tab.url_matcher);
      if (!regex.test(tab.url)) continue;
    }

    // Generate unique identifier for this tab
    const tabUnique = _processUrlFragment(
      uniqueTemplate,
      tab.url,
      rule?.tab?.url_matcher
    );

    // Compare unique identifiers
    if (tabUnique === processedUnique && tab.id !== currentTab.id) {
      await chrome.tabs.remove(tab.id);
      return;
    }
  }
}
```

#### 3. Update UI (`src/components/options/...`)

Add a new input field in the rule editor:
- Label: "Unique Pattern" (optional)
- Placeholder: "e.g., github.com/issues/$1"
- Help text: "Template to determine uniqueness. Use $1, $2 for captured groups from URL Matcher"
- Show only when `unique: true`

### Backward Compatibility

✅ **Fully backward compatible**:
- If `unique_pattern` is not specified → use `url_fragment` (current behavior)
- Existing rules continue working without modification
- No breaking changes to API or storage format

### Migration Path

1. **Phase 1**: Add field to schema (optional, default: `null`)
2. **Phase 2**: Update backend logic to prefer `unique_pattern` over `url_fragment`
3. **Phase 3**: Update UI to show new field
4. **Phase 4**: Documentation and examples

## Benefits

### 1. Separation of Concerns
- ✅ `url_fragment` → Detection (clear, single purpose)
- ✅ `unique_pattern` → Uniqueness (clear, single purpose)
- ✅ No more conflicting requirements

### 2. Maximum Flexibility
- ✅ Complex regex detection + granular uniqueness
- ✅ Multiple capture groups in templates
- ✅ Custom unique identifiers for debugging

### 3. User Experience
- ✅ Field name clearly indicates its purpose
- ✅ Can use placeholders without breaking detection
- ✅ Easier to understand and configure

### 4. Debugging
- ✅ Unique IDs can include context (e.g., `"github.com/issues/123"` vs just `"123"`)
- ✅ Logs show meaningful identifiers
- ✅ Easier to troubleshoot duplicate detection

## Typical Values

Common patterns for `unique_pattern`:

| Use Case | Value | Description |
|----------|-------|-------------|
| Simple unique | `"$1"` | Just the first captured group |
| With prefix | `"github.com/issues/$1"` | More readable in logs |
| Multiple captures | `"$1/$2/item/$3"` | Combine multiple groups |
| With context | `"gmail/conv-$1"` | Add context for debugging |
| Nested groups | `"site/$1/page/$2/section/$3"` | Multi-level uniqueness |

## Edge Cases

### Without `url_matcher`
If `unique_pattern` is specified but `url_matcher` is null:
- Template has no data to substitute
- Returns `unique_pattern` as-is (no substitution)
- Not recommended, should show warning in UI

### Invalid Placeholders
If `unique_pattern` uses `$5` but `url_matcher` only has 2 capture groups:
- Unmatched placeholders remain as-is (`"$5"`)
- `_processUrlFragment` already handles this (removes unhandled groups)

### Empty Pattern
If `unique_pattern` is empty string:
- Fall back to `url_fragment`
- Same as not specifying the field

## Future Enhancements

### 1. UI Improvements
- Template preview showing real-time substitution
- Validation of placeholder count vs capture groups
- Suggested templates based on `url_matcher`

### 2. Advanced Templates
- Custom functions: `${lowercase:$1}`, `${normalize:$2}`
- Date-based uniqueness: `${date:YYYY-MM-DD}-$1`
- Hash-based: `${hash:$1$2}`

### 3. Migration Tool
- Auto-detect rules that would benefit from `unique_pattern`
- Suggest values based on current `url_fragment`
- One-click conversion

## Testing Strategy

### Unit Tests
- `_processUrlFragment` with `unique_pattern` (already tested)
- `handleSetUnique` using `unique_pattern` vs fallback
- Edge cases (missing matcher, invalid placeholders)

### Integration Tests
- Multiple tabs with same/different unique IDs
- Backward compatibility with existing rules
- SPA navigation with `unique_pattern`

### Manual Testing
- GitHub issues with different configs
- Gmail conversations
- Jira tickets
- Migration from old rules

## Documentation Updates

### User Documentation
- Add section to rule configuration guide
- Examples for common use cases
- Migration guide for existing rules

### Developer Documentation
- Update schema documentation
- Add JSDoc comments to new fields
- Update API reference

## Timeline Estimate

- **Schema + Backend**: 2-4 hours
- **UI Updates**: 3-5 hours
- **Testing**: 2-3 hours
- **Documentation**: 2-3 hours
- **Total**: ~10-15 hours

## Open Questions

1. Should `unique_pattern` support regex patterns or just templates?
   - **Recommendation**: Templates only (simpler, clearer purpose)

2. Should we add validation to ensure `unique_pattern` placeholders match `url_matcher` groups?
   - **Recommendation**: Yes, show warning in UI but don't block

3. Should there be a default `unique_pattern` value when `unique: true` is set?
   - **Recommendation**: No, fall back to `url_fragment` for backward compatibility

4. Should we deprecate using `url_fragment` for uniqueness?
   - **Recommendation**: No, keep as fallback for simplicity

## References

- Related Issue: User report about GitHub issues unique not working
- Current Implementation: `src/background/TabRulesService.ts:41-114`
- Helper Function: `src/common/helpers.ts:248-274` (`_processUrlFragment`)
- Tests: `src/background/__tests__/TabRulesService.unique.test.ts`
