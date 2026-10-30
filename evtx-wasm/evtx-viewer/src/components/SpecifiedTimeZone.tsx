import { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { parseFixedOffset, type TimeZone } from "../lib/timeZone";
import { Button, Input } from "./Windows";

const Dialog = styled.dialog`
  width: min(360px, calc(100vw - 32px));
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.stroke.divider};
  border-radius: ${({ theme }) => theme.radius.flyout};
  background: ${({ theme }) => theme.colors.surface.pane};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadow.flyout};
  &::backdrop {
    background: rgb(0 0 0 / 40%);
  }
  form {
    display: grid;
    gap: 12px;
  }
  h2 {
    font-size: ${({ theme }) => theme.fontSize.title};
  }
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  p[role="alert"] {
    color: ${({ theme }) => theme.colors.severity.error};
  }
  footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
`;

export function SpecifiedTimeZone({
  current,
  onApply,
  onClose,
}: {
  current: TimeZone;
  onApply: (zone: TimeZone) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState<string>(() =>
    parseFixedOffset(current) !== undefined ? current : "UTC+0",
  );
  const [error, setError] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <Dialog
      ref={dialog}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const zone = value.trim().toUpperCase();
          if (parseFixedOffset(zone) === undefined) {
            setError(true);
            return;
          }
          onApply(zone as TimeZone);
          onClose();
        }}
      >
        <h2>Specified time zone</h2>
        <p>
          Use a fixed UTC offset for the log’s local time. This does not adjust for daylight saving
          time.
        </p>
        <label htmlFor="specified-time-zone">UTC offset</label>
        <Input
          id="specified-time-zone"
          autoFocus
          value={value}
          placeholder="UTC-5 or UTC+8"
          aria-invalid={error}
          aria-describedby={error ? "specified-time-zone-error" : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            setError(false);
          }}
        />
        {error && (
          <p id="specified-time-zone-error" role="alert">
            Enter UTC-12 through UTC+14 in whole hours (for example, UTC-5).
          </p>
        )}
        <footer>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="accent">
            Apply
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
