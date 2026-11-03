'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';

type ConfirmOptions = { title?: string; message: string; confirmLabel?: string; danger?: boolean };

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (next: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOptions(next);
      }),
    [],
  );

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  const dialog: ReactNode = options && (
    <div className="type-modal-backdrop nested-modal" role="presentation" onClick={() => close(false)}>
      <section
        className="type-modal confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-label={options.title ?? 'Confirmar'}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.key === 'Escape' && close(false)}
      >
        <h2>{options.title ?? 'Confirmar'}</h2>
        <p>{options.message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="secondary-button" onClick={() => close(false)}>Cancelar</button>
          <button type="button" className={options.danger ? 'danger-button' : 'primary-button'} autoFocus onClick={() => close(true)}>
            {options.confirmLabel ?? 'Aceptar'}
          </button>
        </div>
      </section>
    </div>
  );

  return { confirm, dialog };
}
