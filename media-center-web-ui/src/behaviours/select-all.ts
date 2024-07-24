import { filter, fromEvent } from "rxjs";
import { onCleanup } from "solid-js";

export const selectAllBehaviour = () =>
    (el: HTMLElement) => {
        const onClickEvent = fromEvent<PointerEvent>(el, 'click')
            .pipe(filter(e => e.pointerType !== 'touch'))
            .subscribe(() => (el as HTMLInputElement).select());
        onCleanup(() => 
            onClickEvent.unsubscribe());
    }