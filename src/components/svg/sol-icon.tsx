function Solana({
  width,
  height,
  className,
}: {
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 31 24"
      className={className}
    >
      <g fill="#470000" clipPath="url(#clip0_24_34693)">
        <path d="M4.974 18.318c.185-.185.439-.293.708-.293h24.44a.5.5 0 01.354.855l-4.828 4.828a1.002 1.002 0 01-.709.292H.5a.5.5 0 01-.354-.854l4.828-4.828zM4.974.293A1.03 1.03 0 015.682 0h24.44a.5.5 0 01.354.855l-4.828 4.827a1.002 1.002 0 01-.709.293H.5a.5.5 0 01-.354-.855L4.974.293zM25.648 9.248a1.002 1.002 0 00-.709-.293H.5a.5.5 0 00-.354.855l4.828 4.827c.185.185.439.293.708.293h24.44a.5.5 0 00.354-.855l-4.828-4.827z"></path>
      </g>
      <defs>
        <clipPath id="clip0_24_34693">
          <path fill="#fff" d="M0 0H30.622V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}

export default Solana;
