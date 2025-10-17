# Security

This document describes security measures implemented in Tabee.

## CI/CD Security Scanning

Tabee uses multiple security scanning tools in the CI/CD pipeline to ensure code quality and security:

### 1. ClamAV Malware Scan
- **Purpose**: Detects viruses, trojans, and other malware in the codebase
- **Frequency**: On every push to any branch
- **Configuration**: `.github/workflows/ci.yml` - `clamav_malware_scan` job
- **Coverage**: Scans all files except `node_modules`, `.git`, and `dist`
- **Action on detection**: Pipeline fails if malware is detected

### 2. Gitleaks Secret Scan
- **Purpose**: Detects hardcoded secrets, API keys, and credentials
- **Configuration**: `.github/workflows/ci.yml` - `gitleaks_scan` job
- **Action**: Official `gitleaks/gitleaks-action@v2`
- **Scope**: Full git history scan (`fetch-depth: 0`)
- **Results**: Uploaded to GitHub Security Dashboard as SARIF
- **Action on detection**: Pipeline fails if secrets are found

### 3. Dependency Vulnerability Audit
- **Purpose**: Checks for known vulnerabilities in npm/yarn dependencies
- **Configuration**: `.github/workflows/ci.yml` - `dependency_audit` job
- **Severity**: Fails on HIGH severity and above
- **Tool**: `audit-ci` with yarn

### 4. Test Coverage
- **Purpose**: Ensures code quality and tracks test coverage
- **Configuration**: `.github/workflows/ci.yml` - `test` job
- **Tool**: Vitest with coverage reporting
- **Results**: Coverage reports generated on every push

## ReDoS (Regular Expression Denial of Service) Protection

### Background

Tabee allows users to create rules with regular expressions to match URLs. User-controlled regex patterns can potentially be exploited to cause ReDoS attacks, where malicious regex patterns with catastrophic backtracking can freeze the browser tab.

### Implementation

We've implemented multi-layered protection against ReDoS attacks:

#### 1. Pattern Validation (`src/common/regex-safety.ts`)

The `_isRegexPatternSafe()` function validates regex patterns before execution:

- **Nested Quantifiers**: Blocks patterns like `(a+)+`, `(a*)*`, `(a{1,5})+` that cause exponential backtracking
- **Consecutive Quantifiers**: Blocks patterns like `a**`, `a+*` that are invalid or dangerous
- **Overlapping Alternatives**: Blocks patterns like `(a|a)*`, `(x+|x+y+)*` that create unnecessary backtracking
- **Length Limits**: Rejects patterns longer than 1000 characters
- **Syntax Validation**: Ensures the pattern is a valid regex

#### 2. Safe Execution

The `_safeRegexTestSync()` function:
1. Validates the pattern before execution
2. Catches and logs any execution errors
3. Returns `false` for unsafe patterns instead of executing them

### Usage

Instead of using `new RegExp(pattern).test(url)` directly, always use:

```typescript
import { _safeRegexTestSync } from './regex-safety.ts';

// Safe regex execution
const matches = _safeRegexTestSync(userPattern, url);
```

### Examples of Blocked Patterns

**Dangerous patterns that are blocked:**
```regex
(a+)+           # Nested quantifiers
(a*)*           # Nested quantifiers
(a|a)*          # Overlapping alternatives
(x+|x+y+)*      # Overlapping alternatives with quantifiers
a++             # Consecutive quantifiers
```

**Safe patterns that are allowed:**
```regex
example\.com                           # Simple literal match
^https://[a-z]+\.example\.com         # Character classes with quantifiers
[0-9]{1,4}                            # Bounded quantifiers
(?!MOUNCE).*version=                  # Negative lookahead
```

### Testing

Comprehensive tests are in `src/common/regex-safety.test.js` covering:
- Safe pattern validation
- Dangerous pattern detection and blocking
- Real-world regex patterns from existing rules
- Edge cases and error handling

### Best Practices

1. **Prefer simpler detection methods** when possible:
   - Use `CONTAINS` for substring matching
   - Use `STARTS_WITH` / `ENDS_WITH` for prefix/suffix matching
   - Use `EXACT` for exact matching
   - Use `REGEX` only when pattern matching is truly needed

2. **Write safe regex patterns**:
   - Avoid nested quantifiers
   - Use bounded quantifiers (`{1,5}`) instead of unbounded (`*`, `+`)
   - Keep patterns as simple as possible
   - Test patterns with the safety validator

3. **Document complex patterns**:
   - Add comments explaining what the pattern matches
   - Include test cases for complex patterns

## Missing Regex Anchors in URL/Title Matchers

### Background

The `url_matcher` and `title_matcher` features allow users to extract parts of URLs and page titles using regular expressions with capture groups. When regex patterns don't use anchors (`^` for start, `$` for end), they can match anywhere in the input string, potentially causing unexpected behavior.

### Context: Not a Critical Security Issue

In Tabee, `url_matcher` and `title_matcher` are used to **extract content** for display in tab titles, not for security-critical validation like URL redirection or authentication. Therefore, missing anchors here represent a **usability concern** rather than a security vulnerability.

However, to prevent unexpected matches and follow security best practices, we recommend using anchored patterns.

### Recommendations

#### Use Anchors When Possible

**Unanchored pattern (may match unexpectedly):**
```regex
https:\/\/example\.com\/(.+)
# Could match: "evil.com?redirect=https://example.com/test"
```

**Anchored pattern (matches precisely):**
```regex
^https:\/\/example\.com\/(.+)
# Only matches URLs starting with https://example.com/
```

#### Examples of Safe Patterns

**URL Matcher for GitHub repositories:**
```regex
^https:\/\/github\.com\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)
```

**URL Matcher for query parameters:**
```regex
[?&]date=([0-9]{4}-[0-9]{2}-[0-9]{2})
# Note: This doesn't need ^ anchor as we're matching a specific parameter
```

**Title Matcher with full anchors:**
```regex
^[a-z]*@gmail\.com$
```

#### When Anchors Are Optional

For patterns that specifically target **substrings** (like query parameters or path segments), anchors may not be needed:

```regex
# Extracting query parameter - no anchor needed
[?&]id=([0-9]+)

# Extracting date from URL - no anchor needed
date=([0-9]{4}-[0-9]{2}-[0-9]{2})
```

### Implementation

The regex safety checks in `src/content.js` already validate patterns before execution. To enhance this:

1. **Pattern Validation**: The `isRegexSafe()` function checks for dangerous patterns
2. **Safe Execution**: The `createSafeRegex()` function creates validated regex instances
3. **Error Handling**: All regex operations are wrapped in try-catch blocks

### Best Practices for URL/Title Matchers

1. **Use anchors (`^`, `$`) when matching complete URLs or titles**
   ```regex
   ✅ ^https:\/\/example\.com\/path$
   ❌ https:\/\/example\.com\/path
   ```

2. **Be specific with your patterns**
   ```regex
   ✅ ^https:\/\/github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+
   ❌ .+github.com.+
   ```

3. **Use character classes instead of wildcards when possible**
   ```regex
   ✅ [A-Za-z0-9_-]+
   ❌ .+
   ```

4. **Test your patterns with the regex safety validator**
   - Patterns are automatically validated before use
   - Check browser console for validation warnings

5. **Consider the use case**
   - For extracting specific parts: anchors may be optional
   - For matching the entire URL/title: always use anchors

### References

- [OWASP: Regular Expression Denial of Service](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)
- [Semgrep Rule: detect-non-literal-regexp](https://semgrep.dev/r/javascript.lang.security.audit.detect-non-literal-regexp)
- [CodeQL: Missing Regular Expression Anchor](https://codeql.github.com/codeql-query-help/javascript/js-regex-missing-anchor/)
- [OWASP: Server Side Request Forgery](https://owasp.org/www-community/attacks/Server_Side_Request_Forgery)
