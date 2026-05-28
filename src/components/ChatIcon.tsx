interface Props { size?: number; className?: string }

/** Friendly speech-bubble + spark mark — not the WhatsApp glyph, not a generic chat outline. */
const ChatIcon = ({ size = 24, className = "" }: Props) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path
      d="M6 13a8 8 0 0 1 8-8h4a8 8 0 0 1 8 8v3a8 8 0 0 1-8 8h-3.2L9 27.6V23a8 8 0 0 1-3-7v-3Z"
      fill="currentColor"
    />
    <circle cx="13" cy="15" r="1.5" fill="hsl(var(--background))" />
    <circle cx="17" cy="15" r="1.5" fill="hsl(var(--background))" />
    <circle cx="21" cy="15" r="1.5" fill="hsl(var(--background))" />
    <path d="M24 4l1.2 2.4L27.5 7.5l-2.3 1.1L24 11l-1.2-2.4L20.5 7.5l2.3-1.1L24 4Z" fill="hsl(var(--primary-glow,var(--primary)))" />
  </svg>
);

export default ChatIcon;
