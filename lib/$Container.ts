import { $Element, $ElementOptions } from "./$Element";
import { $NodeManager } from "./$NodeManager";
import { $Node } from "./$Node";
import { $State } from "./$State";

export interface $ContainerOptions extends $ElementOptions {}

export class $Container<H extends HTMLElement = HTMLElement> extends $Element<H> {
    readonly children: $NodeManager = new $NodeManager(this);
    constructor(tagname: string, options?: $ContainerOptions) {
        super(tagname, options)
    }

    /**Replace element to this element. 
     * @example Element.content([$('div')]) 
     * Element.content('Hello World')*/
    content(children: $ContainerContentBuilder<this>): this { return $.fluent(this, arguments, () => this, () => {
        this.children.removeAll();
        this.insert(children);
    })}

    /**Insert element to this element */
    insert(children: $ContainerContentBuilder<this>): this { return $.fluent(this, arguments, () => this, () => {
        if (children instanceof Function) children = children(this);
        children = $.multableResolve(children);
        for (const child of children) {
            if (child === undefined) return;
            if (child instanceof Array) this.insert(child)
            else this.children.add(child);
        }
        this.children.render();
    })}
}

export type $ContainerContentBuilder<P extends $Container> = OrMatrix<$ContainerContentType> | (($node: P) => OrMatrix<$ContainerContentType>)
export type $ContainerContentType = $Node | string | undefined | $State<any>