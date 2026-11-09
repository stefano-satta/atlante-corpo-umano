// @vitest-environment jsdom
import '../../../dom-setup';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  it('è di tipo "button" se non si indica altro', () => {
    render(<Button>Avanti</Button>);
    expect(screen.getByRole('button', { name: 'Avanti' }).getAttribute('type')).toBe('button');
  });

  it('rispetta il tipo indicato', () => {
    render(<Button type="submit">Invia</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('submit');
  });

  it('dà la classe dell’aspetto e vi aggiunge quelle proprie', () => {
    render(
      <Button variant="cycle" className="play">
        Riproduci
      </Button>,
    );
    expect(screen.getByRole('button').className).toBe('cycle-button play');
  });

  it('senza aspetto né classi non scrive l’attributo class', () => {
    render(<Button>1</Button>);
    expect(screen.getByRole('button').hasAttribute('class')).toBe(false);
  });

  it('passa attributi ARIA e data al pulsante', () => {
    render(
      <Button variant="close" aria-label="Chiudi" aria-pressed data-option="ossa">
        ×
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Chiudi', pressed: true });
    expect(button.dataset.option).toBe('ossa');
  });

  it('chiama onClick al clic', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Avanti</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('da disattivato non chiama onClick', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Avanti
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('inoltra ref al pulsante', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Avanti</Button>);
    expect(ref.current).toBe(screen.getByRole('button'));
  });
});
