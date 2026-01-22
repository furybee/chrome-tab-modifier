import { describe, it, expect, beforeEach } from 'vitest';
import { RegexService } from '../RegexService';

describe('RegexService', () => {
	let service: RegexService;

	beforeEach(() => {
		service = new RegexService();
	});

	describe('isRegexSafe', () => {
		it('should return false for non-string patterns', () => {
			const result = service.isRegexSafe(123 as any);
			expect(result).toBe(false);
		});

		it('should return false for patterns longer than 200 characters', () => {
			const longPattern = 'a'.repeat(201);
			const result = service.isRegexSafe(longPattern);
			expect(result).toBe(false);
		});

		it('should return false for positive lookahead with quantifiers', () => {
			const result = service.isRegexSafe('(?=.*)+');
			expect(result).toBe(false);
		});

		it('should return false for negative lookahead with quantifiers', () => {
			const result = service.isRegexSafe('(?!.*)+');
			expect(result).toBe(false);
		});

		it('should return false for catastrophic backtracking patterns', () => {
			const result = service.isRegexSafe('(.+)+$');
			expect(result).toBe(false);
		});

		it('should return false for conflicting quantifiers', () => {
			const result = service.isRegexSafe('(.+)*+');
			expect(result).toBe(false);
		});

		it('should return false for multiple .* in groups', () => {
			const result = service.isRegexSafe('(.*){2,}');
			expect(result).toBe(false);
		});

		it('should return false for multiple .+ in groups', () => {
			const result = service.isRegexSafe('(.+){2,}');
			expect(result).toBe(false);
		});

		it('should return true for safe patterns', () => {
			expect(service.isRegexSafe('hello.*world')).toBe(true);
			expect(service.isRegexSafe('^https?://')).toBe(true);
			expect(service.isRegexSafe('\\d{3}-\\d{4}')).toBe(true);
			expect(service.isRegexSafe('[a-zA-Z]+')).toBe(true);
		});
	});

	describe('createSafeRegex', () => {
		it('should throw error for unsafe patterns', () => {
			expect(() => service.createSafeRegex('(?=.*)+')).toThrow(
				'Potentially unsafe regex pattern detected'
			);
		});

		it('should throw error for patterns longer than 200 characters', () => {
			const longPattern = 'a'.repeat(201);
			expect(() => service.createSafeRegex(longPattern)).toThrow(
				'Potentially unsafe regex pattern detected'
			);
		});

		it('should create regex with default flags', () => {
			const regex = service.createSafeRegex('test');
			expect(regex.flags).toBe('g');
		});

		it('should create regex with custom flags', () => {
			const regex = service.createSafeRegex('test', 'gi');
			expect(regex.flags).toBe('gi');
		});

		it('should throw error for invalid regex syntax', () => {
			expect(() => service.createSafeRegex('[invalid')).toThrow('Invalid regex pattern');
		});

		it('should create valid regex for safe patterns', () => {
			// Using '' flags instead of 'g' for test() method to avoid stateful matching
			const regex = service.createSafeRegex('hello.*world', '');
			expect(regex.test('hello beautiful world')).toBe(true);
			expect(regex.test('hello world')).toBe(true);
			expect(regex.test('goodbye world')).toBe(false);
		});

		it('should handle escape sequences correctly', () => {
			const regex = service.createSafeRegex('\\d{3}-\\d{4}');
			expect(regex.test('123-4567')).toBe(true);
			expect(regex.test('abc-defg')).toBe(false);
		});

		it('should handle character classes', () => {
			const regex = service.createSafeRegex('[a-z]+');
			expect(regex.test('hello')).toBe(true);
			expect(regex.test('123')).toBe(false);
		});
	});
});
