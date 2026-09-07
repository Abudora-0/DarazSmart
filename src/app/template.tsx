/**
 * A template remounts on every navigation, which is exactly what the entrance
 * animation needs. A layout would only mount once.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
