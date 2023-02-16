export default interface MenuItem {
    _id: string,
    order: number,
    slug: string,
    title: string,
    on: boolean,
    custom: boolean,
    default: boolean,
    children: MenuItem[],
}