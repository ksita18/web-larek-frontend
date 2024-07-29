import {IOrder, IOrderResult, IProduct, IList, IAppApi} from "../types";
import {Api} from "./base/api";

export class AppApi extends Api implements IAppApi {
    readonly cdn: string

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }
    getProducts(): Promise<IList<IProduct>> {
        return this.get('/product') as Promise<IList<IProduct>>;
    }

    createOrder(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order) as Promise<IOrderResult>;
    }
}