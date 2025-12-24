import { describe, it, expect } from 'vitest';
import {
  phoneSchema,
  fleetNumberSchema,
  getDescriptionError,
  formatRegistration,
  formatPhoneNumber,
  detectSeverity,
  suggestCategory,
  validateFile,
  hasUnsavedChanges,
} from './form-validation';

describe('Form Validation', () => {
  describe('phoneSchema', () => {
    it('accepts valid 10-digit phone numbers', () => {
      const result = phoneSchema.safeParse('0412345678');
      expect(result.success).toBe(true);
    });

    it('accepts phone numbers with +61 format', () => {
      const result = phoneSchema.safeParse('+61412345678');
      expect(result.success).toBe(true);
    });

    it('accepts phone numbers with spaces', () => {
      const result = phoneSchema.safeParse('0412 345 678');
      expect(result.success).toBe(true);
    });

    it('accepts empty phone numbers', () => {
      const result = phoneSchema.safeParse('');
      expect(result.success).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      const result = phoneSchema.safeParse('123');
      expect(result.success).toBe(false);
    });
  });

  describe('fleetNumberSchema', () => {
    it('accepts valid fleet numbers', () => {
      const result = fleetNumberSchema.safeParse('FLT001');
      expect(result.success).toBe(true);
    });

    it('rejects empty fleet numbers', () => {
      const result = fleetNumberSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('getDescriptionError', () => {
    it('returns null for valid description', () => {
      const error = getDescriptionError('This is a valid description');
      expect(error).toBeNull();
    });

    it('returns error for empty description', () => {
      const error = getDescriptionError('');
      expect(error).toBe('Description is required');
    });

    it('returns error for too short description', () => {
      const error = getDescriptionError('Short', 10);
      expect(error).toContain('Add 5 more characters');
    });

    it('handles custom minimum length', () => {
      const error = getDescriptionError('Test', 20);
      expect(error).toContain('Add 16 more characters');
    });
  });

  describe('formatRegistration', () => {
    it('converts to uppercase', () => {
      expect(formatRegistration('abc123')).toBe('ABC123');
    });

    it('removes special characters', () => {
      expect(formatRegistration('AB-C 123')).toBe('ABC123');
    });

    it('handles already formatted input', () => {
      expect(formatRegistration('ABC123')).toBe('ABC123');
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats 10 digit numbers correctly', () => {
      expect(formatPhoneNumber('0412345678')).toBe('0412 345 678');
    });

    it('formats partial numbers correctly', () => {
      expect(formatPhoneNumber('0412')).toBe('0412');
      expect(formatPhoneNumber('04123')).toBe('0412 3');
      expect(formatPhoneNumber('0412345')).toBe('0412 345');
    });

    it('truncates numbers longer than 10 digits', () => {
      expect(formatPhoneNumber('041234567890')).toBe('0412345678');
    });

    it('removes non-digit characters', () => {
      expect(formatPhoneNumber('0412-345-678')).toBe('0412 345 678');
    });
  });

  describe('detectSeverity', () => {
    it('detects CRITICAL severity from keywords', () => {
      expect(detectSeverity('Vehicle stopped on highway')).toBe('CRITICAL');
      expect(detectSeverity("Won't start this morning")).toBe('CRITICAL');
      expect(detectSeverity('Unsafe to drive - smoke from engine')).toBe('CRITICAL');
      expect(detectSeverity('Broke down on route')).toBe('CRITICAL');
    });

    it('detects HIGH severity from keywords', () => {
      expect(detectSeverity('Brakes not working properly')).toBe('HIGH');
      expect(detectSeverity('Steering feels loose')).toBe('HIGH');
      expect(detectSeverity('Engine warning light on')).toBe('HIGH');
      expect(detectSeverity('Engine overheating')).toBe('HIGH');
    });

    it('detects MEDIUM severity from keywords', () => {
      expect(detectSeverity('Strange noise from exhaust')).toBe('MEDIUM');
      expect(detectSeverity('Vibration in the cabin')).toBe('MEDIUM');
      expect(detectSeverity('Burning smell from vents')).toBe('MEDIUM');
    });

    it('returns null for generic descriptions', () => {
      expect(detectSeverity('General maintenance needed')).toBeNull();
      expect(detectSeverity('Routine check')).toBeNull();
    });

    it('handles empty input', () => {
      expect(detectSeverity('')).toBeNull();
    });
  });

  describe('suggestCategory', () => {
    it('suggests Mechanical category', () => {
      expect(suggestCategory('Engine problem')).toBe('Mechanical');
      expect(suggestCategory("Won't start")).toBe('Mechanical');
    });

    it('suggests Electrical category', () => {
      expect(suggestCategory('Warning light on')).toBe('Electrical');
      expect(suggestCategory('Battery dead')).toBe('Electrical');
      expect(suggestCategory('Alternator issue')).toBe('Electrical');
    });

    it('suggests Brakes category', () => {
      expect(suggestCategory('Brake pedal soft')).toBe('Brakes');
      expect(suggestCategory('Braking noise')).toBe('Brakes');
    });

    it('suggests Tyres category', () => {
      expect(suggestCategory('Flat tyre')).toBe('Tyres');
      expect(suggestCategory('Wheel wobble')).toBe('Tyres');
    });

    it('suggests Body category', () => {
      expect(suggestCategory('Door damage')).toBe('Body');
      expect(suggestCategory('Panel scratched')).toBe('Body');
    });

    it('returns null for unrecognized descriptions', () => {
      expect(suggestCategory('Other issue')).toBeNull();
    });
  });

  describe('validateFile', () => {
    it('accepts valid image files', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('rejects files that are too large', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 }); // 15MB
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('15.0MB');
    });

    it('rejects invalid file types', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('accepts custom max size', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB
      const result = validateFile(file, { maxSizeMB: 2 });
      expect(result.valid).toBe(false);
    });

    it('accepts video files', () => {
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('hasUnsavedChanges', () => {
    it('returns false when no saved data', () => {
      const formData = { fleetNumber: 'FLT001', description: 'Test' };
      expect(hasUnsavedChanges(formData, null)).toBe(false);
    });

    it('detects changes in fleet number', () => {
      const formData = { fleetNumber: 'FLT002', description: 'Test' };
      const savedData = { fleetNumber: 'FLT001', description: 'Test' };
      expect(hasUnsavedChanges(formData, savedData)).toBe(true);
    });

    it('detects changes in description', () => {
      const formData = { fleetNumber: 'FLT001', description: 'New description' };
      const savedData = { fleetNumber: 'FLT001', description: 'Old description' };
      expect(hasUnsavedChanges(formData, savedData)).toBe(true);
    });

    it('returns false when no changes', () => {
      const formData = { 
        fleetNumber: 'FLT001', 
        category: 'Mechanical',
        description: 'Test', 
        severity: 'HIGH' 
      };
      const savedData = { 
        fleetNumber: 'FLT001', 
        category: 'Mechanical',
        description: 'Test', 
        severity: 'HIGH' 
      };
      expect(hasUnsavedChanges(formData, savedData)).toBe(false);
    });
  });
});
