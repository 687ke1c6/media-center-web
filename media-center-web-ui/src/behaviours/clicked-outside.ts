import { onCleanup } from "solid-js";

export const clickOutsideBehaviour = (callback: () => void) =>
    (el: HTMLElement) => {
        const onClick = (e: MouseEvent) => !el.contains(e.target as HTMLElement) && callback();
        document.body.addEventListener("click", onClick);
        onCleanup(() => {
            document.body.removeEventListener("click", onClick);
            console.log('cleaned up - clickOutsideBehaviour');
        });
    }