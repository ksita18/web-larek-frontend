import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { AppApi } from './components/AppApi';
import { EventEmitter } from './components/base/events';
import { ensureElement, cloneTemplate, createElement } from './utils/utils';
import { AppData, ProductsChangeEvent } from './components/AppData';
import { PageView } from './components/PageView';
import { ProductView, ProductModal, ProductBasketView } from './components/ProductView';
import { Events, IProduct, IOrder } from './types';
import { Modal } from './components/common/Modal';
import { BasketView } from './components/BasketView';
import { OrderForm } from './components/OrderFormView';
import { ContactsForm } from './components/ContactsFormView';
import { SuccessView } from './components/SuccessView';

const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);

// Все шаблоны
const productCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const productModal = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const productBasket = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successOrderTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppData({}, events, [], [], {
    email: '',
    phone: '',
    payment: null,
    address: '',
    total: 0,
    items: []
});

// Экземпляры классов
const pageView = new PageView(document.body, events);
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsTemplate), events);
const successView = new SuccessView(cloneTemplate(successOrderTemplate), {
    onClick: () => modal.close()
});

// Получаем продукты с сервера для отображения на главной странице
api.getProducts()
    .then(data => appData.setProducts(data.items))
    .catch(err => {
        console.log(err);
    });

//Изменились продукты на главной странице
events.on<ProductsChangeEvent>(Events.PRODUCTS_CHANGED, () => {
    pageView.basketCounter = appData.getBasket().length;
    pageView.products = appData.getProducts().map(item => {
        const product = new ProductView(cloneTemplate(productCatalogTemplate), {
            onClick: () => {
                events.emit(Events.PRODUCT_OPEN_IN_MODAL, item);
            }
        });
        return product.render({
            id: item.id,
            title: item.title,
            image: CDN_URL + item.image,
            category: item.category,
            price: item.price ? `${item.price} синапсов` : 'Бесценно'
        });
    });
});

// Открыть товар в модальном окне
events.on(Events.PRODUCT_OPEN_IN_MODAL, (product: IProduct) => {
    const card = new ProductModal(cloneTemplate(productModal), {
        onClick: () => events.emit(Events.ADD_PRODUCT_TO_BASKET, product),
    });

    modal.render({
        content: card.render({
            title: product.title,
            image: CDN_URL + product.image,
            category: product.category,
            description: product.description,
            price: product.price ? `${product.price} синапсов` : '',
            status: product.price === null || appData.getBasket().some(item => item === product)
        }),
    });
});

// Добавить продукт в корзину
events.on(Events.ADD_PRODUCT_TO_BASKET, (product: IProduct) => {
    appData.addProductToBasket(product);
    pageView.basketCounter = appData.getBasket().length;
    events.emit(Events.BASKET_CHANGE);
    modal.close();
});

// Открытие модального окна с корзиной
events.on(Events.BASKET_OPEN, () => {
	modal.render({
		content: basketView.render(),
	});
});

// Изменение в корзине
events.on(Events.BASKET_CHANGE, () => {
    const products = appData.getBasket().map((item, index) => {
        const product = new ProductBasketView(cloneTemplate(productBasket), {
            onClick: () => 
                events.emit(Events.REMOVE_PRODUCT_FROM_BASKET, item)
    });
        return product.render({
            index: index + 1,
            id: item.id,
            title: item.title,
            price: item.price
        });
    });
    modal.render({
        content: createElement<HTMLElement>('div', {}, [
            basketView.render({
                products,
                total: appData.getTotalPrice()
            })
        ])
    });
});


//Удалить продукт из корзины
events.on(Events.REMOVE_PRODUCT_FROM_BASKET, (product: IProduct) => {
    appData.removeProductFromBasket(product);
    pageView.basketCounter = appData.getBasket().length;
    events.emit(Events.BASKET_CHANGE);
});

//Начать оформление заказа
events.on(Events.ORDER_START, () => {
    if (!appData.isFirstFormFill()) {
        const data = {
            address: ''
        };
        modal.render({
            content: orderForm.render({
                valid: false,
                errors: [],
                ...data
            })
        });
    } else {
        const data = {
            phone: '',
            email: ''
        };
        modal.render({
            content: contactsForm.render({
                valid: false,
                errors: [],
                ...data
            }),
        });
    }
});

events.on(Events.SET_PAYMENT_TYPE, (data: { paymentType: string }) => {
    appData.setOrderField("payment", data.paymentType);
});

// Изменение одного из полей
events.on(/(^order|^contacts)\..*:change/,
    (data: { field: keyof Omit<IOrder, 'items' | 'total'>; value: string }) => {
        appData.setOrderField(data.field, data.value);
    }
);

// Изменение состояния валидации формы
events.on(Events.FORM_ERRORS_CHANGED, (errors: Partial<IOrder>) => {
    const { email, phone, address, payment } = errors;
    orderForm.valid = !address && !payment;
    orderForm.errors = Object.values(errors)
        .filter((i) => !!i)
        .join(', ');

    contactsForm.valid = !email && !phone;
    contactsForm.errors = Object.values(errors)
        .filter((i) => !!i)
        .join(', ');
});

// Отправить форму заказа
events.on(/(^order|^contacts):submit/, () => {
    if (!appData.getOrder().email || !appData.getOrder().address || !appData.getOrder().phone){
        return events.emit(Events.ORDER_START);
    }

    const products = appData.getBasket();

    api
        .createOrder({
            ...appData.getOrder(),
            items: products.map(product => product.id),
            total: appData.getTotalPrice(),
        })
        .then((result) => {
            modal.render({
                content: successView.render({
                    title: !result.error ? 'Заказ оформлен' : 'Ошибка оформления заказа',
                    description: !result.error ? `Списано ${result.total} синапсов` : result.error,
                }),
            });
            events.emit(Events.ORDER_CLEAR);
        })
        .catch(console.error);
});

// Очистить заказ и корзину
events.on(Events.ORDER_CLEAR, () => {
    appData.clearBasket();
    appData.clearOrder();
    orderForm.resetPaymentButtons();
});

// Блокируем прокрутку страницы если открыто модальное окно
events.on(Events.MODAL_OPEN, () => {
    pageView.locked = true;
});

// Разблокируем прокрутку страницы если модальное окно закрыто 
events.on(Events.MODAL_CLOSE, () => {
    pageView.locked = false;
});