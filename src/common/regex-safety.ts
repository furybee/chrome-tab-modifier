/**
 * Regex Safety Utilities
 * Protects against Regular Expression Denial-of-Service (ReDoS) attacks
 */


/**
 * Checks if a regex pattern contains potentially dangerous constructs
 * that could lead to catastrophic backtracking
 */
export function _isRegexPatternSafe(pattern: string): boolean {
	try {
		// Check for empty or invalid patterns
		if (!pattern || typeof pattern !== 'string') {
			return false;
		}

		// Check for excessively long patterns (could indicate malicious intent)
		if (pattern.length > 1000) {
			return false;
		}

		// Detect patterns with nested quantifiers that can cause catastrophic backtracking
		// Examples: (a+)+, (a*)*, (a+)*, (a{1,5})+, etc.
		const nestedQuantifiers = /(\(.*?[*+{][^)]*\))[*+{]/g;
		if (nestedQuantifiers.test(pattern)) {
			return false;
		}

		// Detect patterns with multiple consecutive quantifiers
		const consecutiveQuantifiers = /[*+?{][*+?{]/;
		if (consecutiveQuantifiers.test(pattern)) {
			return false;
		}

		// Detect overlapping alternatives with quantifiers
		// Example: (a|a)*, (x+|x+y+)*
		const overlappingAlternatives = /\([^)]*\|[^)]*\)[*+{]/;
		if (overlappingAlternatives.test(pattern)) {
			return false;
		}

		// Try to construct the regex to ensure it's valid
		// nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
		// Safe: This is part of the validation process to check if the pattern is syntactically valid
		new RegExp(pattern);

		return true;
	} catch (error) {
		// Invalid regex pattern
		return false;
	}
}

/**
 * Safely executes a regex test with pattern validation
 * Note: Pattern validation helps prevent ReDoS but cannot provide runtime timeout in sync context
 * @param pattern - The regex pattern to test
 * @param input - The input string to test against
 * @returns true if the pattern matches, false otherwise or on error
 */
export function _safeRegexTestSync(pattern: string, input: string): boolean {
	// First, validate the pattern for safety
	if (!_isRegexPatternSafe(pattern)) {
		console.warn(`[Tabee] Unsafe regex pattern detected and blocked: ${pattern}`);
		return false;
	}

	try {
		// nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
		// Safe: Pattern has been validated by _isRegexPatternSafe() above to prevent ReDoS attacks
		const regex = new RegExp(pattern);
		return regex.test(input);
	} catch (error) {
		console.warn(`[Tabee] Regex execution error: ${error}`);
		return false;
	}
}
