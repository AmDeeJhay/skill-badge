export function SkillPassportLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagon representing Polkadot ecosystem */}
      <path d="M20 2L32 9V23L20 30L8 23V9L20 2Z" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Inner shield representing credentials/security */}
      <path
        d="M20 6L28 10V20C28 24 24 26 20 28C16 26 12 24 12 20V10L20 6Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Central badge/checkmark */}
      <circle cx="20" cy="16" r="4" fill="currentColor" />

      {/* Skill dots representing multiple credentials */}
      <circle cx="16" cy="22" r="1.5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="20" cy="24" r="1.5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="24" cy="22" r="1.5" fill="currentColor" fillOpacity="0.6" />
    </svg>
  )
}
