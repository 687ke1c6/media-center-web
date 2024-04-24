import classnames from "classnames";
import { JSX, ParentProps, splitProps } from "solid-js";

const inputStyle = [
    'peer',
    'text-lg p-4 rounded border-b border-gray-400 grow', 'pt-6', 'pb-2',
    'focus-visible:border-white', 'focus-visible:outline-none', 'focus-visible:text-xl'
];

const labelStyle = [
    'absolute top-2 left-4 text-xs',
    'peer-focus-visible:font-bold',
];

type Props = {
    placeHolder: string;
} & JSX.HTMLAttributes<HTMLInputElement>;

const SearchBar = (props: ParentProps<Props>) => {
    const [componentProps, inputProps] = splitProps(props, ['placeHolder']);

    return <div class={'flex relative w-full md:max-w-lg'}>
        <input class={classnames(inputStyle)} type='text' {...inputProps} />
        <span class={classnames(labelStyle)}>{componentProps.placeHolder}</span>
    </div>;
}

export default SearchBar;