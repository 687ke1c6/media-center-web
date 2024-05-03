import { onCleanup } from "solid-js";

export const selectAllBehaviour = () => 
    (el: HTMLElement) => {
        const handler = () => (el as HTMLInputElement).select();
        el.addEventListener('click', handler);
        onCleanup(() => el.removeEventListener('click', handler));
    }