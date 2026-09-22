/** The banner's single primary action. */
export function HeroActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-auto mt-6 flex items-center justify-center">
      {children}
    </div>
  )
}
