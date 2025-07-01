import classNames from "classnames";
import { JSX, ParentProps } from "solid-js";

type Props = JSX.IntrinsicElements['button'];

const LinkButton = (props: ParentProps<Props>) =>
    <button
        {...props} class={classNames(props.class, "text-gray px-4 py-2 mt-4 hover:text-white")}>
        {props.children}
    </button>;

export default LinkButton;