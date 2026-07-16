// Logo "EN": due fumetti di chat sovrapposti.
// - default: versione a colori (fumetto E bianco, N verde) su fondo blu pieno
//   (avvolgi in un contenitore rounded/overflow-hidden per l'effetto tile)
// - mono: solo i fumetti in grigio (per stati vuoti/segnaposto)

export function Logo({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  const bubbleE = mono ? "#cfd4de" : "#ffffff";
  const bubbleN = mono ? "#cfd4de" : "#22c58a";
  const letterE = mono ? "#f6f7fb" : "#2f6cae";
  const letterN = mono ? "#f6f7fb" : "#ffffff";

  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Campus Connect"
    >
      {!mono && (
        <>
          <defs>
            <linearGradient id="cc-logo-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3f8bd0" />
              <stop offset="1" stopColor="#2f6cae" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" fill="url(#cc-logo-bg)" />
        </>
      )}

      {/* Fumetto "E" */}
      <rect x="80" y="96" width="210" height="168" rx="46" fill={bubbleE} />
      <path d="M120 250 L120 306 L168 250 Z" fill={bubbleE} />
      <text
        x="185"
        y="232"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="150"
        fontWeight="700"
        fill={letterE}
        textAnchor="middle"
      >
        E
      </text>

      {/* Fumetto "N" */}
      <rect x="222" y="234" width="210" height="168" rx="46" fill={bubbleN} />
      <path d="M392 388 L392 444 L344 388 Z" fill={bubbleN} />
      <text
        x="327"
        y="370"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="150"
        fontWeight="700"
        fill={letterN}
        textAnchor="middle"
      >
        N
      </text>
    </svg>
  );
}
