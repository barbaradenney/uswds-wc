/**
 * USWDS File Input Behavior Contract Tests
 *
 * These tests validate that our file input implementation EXACTLY matches
 * USWDS file input behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-file-input/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-file-input.js';
import type { USAFileInput } from './usa-file-input.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USWDS File Input Behavior Contract', () => {
  let element: USAFileInput;

  beforeEach(() => {
    element = document.createElement('usa-file-input') as USAFileInput;
    element.id = 'test-file-input';
    element.name = 'file-upload';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Contract 1: Component Enhancement', () => {
    it('should create drop zone wrapper', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dropZone = element.querySelector('.usa-file-input');
      expect(dropZone).not.toBeNull();
    });

    it('should create target area for drag and drop', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const target = element.querySelector('.usa-file-input__target');
      expect(target).not.toBeNull();
    });

    it('should create box element', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const box = element.querySelector('.usa-file-input__box');
      expect(box).not.toBeNull();
    });

    it('should convert input to usa-file-input__input class', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const input = element.querySelector('.usa-file-input__input');
      expect(input).not.toBeNull();
      expect(input?.tagName).toBe('INPUT');
    });

    it('should create visible instructions', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const instructions = element.querySelector('.usa-file-input__instructions');
      expect(instructions).not.toBeNull();
      expect(instructions?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Contract 2: Instructions and Labels', () => {
    it('should display drag text and choose text', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dragText = element.querySelector('.usa-file-input__drag-text');
      const chooseText = element.querySelector('.usa-file-input__choose');

      expect(dragText).not.toBeNull();
      expect(dragText?.textContent).toContain('Drag');
      expect(chooseText).not.toBeNull();
      expect(chooseText?.textContent).toContain('choose from folder');
    });

    it('should set aria-label on input with instructions', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const input = element.querySelector('.usa-file-input__input') as HTMLInputElement;
      const ariaLabel = await waitForARIAAttribute(input, 'aria-label');

      expect(ariaLabel).toContain('Drag');
      expect(ariaLabel).toContain('choose from folder');
    });

    it('should use singular "file" label for single file input', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dragText = element.querySelector('.usa-file-input__drag-text') as HTMLElement;
      expect(dragText.textContent).toMatch(/Drag file/i);
    });

    it('should use plural "files" label when multiple attribute is set', async () => {
      element.multiple = true;
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dragText = element.querySelector('.usa-file-input__drag-text') as HTMLElement;
      expect(dragText.textContent).toMatch(/Drag files/i);
    });
  });

  describe('Contract 3: Screen Reader Status', () => {
    it('should create screen reader-only status element', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const srStatus = element.querySelector('.usa-sr-only');
      expect(srStatus).not.toBeNull();
    });

    it('should have aria-live="polite" on SR status', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const srStatus = element.querySelector('.usa-sr-only');
      expect(srStatus?.getAttribute('aria-live')).toBe('polite');
    });

    it('should display default "No file selected" message', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const srStatus = element.querySelector('.usa-sr-only') as HTMLElement;
      expect(srStatus.textContent).toMatch(/No file selected/i);
    });

    it('should display "No files selected" for multiple', async () => {
      element.multiple = true;
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const srStatus = element.querySelector('.usa-sr-only') as HTMLElement;
      expect(srStatus.textContent).toMatch(/No files selected/i);
    });
  });

  describe('Contract 4: File Selection and Previews', () => {
    it.todo('add file selection and preview tests');
  });

  describe('Contract 5: Multiple File Selection', () => {
    it.todo('add multiple file selection tests');
  });

  describe('Contract 6: Drag and Drop', () => {
    it('should add drag class on dragover', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const target = element.querySelector('.usa-file-input__target') as HTMLElement;

      target.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
      await waitForBehaviorInit(element);

      expect(target.classList.contains('usa-file-input--drag')).toBe(true);
    });

    it('should remove drag class on dragleave', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const target = element.querySelector('.usa-file-input__target') as HTMLElement;

      target.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
      await waitForBehaviorInit(element);

      target.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
      await waitForBehaviorInit(element);

      expect(target.classList.contains('usa-file-input--drag')).toBe(false);
    });

    it('should remove drag class on drop', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const target = element.querySelector('.usa-file-input__target') as HTMLElement;

      target.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
      await waitForBehaviorInit(element);

      target.dispatchEvent(new DragEvent('drop', { bubbles: true }));
      await waitForBehaviorInit(element);

      expect(target.classList.contains('usa-file-input--drag')).toBe(false);
    });
  });

  describe('Contract 7: File Type Validation', () => {
    it.todo('add file type validation tests');
  });

  describe('Contract 8: Preview Images', () => {
    it.todo('add preview images tests');
  });

  describe('Contract 9: Disabled State', () => {
    it('should add disabled class when disabled', async () => {
      element.disabled = true;
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dropZone = element.querySelector('.usa-file-input');
      expect(dropZone?.classList.contains('usa-file-input--disabled')).toBe(true);
    });

    it('should disable input element when disabled', async () => {
      element.disabled = true;
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const input = element.querySelector('.usa-file-input__input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should not create SR status when disabled', async () => {
      element.disabled = true;
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const srStatus = element.querySelector('.usa-sr-only');
      expect(srStatus).toBeNull();
    });
  });

  describe('Prohibited Behaviors (must NOT be present)', () => {
    it('should NOT modify USWDS class names', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dropZone = element.querySelector('.usa-file-input');
      const target = element.querySelector('.usa-file-input__target');
      const instructions = element.querySelector('.usa-file-input__instructions');

      expect(dropZone).not.toBeNull();
      expect(target).not.toBeNull();
      expect(instructions).not.toBeNull();
    });
  });
});
