export default function Toast({ message, tone = 'success' }) {
  const tones = {
    success: 'border-[#2d6a4f] bg-[#143327] text-[#fdfbf7]',
    error: 'border-[#761200] bg-[#3a1713] text-[#ffd9d1]',
  }
  return (
    <div
      className={`toast rounded-xl border px-5 py-3 text-sm shadow-xl max-w-[90vw] text-center ${tones[tone] || tones.success} ${
        message ? 'is-visible' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}
