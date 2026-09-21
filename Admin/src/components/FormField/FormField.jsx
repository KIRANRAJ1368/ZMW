/**
 * Thin wrapper around the .field/.field-error CSS so every form gets the
 * same label + input + error layout without repeating markup. Pass the
 * input itself as children.
 */
export default function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div className="field">
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
