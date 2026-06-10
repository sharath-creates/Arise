/**
 * SystemWindow — the core UI primitive. A clipped, glowing System panel
 * with corner brackets and an optional header.
 *
 * Props:
 *   title    {string}   header label (omit for headerless panel)
 *   jp       {string}   small Japanese sub-label next to the title
 *   variant  {string}   '' | 'violet' | 'gold' | 'red'
 *   right    {node}     element pinned to the right of the header
 *   className, style, children
 */
export default function SystemWindow({
  title,
  jp,
  variant = '',
  right = null,
  className = '',
  style,
  children,
}) {
  return (
    <section className={`sys-window ${variant} ${className}`} style={style}>
      {title ? (
        <header className="sys-head">
          <span className="diamond" />
          <h2 className="sys-title" style={{ margin: 0, flex: 1 }}>
            {title}
            {jp ? <span className="jp">{jp}</span> : null}
          </h2>
          {right}
        </header>
      ) : null}
      <div className="sys-body">{children}</div>
    </section>
  )
}
