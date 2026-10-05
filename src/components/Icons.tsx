import type { SVGProps } from 'react'

const base = (props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...props,
})

export const PlusIcon = () => (
  <svg {...base({ width: 22, height: 22, viewBox: '0 0 24 24', strokeWidth: 2.2 })}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const SendIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.53L15 12 3.39 13.87z" />
  </svg>
)

export const CheckIcon = () => (
  <svg {...base({ width: 16, height: 11, viewBox: '0 0 16 11', strokeWidth: 1.6 })}>
    <path d="M1.5 5.8 4.8 9 11.5 2" />
  </svg>
)

export const DoubleCheckIcon = () => (
  <svg {...base({ width: 16, height: 11, viewBox: '0 0 16 11', strokeWidth: 1.6 })}>
    <path d="M1 5.8 4.3 9 11 2" />
    <path d="M7.8 8.2 8.6 9 15.3 2" />
  </svg>
)

export const ClockIcon = () => (
  <svg {...base({ width: 12, height: 12, viewBox: '0 0 12 12', strokeWidth: 1.3 })}>
    <circle cx="6" cy="6" r="5" />
    <path d="M6 3.2V6l1.8 1.2" />
  </svg>
)

export const ErrorIcon = () => (
  <svg width={13} height={13} viewBox="0 0 12 12" aria-hidden>
    <circle cx="6" cy="6" r="6" fill="currentColor" />
    <path d="M6 3v3.4" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" />
    <circle cx="6" cy="8.7" r=".8" fill="#fff" />
  </svg>
)

export const PlaneIcon = () => (
  <svg width={52} height={52} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.7 4.3 2.9 11.2c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 1.7 5.4c.2.6.4.8.8.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8L22.4 5.6c.3-1.3-.5-1.8-1.7-1.3zm-3.4 3.4-8.4 7.6-.3 3.4-1.6-5 9.8-6.2c.5-.3.9 0 .5.2z" />
  </svg>
)
