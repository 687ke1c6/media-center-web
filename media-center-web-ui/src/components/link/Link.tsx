import { ParentProps, JSX } from "solid-js";

type Props = {
    linkClicked?: JSX.CustomEventHandlersCamelCase<HTMLAnchorElement>['onClick'];
    classNames: string;
    to: string;
    newTab?: boolean;
}

const Link = (props: ParentProps<Props>) =>
    <a 
        class={props.classNames}
        target={props.newTab ? "_blank" : undefined}
        href={props.to} 
        onClick={props.linkClicked}>
        {props.children}
    </a>

export default Link;