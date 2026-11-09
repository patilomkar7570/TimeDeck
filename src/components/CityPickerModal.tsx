import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { CityOption } from '../types';
import { CityPicker } from './CityPicker';

interface Props {
  title: string;
  description: string;
  onClose: () => void;
  onSelect: (city: CityOption) => void;
  excludeIds?: string[];
  footnote?: string;
}

/**
 * Render city selection at document level so page entrance transforms and
 * scroll containers cannot constrain the fixed-position backdrop.
 */
export function CityPickerModal({ title, description, onClose, onSelect, excludeIds = [], footnote }: Props) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="modal modal--city" role="dialog" aria-modal="true" aria-labelledby="city-picker-title">
        <div className="modal-heading">
          <div>
            <h3 id="city-picker-title">{title}</h3>
            <p>{description}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close city picker" data-tooltip="Close">
            <X size={18} />
          </button>
        </div>
        <CityPicker onSelect={onSelect} excludeIds={excludeIds} autoFocus />
        {footnote && <div className="modal-footnote">{footnote}</div>}
      </section>
    </div>,
    document.body,
  );
}
