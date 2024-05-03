import { ParentProps, createEffect, type JSX } from "solid-js";

type Props = {
    open: boolean;
    onClose?: JSX.DialogHtmlAttributes<HTMLDialogElement>['onClose'];
}

const Dialog = (props: ParentProps<Props>) => {
    let dialog: HTMLDialogElement|undefined;

    createEffect(() => {
        if (props.open) {
            dialog!.showModal();
        } else
            dialog!.close();
    })

    return <dialog class="torrent-form border border-gray-600 rounded" onClose={props.onClose} ref={dialog}>
        {props.children}
    </dialog>
}
export default Dialog;