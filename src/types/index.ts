export interface IProduct {
    id: string,
    description: string,
    image: string,
    title: string,
    category: TProductCategory,
    price: number | null
}

export interface IOrder {
    payment: string,
    address: string,
    email: string,
    phone: string,
    total: number | null,
    items: TProductId[]
}

export type TProductCategory = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил'; // категории товара

export type TProductBasket = Pick<IProduct, 'title' | 'price'>; // тип данных для отображения товара в корзине

export type TProductPage = Pick<IProduct, 'image' | 'category' | 'price' | 'title'>; // тип данных для отображения товара на главной странице, без описания

export type TProductModal = Pick<IProduct, 'description' | 'image' | 'category' | 'price' | 'title'>; // тип данных для отображения товара в модальном окне

export type TProductId = Pick<IProduct, 'id'>; // тип данных id товара

export type TOrderTotal = Pick<IOrder, 'total'>; // тип данных полной суммы заказа

export type TOrderPayAddress = Pick<IOrder, 'payment' | 'address'>; // тип данных для вида оплаты и адреса при оформлении заказа

export type TOrderContacts = Pick<IOrder, 'email' | 'phone'>; // тип данных для контактов при оформлении заказа

// Интерфейс модели данных карточки
export interface IProductsData {
    products: IProduct[]; // массив объектов товаров
    preview: TProductId | null; // id товара, для просмотра в модальном окне или добавленного в корзину
    getProductsList(): IProduct[]; // получает массив товаров с сервера
    getProduct(productId: TProductId): IProduct; // получает товар по id
    hasInBasket(productId: TProductId, basketProducts: TProductId[]): boolean; // проверяет добавлен ли товар в корзину
    hasPriceNull(price: number | null): boolean; // проверяет цену на null
}

// Интерфейс модели данных заказа
export interface IOrderData {
    orderData: IOrder; // объект заказа
    setOrderInfo(orderData: IOrder): void; // отправляет данные для оформления заказа на сервер
    checkValidation(data: Record<keyof TOrderPayAddress & TOrderContacts, string>): boolean; // проверяет валидацию данных в форме
}

// Интерфейс модели данных корзины
export interface IBasketData {
    basketProducts: IProduct[]; // список добавленных в корзину товаров
    getBasketProducts(): IProduct[]; // получает список добавленных в корзину товаров
    addProduct(card: TProductBasket): void; // добавляет товар в корзину, при условии, что он еще не добавлен
    deleteBasketProduct(TProductId: string): void; // удаляет товар из корзины
    getTotal(prices: number[] | null): TOrderTotal; // получает общую суммы заказа
    clearBasketProducts(): void; // удаление всех товаров из корзины после успешного оформления заказа
}



