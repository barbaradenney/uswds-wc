/**
 * USWDS Character Count Behavior Contract Tests - Part 1: Component Structure
 *
 * These tests validate that our character count implementation EXACTLY matches
 * USWDS character count behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-character-count/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-character-count.js';
import type { USACharacterCount } from './usa-character-count.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USWDS Character Count - Contract 1: Component Structure', () => {
  let element: USACharacterCount;

  beforeEach(() => {
    element = document.createElement('usa-character-count') as USACharacterCount;
    element.maxlength = 50;
    element.id = 'test-character-count';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should create character count message element', async () => {
    await waitForBehaviorInit(element);

    const message = element.querySelector('.usa-character-count__message');
    expect(message).not.toBeNull();
  });

  it('should create status message element', async () => {
    await waitForBehaviorInit(element);

    const status = element.querySelector('.usa-character-count__status');
    expect(status).not.toBeNull();
  });

  it('should set maxlength attribute on input/textarea', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLElement;
    expect(input.getAttribute('maxlength')).toBe('50');
  });

  it('should link status to input with aria-describedby', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLElement;
    const status = element.querySelector('.usa-character-count__status') as HTMLElement;

    const describedBy = await waitForARIAAttribute(input, 'aria-describedby');
    expect(describedBy).toContain(status.id);
  });

  it('should create screen reader-only status for live updates', async () => {
    await waitForBehaviorInit(element);

    const srStatus = element.querySelector('.usa-character-count__sr-status');
    expect(srStatus).not.toBeNull();
    expect(srStatus?.getAttribute('aria-live')).toBe('polite');
  });
});
