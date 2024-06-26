import { type JSX, ParentProps } from "solid-js";

type Props = {

} & JSX.IntrinsicElements['svg'];

const JellyfinIcon = (props: ParentProps<Props>) => 
    <svg {...props} id="icon-solid-monochrome" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs>
        <linearGradient id="linear-gradient" x1="110.25" y1="213.3" x2="496.14" y2="436.09" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#ddd"/>
            <stop offset="1" stop-color="#999"/>
        </linearGradient>
    </defs>
    <title>icon-solid-monochrome</title>
    {/* <rect id="solid-background" width="512" height="512" fill="#222"/> */}
    <g id="icon-solid">
        <path id="inner-shape" d="M256,201.62c-20.44,0-86.23,119.29-76.2,139.43s142.48,19.92,152.4,0S276.47,201.63,256,201.62Z" fill="url(#linear-gradient)"/>
        <path id="outer-shape" d="M256,23.3C194.44,23.3-3.82,382.73,26.41,443.43s429.34,60,459.24,0S317.62,23.3,256,23.3ZM406.51,390.76c-19.59,39.33-281.08,39.77-300.89,0S215.71,115.48,256.06,115.48,426.1,351.42,406.51,390.76Z" fill="url(#linear-gradient)"/>
    </g>
</svg>

export default JellyfinIcon;