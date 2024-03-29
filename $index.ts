import { $Node, $State } from "./index";
import { $Anchor } from "./lib/$Anchor";
import { $Button } from "./lib/$Button";
import { $Form } from "./lib/$Form";
import { $Input } from "./lib/$Input";
import { $Container } from "./lib/$Container";
import { $Element } from "./lib/$Element";
import { $Label } from "./lib/$Label";
import { Router } from "./lib/Router/Router";
import { $Image } from "./lib/$Image";
import { $Canvas } from "./lib/$Canvas";
import { $Dialog } from "./lib/$Dialog";
export type $ = typeof $;
export function $(element: null): null;
export function $<K extends keyof $.TagNameTypeMap>(resolver: K): $.TagNameTypeMap[K];
export function $<K extends string>(resolver: K): $Container;
export function $<H extends HTMLElement>(htmlElement: H): $.HTMLElementTo$ElementMap<H>;
export function $<H extends Element>(element: H): $Element;
export function $<H extends EventTarget>(element: H): $Element;
export function $(element: null | HTMLElement | EventTarget): $Element | null;
export function $(element: undefined): undefined;
export function $(resolver: any) {
    if (typeof resolver === 'undefined') return resolver;
    if (resolver === null) return resolver;
    if (typeof resolver === 'string') {
        if (resolver in $.TagNameElementMap) {
            const instance = $.TagNameElementMap[resolver as keyof typeof $.TagNameElementMap]
            switch (instance) {
                case $Element: return new $Element(resolver);
                case $Anchor: return new $Anchor();
                case $Container: return new $Container(resolver);
                case $Input: return new $Input();
                case $Label: return new $Label();
                case $Form: return new $Form();
                case $Button: return new $Button();
                case $Image: return new $Image();
                case $Canvas: return new $Canvas();
                case $Dialog: return new $Dialog();
            }
        } else return new $Container(resolver);
    }
    if (resolver instanceof HTMLElement || resolver instanceof Text) {
        if (resolver.$) return resolver.$;
        else return $Node.from(resolver);
    }
    throw '$: NOT SUPPORT TARGET ELEMENT TYPE'
}

export namespace $ {
    export let anchorHandler: null | ((url: string, e: Event) => void) = null;
    export let anchorPreventDefault: boolean = false;
    export const routers = new Set<Router>;
    export const TagNameElementMap = {
        'a': $Anchor,
        'p': $Container,
        'pre': $Container,
        'code': $Container,
        'blockquote': $Container,
        'strong': $Container,
        'h1': $Container,
        'h2': $Container,
        'h3': $Container,
        'h4': $Container,
        'h5': $Container,
        'h6': $Container,
        'div': $Container,
        'ol': $Container,
        'ul': $Container,
        'dl': $Container,
        'li': $Container,
        'input': $Input,
        'label': $Label,
        'button': $Button,
        'form': $Form,
        'img': $Image,
        'dialog': $Dialog,
        'canvas': $Canvas
    }
    export type TagNameTypeMap = {
        [key in keyof typeof $.TagNameElementMap]: InstanceType<typeof $.TagNameElementMap[key]>;
    };
    export type ContainerTypeTagName = Exclude<keyof TagNameTypeMap, 'input'>;
    export type SelfTypeTagName = 'input';

    export type HTMLElementTo$ElementMap<H extends HTMLElement> = 
    H extends HTMLLabelElement ? $Label 
    : H extends HTMLInputElement ? $Input
    : H extends HTMLAnchorElement ? $Anchor
    : H extends HTMLButtonElement ? $Button
    : H extends HTMLFormElement ? $Form
    : H extends HTMLImageElement ? $Image
    : H extends HTMLFormElement ? $Form
    : H extends HTMLCanvasElement ? $Canvas
    : H extends HTMLDialogElement ? $Dialog
    : $Element<H>;

    export function fluent<T, A, V>(instance: T, args: IArguments, value: () => V, action: (...args: any[]) => void) {
        if (!args.length) return value();
        action();
        return instance;
    }
    
    export function multableResolve<T>(multable: OrArray<T>) {
        if (multable instanceof Array) return multable;
        else return [multable];
    }
    
    export function mixin(target: any, constructors: OrArray<any>) {
        multableResolve(constructors).forEach(constructor => {
            Object.getOwnPropertyNames(constructor.prototype).forEach(name => {
            if (name === 'constructor') return;
            Object.defineProperty(
                target.prototype,
                name,
                Object.getOwnPropertyDescriptor(constructor.prototype, name) || Object.create(null)
            )
            })
        })
        return target;
    }
    
    export function set<O, K extends keyof O>(object: O, key: K, value: any, methodKey?: string) {
        if (value === undefined) return;
        if (value instanceof $State && object instanceof Node) {
            value.use(object.$, methodKey ?? key as any);
            object[key] = value.value;
            return;
        }
        object[key] = value;
    }
    
    export function state<T>(value: T) {
        return new $State<T>(value)
    }

    export async function resize(object: Blob, size: number): Promise<string> {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const $img = $('img');
                $img.once('load', e => {
                    const $canvas = $('canvas');
                    const context = $canvas.getContext('2d');
                    const ratio = $img.height() / $img.width();
                    const [w, h] = [
                        ratio > 1 ? size / ratio : size,
                        ratio > 1 ? size : size * ratio,
                    ]
                    $canvas.height(h).width(w);
                    context?.drawImage($img.dom, 0, 0, w, h);
                    resolve($canvas.toDataURL(object.type))
                })
                if (!e.target) throw "$.resize(): e.target is null";
                $img.src(e.target.result as string);
            }
            reader.readAsDataURL(object);
        })
    }

    export function rem(amount: number = 1) {
        return parseInt(getComputedStyle(document.documentElement).fontSize) * amount
    }

    /**Build multiple element in once. */
    export function builder<F extends BuildNodeFunction, R extends ReturnType<F>>(bulder: F, params: [...Parameters<F>][], callback?: BuilderSelfFunction<R>): R[]
    export function builder<F extends BuildNodeFunction, R extends ReturnType<F>>(bulder: [F, ...Parameters<F>], size: number, callback?: BuilderSelfFunction<R>): R[]
    export function builder<F extends BuildNodeFunction, R extends ReturnType<F>>(bulder: [F, ...Parameters<F>], options: ($Node | string | BuilderSelfFunction<R>)[]): R[]
    export function builder<K extends $.SelfTypeTagName>(tagname: K, size: number, callback?: BuilderSelfFunction<$.TagNameTypeMap[K]>): $.TagNameTypeMap[K][]
    export function builder<K extends $.SelfTypeTagName>(tagname: K, callback: BuilderSelfFunction<$.TagNameTypeMap[K]>[]): $.TagNameTypeMap[K][]
    export function builder<K extends $.ContainerTypeTagName>(tagname: K, size: number, callback?: BuilderSelfFunction<$.TagNameTypeMap[K]>): $.TagNameTypeMap[K][]
    export function builder<K extends $.ContainerTypeTagName>(tagname: K, options: ($Node | string | BuilderSelfFunction<$.TagNameTypeMap[K]>)[]): $.TagNameTypeMap[K][]
    export function builder(tagname: any, resolver: any, callback?: BuilderSelfFunction<any>) {
        if (typeof resolver === 'number') {
            return Array(resolver).fill('').map(v => {
                const ele = isTuppleBuilder(tagname) ? tagname[0](...tagname.slice(1) as []) : $(tagname);
                if (callback) callback(ele);
                return ele
            });
        }
        else {
            const eleArray = [];
            for (const item of resolver) {
                const ele = tagname instanceof Function ? tagname(...item) // tagname is function, item is params
                : isTuppleBuilder(tagname) ? tagname[0](...tagname.slice(1) as []) 
                : $(tagname);
                if (item instanceof Function) { item(ele) }
                else if (item instanceof $Node || typeof item === 'string') { ele.content(item) }
                eleArray.push(ele);
            }
            return eleArray;
        }
    
        function isTuppleBuilder(target: any): target is [BuildNodeFunction, ...any] {
            if (target instanceof Array && target[0] instanceof Function) return true;
            else return false; 
        }
    }
}
type BuildNodeFunction = (...args: any[]) => $Node;
type BuilderSelfFunction<K extends $Node> = (self: K) => void;
globalThis.$ = $;