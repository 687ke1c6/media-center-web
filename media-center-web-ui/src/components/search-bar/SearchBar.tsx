import { JSX, ParentProps, splitProps } from "solid-js";
import { selectAllBehaviour } from "../../behaviours/select-all";

const inputStyle = [
    'peer',
    'text-lg p-4 rounded border-b border-gray-400 grow', 'pt-6', 'pb-2',
    'focus-visible:border-white', 'focus-visible:outline-none',
    'bg-gray-100 dark:bg-black'
];

const labelStyle = [
    'absolute top-2 left-4 text-xs',
    'peer-focus-visible:font-bold',
];

const styleToList = (styles: string[]): Record<string, boolean> =>
    styles.reduce((p, c) => ({ ...p, [c]: true }), {});

type Props = {
    placeHolder: string;
} & JSX.HTMLAttributes<HTMLInputElement>;

const SearchBar = (props: ParentProps<Props>) => {
    const [componentProps, inputProps] = splitProps(props, ['placeHolder']);

    return <div class={'w-full md:w-[34rem]'}>
        <div class="flex relative mx-4 md:mx0">
            <input ref={selectAllBehaviour()} classList={styleToList(inputStyle)} type='text' autofocus {...inputProps} />
            <span classList={styleToList(labelStyle)}>{componentProps.placeHolder}</span>
        </div>
    </div>;
}

export default SearchBar;