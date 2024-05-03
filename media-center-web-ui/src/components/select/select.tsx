import { For, ParentProps, createSignal } from "solid-js"
import Button from "../button/button"
import { multi } from "../../behaviours/multi";
import { clickOutsideBehaviour } from "../../behaviours/clicked-outside";

`    height: fit-content;
padding: 12px;
border: 1px aqua solid;
background: none;
border-radius: 3px;`

type Props<T> = {
    items: T[];
    onChange: (selected: T) => void;
    value: T;
}

const Select = <T,>(props: ParentProps<Props<T>>) => {
    const [isOpen, setIsOpen] = createSignal(false);

    const itemSelected = (item: T) => {
        props.onChange(item);
        setIsOpen(false);
    }

    let button: HTMLButtonElement | undefined;

    const divRef = (div: HTMLElement) => {
        setTimeout(() => {
            const sz = button?.getBoundingClientRect();
            if (sz) {
                div.style.width = `${sz.width}px`
            }
        }, 0);
    }

    return <>
        <div class="inline-block relative">
            <Button ref={button} type="button" onClick={() => setIsOpen(open => !open)}>
                <span>{`${props.value}`}</span>
            </Button>
            <div ref={multi(clickOutsideBehaviour(() => setIsOpen(false)), divRef)}
                class="fixed bg-black border-teal-500 rounded p-2 space-y-2"
                classList={{ hidden: !isOpen() }}>
                <For each={props.items}>
                    {item => <>
                        <div onClick={() => itemSelected(item)} class="cursor-pointer">{`${item}`}</div>
                    </>}
                </For>
            </div>
        </div>
    </>
}

export default Select;