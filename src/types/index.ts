export interface IProduct {
    id: string,
    description: string,
    image: string,
    title: string,
    category: ProductCategory,
    price: number | null
}

export enum ProductCategory {
    'софт-скил' = 'soft', 
    'другое' = 'other',
    'дополнительное' = 'additional', 
    'кнопка' = 'button',
    'хард-скил' = 'hard'
} // категории товара

export interface IOrder {
    payment: string,
    address: string,
    email: string,
    phone: string,
    total: number | null,
    items: string[]
}

export type FormErrors = {
    email?: string;
    phone?: string;
    address?: string;
    payment?: string;
}

export type TProductBasket = Pick<IProduct, 'id' | 'title' | 'price'>; // тип данных для отображения товара в корзине

export type ListItem = {
    index: number
}

export interface IOrderResult {
    id: string
    total: number
    error?: string
}

export enum Events {
    PRODUCTS_CHANGED = 'products:changed',
    PRODUCT_OPEN_IN_MODAL = 'product:openInModal',
    ADD_PRODUCT_TO_BASKET = 'product:addToBasket',
    REMOVE_PRODUCT_FROM_BASKET = 'product:removeFromBasket',
    BASKET_OPEN = 'basket:open',
    BASKET_CHANGE = 'basket:change',
    ORDER_START = 'order:start',
    SET_PAYMENT_TYPE = 'order:setPaymentType',
    ORDER_READY = 'order:ready',
    ORDER_CLEAR = 'order:clear',
    FORM_ERRORS_CHANGED = 'form:errorsChanged',
    MODAL_OPEN = 'modal:open',
    MODAL_CLOSE = 'modal:close'
}

export interface IList<T> {
    items: T[]
    total: number
}

export interface IAppApi {
    getProducts(): Promise<IList<IProduct>>;
    createOrder(order: IOrder): Promise<IOrderResult>;
}
