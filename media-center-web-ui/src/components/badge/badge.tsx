import { ParentProps } from "solid-js";

type Props = {
    text: string;
}

const badgeColours = {
    'h264': 'bg-emerald-300',
    'h265': 'bg-teal-300',
    'p1080': 'bg-cyan-300',
    'p720': 'bg-fuchsia-300',
    'hvec': 'bg-pink-300',
    'x264' :'',
    'x265': ''
}

const classList = (badge: string) => ({
    [Object.entries(badgeColours).find(([key]) => key === badge)?.[1] ?? 'bg-gray-500']: true
})

const Badge = (props: ParentProps<Props>) => {
    return <div classList={classList(props.text)} class="inline-block text-[9px] rounded p-[2px] font-bold capitalize">{props.text}</div>;
}

export default Badge;