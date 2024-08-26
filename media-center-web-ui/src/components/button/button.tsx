import classNames from "classnames";
import { JSX, ParentProps } from "solid-js";

type Props = JSX.IntrinsicElements['button'] & {
    variant?: 'primary' | 'secondary' | 'link' | 'warning';
}

const common = [
    'rounded', 'w-max',
    'hover:outline', 'hover:outline-offset-2', 'dark:hover:bg-gray-900',
    'disabled:cursor-not-allowed disabled:pointer-events-none disabled:border-white disabled:opacity-50'
];

const styles: Record<NonNullable<Props['variant']>, string[]> = {
    'primary': [
        'border', 'border-teal-500', 'p-4',
        'hover:outline-teal-500'
    ],
    'secondary': [
        'border', 'border-orange-500', 'p-4',
        'hover:outline-orange-500'
    ],
    'warning': [
        'border', 'border-red-500', 'p-4',
        'hover:outline-red-500'
    ],
    'link': [
        'p-1',
        'hover:outline-1', 'hover:outline-teal-500'
    ],
}

const Button = ({ variant = 'primary', ...props }: ParentProps<Props>) =>
    <button
        {...props}
        class={classNames(props.class, styles[variant], common)}>
        {props.children}
    </button>;

export default Button;