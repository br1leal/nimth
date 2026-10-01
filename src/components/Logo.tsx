/**
 * Logotipo "nimth": letreiro de traço único (monoline), feito só com tipografia desenhada.
 * O traço usa a cor do texto (currentColor) e o pingo do "i" usa a cor da marca.
 * Ao carregar, as letras se desenham na ordem da escrita e o pingo aparece por último.
 */
export default function Logo({ className = "logo" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="8 -12 366 146"
      fill="none"
      stroke="currentColor"
      strokeWidth={11}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="nimth"
    >
      <g transform="rotate(-4 200 65)">
        {/* n (haste) */}
        <path pathLength={1} d="M22 56 C21 78 22 96 25 113" />
        {/* n (arco) + i + primeira perna do m */}
        <path
          pathLength={1}
          d="M25 90 C31 66 44 54 58 54 C72 54 79 64 79 80 L79 100 C79 109 84 113 90 111 C97 109 101 100 103 88 C105 78 106 66 106 58 C106 74 106 96 110 106 C113 113 121 114 127 106 C131 98 133 80 133 58 C138 61 145 54 155 54 C166 54 171 62 171 75 L171 112"
        />
        {/* segundo arco do m + t + haste do h */}
        <path
          pathLength={1}
          d="M171 79 C175 63 184 54 195 54 C207 54 212 63 212 77 L212 100 C212 109 217 113 223 111 C232 107 252 80 262 52 C270 30 278 12 268 6 C257 0 250 14 248 30 C246 50 246 80 250 96 C252 108 258 113 266 111 C274 108 288 84 298 54 C306 30 314 12 304 6 C293 0 287 14 285 30 C283 52 284 84 284 113"
        />
        {/* corte do t */}
        <path pathLength={1} d="M234 54 L276 51" />
        {/* arco do h */}
        <path
          pathLength={1}
          d="M285 90 C292 68 304 54 318 54 C331 54 337 63 337 77 L337 97 C337 108 343 114 351 110 C356 108 360 102 362 96"
        />
        {/* pingo do i */}
        <circle cx="112" cy="33" r="7.5" stroke="none" />
      </g>
    </svg>
  );
}
