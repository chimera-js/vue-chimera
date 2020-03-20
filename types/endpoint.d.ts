export interface CacheInterface {
    setItem: (key: string, value: object) => void
    getItem: (key: string) => object
    removeItem: (key: string) => void
    keys: () => Array<string>
    all: () => object
    length: () => number
    clear: () => void
}

export type TransformerDef = (res: any) => any

export type Dictionary = { [key: string]: string }

export type EventHandler = ((endpoint: Endpoint) => void) | string

export type EndpointDef = {
    url: string,
    method?: string,
    params?: any,
    baseURL?: string,
    headers?: Dictionary,
    on: {
        [key: string]: EventHandler | EventHandler[]
    },
    debounce?: boolean | number,
    interval?: number | boolean,
    timeout?: number,
    transformer?: TransformerDef | { response: TransformerDef, error: TransformerDef },
    auto?: boolean,
    prefetch?: boolean,
    prefetchTimeout?: number,
    keepData?: boolean,
    cache?: CacheInterface,
    axios?: object | (() => object),

    [key: string]: any
} | string

type Response = {
    status: number | null,
    data: any,
    headers: Dictionary | null,
    error: object | string | null,
    lastLoaded: Date | null
}

type Request = {
    url: string,
    baseURL: string | null,
    method: 'get' | 'post' | 'delete' | 'patch' | 'put',
    params: object | null,
    timeout: number,
    headers: Dictionary | null
}

export interface Endpoint {
    data: any,
    headers: Dictionary | null,
    params: object | null,
    loading: boolean,
    prefetched: boolean,

    looping: boolean,

    fetch (force?: boolean, extraOptions?: Partial<Request>): Promise<any>

    on (event: string, handler: (endpoint: Endpoint) => void): this

    emit (event: string) : void

    reload() : Promise<any>

    cancel() : void

    request: Request,

    response: Response,

    [key: string]: any
}
