// @vitest-environment jsdom
import '../../../dom-setup';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Brand } from '@/components/common/Brand';

describe('Brand', () => {
  it('mostra il logo e il nome dell’atlante, con il logo nascosto alle tecnologie assistive', () => {
    const { container } = render(<Brand />);
    const brand = container.querySelector('.brand');
    expect(brand?.textContent).toBe('Atlante del corpo umano');
    const logo = brand?.querySelector('svg.logo');
    expect(logo?.getAttribute('aria-hidden')).toBe('true');
    expect(logo?.getAttribute('focusable')).toBe('false');
  });

  it('aggiunge la classe indicata a quella del marchio', () => {
    const { container } = render(<Brand className="extra" />);
    expect(container.firstElementChild?.className).toBe('brand extra');
  });
});
