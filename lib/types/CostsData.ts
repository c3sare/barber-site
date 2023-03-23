export interface CostsData {
    _id: string,
    category: string,
    services: {
        id: number,
        service: string,
        cost: number,
        time: number
    }[]
}