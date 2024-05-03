import { onCleanup } from "solid-js";

export const resizeBehaviour = (cssVar?: string) =>
    (el: HTMLElement) => {
        const resizeObserver = new ResizeObserver((entries) => {
            // callback(entries[0]);
            if (cssVar) {
                (entries[0].target as HTMLElement).style.setProperty(cssVar, `${entries[0].contentRect.width}px`);
            }
        });
        resizeObserver.observe(el);
        onCleanup(() => {
            console.log('onCleanup - resizeBehaviour');
            resizeObserver.unobserve(el);
        });
    }