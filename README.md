https://github.com/ksita18/web-larek-frontend.git

# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Данные и типы данных, используемые в приложении

IProduct - интерфейс для описания карточки товара.
Этот интерфейс описывает базовую структуру объекта товара. Он используется для хранения базовой информации о товаре, такой как уникальный идентификатор товара(id), описание товара(description), изображение(image), название товара(title), категория, к которой относится товар(category) и его стоимость(price).
```

 interface IProduct {
    id: string,
    description: string,
    image: string,
    title: string,
    category: ProductCategory,
    price: number | null
}
```
Категории товара
```
 enum ProductCategory {
    'софт-скил' = 'soft', 
    'другое' = 'other',
    'дополнительное' = 'additional', 
    'кнопка' = 'button',
    'хард-скил' = 'hard'
}
```
IOrder интерфейс для описания заказа. Включает в себя хранение информации о типе оплаты выбранном покупателем(payment), контактных данных покупателя(address, email, phone), итоговой стоимости заказа(total) и список товаров(items).
```
 interface IOrder {
    payment: string,
    address: string,
    email: string,
    phone: string,
    total: number | null,
    items: TProductId[]
}
```
Тип данных ошибок в форме
```
type FormErrors = {
    email?: string;
    phone?: string;
    address?: string;
    payment?: string;
}
```

Тип данных для отображения товара в корзине
```
 type TProductBasket = Pick<IProduct, 'title' | 'price'>; 
```

Тип данных при отправке заказа на сервер 
```
interface IOrderResult {
    id: string
    total: number
    error?: string
}
```
Интерфейс модели данных
```
interface IAppData {
    products: IProduct[]
    basket: IProduct[]
    order: IOrder
}
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице, 
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы: 
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие   

#### Класс Model

Родительский класс модели данных, работает с дженериками.\
Конструктор:  
`constructor(data: Partial<T>, protected events: IEvents)` - принимает данные выбранного нами типа(возможно неполные) и экземпляр IEvents для работы с событиями  
Основные методы:  
`emitChanges(event: string, payload?: object)` - сообщает всем, что модель изменилась. Принимает на вход событие и данные, которые изменились

### Слой данных
#### Класс AppData
Класс отвечает за хранение данных приложения  
Расширяет класс Model Все поля приватные, доступ через методы  
В полях класса хранятся следующие данные:  
- `products: IProduct[]` - массив объектов продуктов (товаров)  
- `basket: IProduct[]` - массив товаров в корзине  
- `order: IOrder` - заказ  
- `selectedProduct: string | null` - id товара для отображения в модальном окне  

Также класс предоставляет набор методов для взаимодействия с этими данными:  
- `setProducts` - получаем товары для главной страницы  
- `selectProduct` - выбор продукта для отображения в модальном окне  
- `addProductToBasket` - добавление товара в корзину  
- `removeProductFromBasket` - удаление товара из корзины  
- `getBasketProducts` - получение товаров в корзине  
- `getTotalPrice` - получение стоимости всей корзины  
- `clearBasket` - очищаем корзину  
- `clearOrder` - очищаем текущий заказ  
- `setOrderField` - записываем значение в поле заказа  
- `validateOrder` - валидация полей заказа и установка значений ошибок, если они есть


### Классы представления
Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

#### Базовый Класс Component

Класс является дженериком и родителем всех компонентов слоя представления. В дженерик принимает тип объекта, в котором данные будут передаваться в метод `render` для отображения данных в компоненте.\
В конструктор принимает элемент разметки, являющийся основным родительским контейнером компонента. Содержит метод `render`, отвечающий за сохранение полученных в параметре данных в полях компонентов через их сеттеры, возвращает обновленный контейнер компонента.

#### Класс Form

Общий класс для работы с формами, расширяет Component  
Основные методы:  
- `onInputChange` - изменение значений полей ввода  
- `set isButtonActive` - активна ли кнопка отправки  
- `set errors` - установка текстов ошибок  
Классы OrderFormView и ContactsFormView расширяют класс Form, определяя конкретные поля ввода данных.

#### Класс Modal
Реализует модальное окно. Так же предоставляет методы `open` и `close` для управления отображением модального окна. Устанавливает слушатели на клавиатуру, для закрытия модального окна по Esc, на клик в оверлей и кнопку-крестик для закрытия попапа.  
- `constructor(selector: string, events: IEvents)` Конструктор принимает селектор, по которому в разметке страницы будет идентифицировано модальное окно и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля класса
- `modal: HTMLElement` - элемент модального окна
- `events: IEvents` - брокер событий

#### Класс ProductView
Отвечает за отображение карточки товара на главной странице, задавая в карточке данные названия, цены, а также кнопки. Класс наследуется от базового Component. Конструктор принимает HTMLElement контейнер и интерфейс IProductActions для инициации событий.  
Поля класса содержат элементы разметки элементов карточки.  

Методы класса:
- сеттеры для элементов карточки товара

#### Класс ProductModal

Отображение карточки товара в модальном окне.  
Поля класса содержат элементы разметки элементов карточки.  

Методы класса:  
- сеттеры для элементов карточки товара

#### Класс ProductBasketView

Отображение карточки товара в модальном окне корзины.  
Поля класса содержат элементы разметки элементов карточки.  

Методы класса:  
- сеттеры для элементов карточки товара

#### Класс BasketView

Предназначен для реализации отображения корзины. Получает данные товаров в корзине, которые нужно отобразить.  
Наследуется от базового класса Сomponent. Конструктор принимает HTMLElement контейнера, по которому в разметке страницы будет идентифицирован темплейт.
Поля класса:
- `_list: HTMLElement` - элемент разметки со списком
- `_total: HTMLElement` - элемент разметки для вывода общей суммы заказа
- `_button: HTMLButtonElement` - элемент разметки кнопки оформления заказа

Методы класса:
- `toggleButton` - меняет активность кнопки в корзине
- сеттеры для элементов карточки товара

#### Класс SuccessView

Предназначен для реализации отображения успешной оплаты заказа. Получает данные суммы списания, которые нужно отобразить.  
Класс наследуется от базового Component.  
Конструктор принимает HTMLElement контейнера, по которому в разметке страницы будет идентифицирован темплейт.  
Поля класса:

- `_total: HTMLElement` - элемент разметки для вывода общей суммы  
- `_successButton: HTMLButtonElement` - элемент разметки кнопки перейти к покупкам  

Методы:  

- сеттер для вывода общей суммы оплаты.

### Слой коммуникации

#### Класс AppApi
Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

_Список всех событий, которые могут генерироваться в системе:_  

_События изменения данных (генерируются классами моделями данных)_  
`products:changed` - изменение списка товаров  
_События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)_: 
`product:openInModal` - открытие модального окна с товаром
`product:addToBasket` - добавление товара в корзину  
`product:removeFromBasket` - удаление товара из корзины  
`basket:open` - открытие корзины пользователя
`order:start` - открытие формы заказа 
`order:setPaymentType` - выбор типа оплаты 
`order:ready` - оформление заказа
`order:clear` - очистка формы заказа
`form:errorsChanged` - показ(скрытие) ошибок формы  
`modal:open` - открытие модального окна  
`modal:close` - закрытие модального окна  