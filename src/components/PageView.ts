import {Component} from "./base/Component";
import {IEvents} from "./base/events";
import {ensureElement} from "../utils/utils";
import {Events} from "../types";

interface IPage {
    basketCounter: number;
    products: HTMLElement[];
    locked: boolean;
}

export class PageView extends Component<IPage> {
    private _basketCounter: HTMLElement;
    private _products: HTMLElement;
    private _basket: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
        this._products = ensureElement<HTMLElement>('.gallery');
        this._basket = ensureElement<HTMLElement>('.header__basket');

        this._basket.addEventListener('click', () => {
            this.events.emit(Events.BASKET_OPEN);
        });
    }

    set products(products: HTMLElement[]) {
        this._products.replaceChildren(...products);
    }

    set basketCounter(counter: number) {
        this.setText(this._basketCounter, counter);
    }
}