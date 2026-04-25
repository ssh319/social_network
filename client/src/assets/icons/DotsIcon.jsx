const DotsIcon = ({ color = 'currentColor' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    </svg>
);


export default DotsIcon;
