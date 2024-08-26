import classNames from "classnames";
import { createSignal, JSX, onMount, ParentProps, createEffect, splitProps, Accessor } from "solid-js";
import { RotateLeftIcon } from "../ux/rotate-left-icon/rotate-left-icon";

type PropsVariant = 'primary' | 'secondary' | 'link' | 'warning';

type Props<T> = JSX.IntrinsicElements['button'] & {
    variant?: PropsVariant;
    onSelected?: (index: number, item: T|undefined) => void;
    selectedValue?: Accessor<T>;
    itemRenderer: (t?: T) => string;
    options: T[];
}

const common = [
    'rounded', 'w-max', 'select-none',
    'hover:outline', 'hover:outline-offset-2', 'dark:hover:bg-gray-900',
    'disabled:cursor-not-allowed disabled:pointer-events-none disabled:border-white disabled:opacity-50'
];

const styles: Record<PropsVariant, string[]> = {
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

const RollButton = <T,>(parentProps: ParentProps<Props<T>>) => {
    const [selectedItem, setSelectedItem] = createSignal<T>();
    const [props, restProps] = splitProps(parentProps, ['onSelected', 'selectedValue', 'options', 'itemRenderer']);

    createEffect(() => {
        const value = props.selectedValue?.();
        if (value) {
            const ni = props.options.indexOf(value);
            if (~ni) {
                setSelectedItem(() => value);
                props.onSelected?.(ni, value);
            }
        }
    })

    onMount(() => {
        if (!selectedItem()) {
            setSelectedItem(() => props.options[0]);
        }
    })
    
    const roll: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        const i = props.options.indexOf(selectedItem()!);
        const ni = (i + 1) % props.options.length;
        setSelectedItem(() => props.options[ni]);
        if (typeof restProps.onClick === 'function') {
            restProps.onClick(e);
        }
        parentProps.onSelected?.(ni, selectedItem());
    }

    return <button
        {...parentProps}
        class={classNames(restProps.class, styles[restProps.variant ?? 'primary'], common)}
        disabled={props.options.length < 2}
        onClick={roll}>
            <div class="flex items-center gap-1">
                <RotateLeftIcon />
                {props.itemRenderer(selectedItem())}
            </div>
    </button>;
}

export default RollButton;