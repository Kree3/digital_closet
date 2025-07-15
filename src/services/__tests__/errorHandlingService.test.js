// errorHandlingService.test.js
// Unit tests for errorHandlingService.js
// Run with: npx jest src/services/__tests__/errorHandlingService.test.js

import { logError, logWarning, logInfo } from '../errorHandlingService';

// Mock console methods to test logging behavior
describe('errorHandlingService', () => {
  let originalConsoleError;
  let originalConsoleWarn;
  let originalConsoleLog;

  beforeEach(() => {
    // Store original console methods
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalConsoleLog = console.log;

    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });

  describe('logError', () => {
    it('should log error with Error object correctly', () => {
      const context = '[testService]';
      const operation = 'test operation';
      const error = new Error('Test error message');

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        '[testService] test operation: Test error message'
      );
    });

    it('should log error with string message correctly', () => {
      const context = '[galleryService]';
      const operation = 'addArticles error';
      const error = 'String error message';

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        '[galleryService] addArticles error: String error message'
      );
    });

    it('should log error with number as error correctly', () => {
      const context = '[testService]';
      const operation = 'numeric error';
      const error = 404;

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        '[testService] numeric error: 404'
      );
    });

    it('should log error with null as error correctly', () => {
      const context = '[testService]';
      const operation = 'null error';
      const error = null;

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        '[testService] null error: null'
      );
    });

    it('should log error with undefined as error correctly', () => {
      const context = '[testService]';
      const operation = 'undefined error';
      const error = undefined;

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        '[testService] undefined error: undefined'
      );
    });

    it('should log error with object as error correctly', () => {
      const context = '[testService]';
      const operation = 'object error';
      const error = { code: 500, message: 'Server error' };

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        '[testService] object error: [object Object]'
      );
    });

    it('should handle empty context gracefully', () => {
      const context = '';
      const operation = 'test operation';
      const error = new Error('Test error');

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        ' test operation: Test error'
      );
    });

    it('should handle empty operation gracefully', () => {
      const context = '[testService]';
      const operation = '';
      const error = new Error('Test error');

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        '[testService] : Test error'
      );
    });

    it('should call console.error exactly once', () => {
      const context = '[testService]';
      const operation = 'test operation';
      const error = new Error('Test error');

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('logWarning', () => {
    it('should log warning correctly', () => {
      const context = '[galleryService]';
      const message = 'This is a warning message';

      logWarning(context, message);

      expect(console.warn).toHaveBeenCalledWith(
        '[galleryService] This is a warning message'
      );
    });

    it('should handle empty context gracefully', () => {
      const context = '';
      const message = 'Warning message';

      logWarning(context, message);

      expect(console.warn).toHaveBeenCalledWith(
        ' Warning message'
      );
    });

    it('should handle empty message gracefully', () => {
      const context = '[testService]';
      const message = '';

      logWarning(context, message);

      expect(console.warn).toHaveBeenCalledWith(
        '[testService] '
      );
    });

    it('should call console.warn exactly once', () => {
      const context = '[testService]';
      const message = 'Test warning';

      logWarning(context, message);

      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should handle long messages correctly', () => {
      const context = '[testService]';
      const message = 'This is a very long warning message that contains a lot of text to test how the logging function handles longer strings and formatting';

      logWarning(context, message);

      expect(console.warn).toHaveBeenCalledWith(
        '[testService] This is a very long warning message that contains a lot of text to test how the logging function handles longer strings and formatting'
      );
    });
  });

  describe('logInfo', () => {
    it('should log info correctly', () => {
      const context = '[galleryService]';
      const message = 'This is an info message';

      logInfo(context, message);

      expect(console.log).toHaveBeenCalledWith(
        '[galleryService] This is an info message'
      );
    });

    it('should handle empty context gracefully', () => {
      const context = '';
      const message = 'Info message';

      logInfo(context, message);

      expect(console.log).toHaveBeenCalledWith(
        ' Info message'
      );
    });

    it('should handle empty message gracefully', () => {
      const context = '[testService]';
      const message = '';

      logInfo(context, message);

      expect(console.log).toHaveBeenCalledWith(
        '[testService] '
      );
    });

    it('should call console.log exactly once', () => {
      const context = '[testService]';
      const message = 'Test info';

      logInfo(context, message);

      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in message', () => {
      const context = '[testService]';
      const message = 'Special chars: !@#$%^&*()_+-={}[]|\\:";\'<>?,./';

      logInfo(context, message);

      expect(console.log).toHaveBeenCalledWith(
        '[testService] Special chars: !@#$%^&*()_+-={}[]|\\:";\'<>?,./'
      );
    });

    it('should handle unicode characters in message', () => {
      const context = '[testService]';
      const message = 'Unicode: 🚀 ✨ 💖 测试';

      logInfo(context, message);

      expect(console.log).toHaveBeenCalledWith(
        '[testService] Unicode: 🚀 ✨ 💖 测试'
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple consecutive calls correctly', () => {
      logError('[service1]', 'error1', new Error('First error'));
      logWarning('[service2]', 'warning1');
      logInfo('[service3]', 'info1');

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledTimes(1);

      expect(console.error).toHaveBeenCalledWith('[service1] error1: First error');
      expect(console.warn).toHaveBeenCalledWith('[service2] warning1');
      expect(console.log).toHaveBeenCalledWith('[service3] info1');
    });

    it('should handle same context across different log levels', () => {
      const context = '[galleryService]';
      
      logError(context, 'error occurred', new Error('Test error'));
      logWarning(context, 'potential issue detected');
      logInfo(context, 'operation completed successfully');

      expect(console.error).toHaveBeenCalledWith('[galleryService] error occurred: Test error');
      expect(console.warn).toHaveBeenCalledWith('[galleryService] potential issue detected');
      expect(console.log).toHaveBeenCalledWith('[galleryService] operation completed successfully');
    });

    it('should handle Error objects with additional properties', () => {
      const context = '[testService]';
      const operation = 'complex error';
      const error = new Error('Base error message');
      error.code = 'CUSTOM_ERROR';
      error.statusCode = 500;

      logError(context, operation, error);

      // Should still log the error message, not the additional properties
      expect(console.error).toHaveBeenCalledWith(
        '[testService] complex error: Base error message'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long context strings', () => {
      const context = '[' + 'a'.repeat(1000) + ']';
      const operation = 'test';
      const error = 'error';

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        context + ' test: error'
      );
    });

    it('should handle newlines in error messages', () => {
      const context = '[testService]';
      const operation = 'multiline error';
      const error = new Error('Line 1\nLine 2\nLine 3');

      logError(context, operation, error);

      expect(console.error).toHaveBeenCalledWith(
        '[testService] multiline error: Line 1\nLine 2\nLine 3'
      );
    });

    it('should handle circular reference errors gracefully', () => {
      const context = '[testService]';
      const operation = 'circular error';
      const circularObj = {};
      circularObj.self = circularObj;

      logError(context, operation, circularObj);

      expect(console.error).toHaveBeenCalledWith(
        '[testService] circular error: [object Object]'
      );
    });
  });
});