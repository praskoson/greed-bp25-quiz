"use client";

import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="Frame">
      <path
        id="Vector"
        d="M19.75 8.75V17.75C19.75 18.8546 18.8546 19.75 17.75 19.75H7.25C6.14543 19.75 5.25 18.8546 5.25 17.75V7.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        id="Vector_2"
        d="M17 13.5C17 13.7761 16.7761 14 16.5 14C16.2239 14 16 13.7761 16 13.5C16 13.2239 16.2239 13 16.5 13C16.7761 13 17 13.2239 17 13.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        id="Vector_3"
        d="M17.75 8.75H7C6.0335 8.75 5.25 7.9665 5.25 7C5.25 6.0335 6.0335 5.25 7 5.25H15.75C16.8546 5.25 17.75 6.14543 17.75 7.25V8.75ZM17.75 8.75H19.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
export { SvgComponent as WalletIcon };
