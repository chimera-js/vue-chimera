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

export type EndpointDef = {
    url: string,
    method?: string,
    params?: any,
    on: {
        [key: string]: (endpoint: Endpoint) => void
    },
    debounce?: boolean | number,
    interval?: number | boolean,
    transformer?: TransformerDef | { response: TransformerDef, error: TransformerDef },
    auto?: boolean,
    prefetch?: boolean,
    keepData?: boolean,
    cache?: CacheInterface,

    [key: string]: any
} | string

type Response = {
    status: number | null,
    data: any,
    headers: object | null,
    error: object | string | null,
    lastLoaded: Date | null
}

type Request = {
    url: string,
    baseURL: string | null,
    method: 'get' | 'post' | 'delete' | 'patch' | 'put',
    params: object | null,
    timeout: number,
    headers: object | null
}

export interface Endpoint {
    data: any,
    headers: object | null,
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
