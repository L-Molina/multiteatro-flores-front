const SOCIALS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    viewBox: '0 0 24 24',
    size: 'w-4 h-4',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.8.4-1.2.8-.4.4-.6.7-.8 1.2-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.8.8 1.2.4.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.8-.4 1.2-.8.4-.4.6-.7.8-1.2.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.8-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-1-4.7-1Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Zm6.3-8.2a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z',
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    viewBox: '0 0 24 24',
    size: 'w-4 h-4',
    path: 'M13.5 21v-7.5h2.5l.4-2.9h-2.9V8.7c0-.8.2-1.4 1.4-1.4h1.6V4.7c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2H8v2.9h2.3V21h3.2Z',
  },
  {
    name: 'X',
    href: 'https://x.com',
    viewBox: '0 0 24 24',
    size: 'w-4 h-4',
    path: 'M17.5 3h3.1l-6.8 7.8L21.9 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L2.1 3h6.4l4.4 5.9L17.5 3Zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3Z',
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com',
    viewBox: '0 0 24 24',
    size: 'w-5 h-5',
    path: 'M23 12s0-3.4-.4-5c-.2-.9-.9-1.6-1.8-1.8C19.2 4.8 12 4.8 12 4.8s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.6 1 12 1 12s0 3.4.4 5c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-5 .4-5ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z',
  },
]

export default function SocialLinks({ className = '', size = 'md' }) {
  const large = size === 'lg'
  return (
    <div className={`flex items-center ${large ? 'gap-1' : 'gap-2'} ${className}`}>
      {SOCIALS.map((social) => (
        <a
          key={social.name}
          className={
            large
              ? 'social-link w-12 h-12 flex items-center justify-center text-[#b8c7bf] hover:text-secondary transition-colors'
              : 'social-link w-9 h-9 rounded-full bg-[#0e241c] border border-[#1b4234] flex items-center justify-center text-[#b8c7bf] hover:text-[#efbf69] hover:border-[#efbf69]/60'
          }
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          title={social.name}
        >
          <svg
            viewBox={social.viewBox}
            aria-hidden="true"
            className={large ? 'w-7 h-7' : social.size}
            fill="currentColor"
          >
            <path d={social.path} />
          </svg>
        </a>
      ))}
    </div>
  )
}
