export default interface NewsData {
    _id: string,
    id: number,
    desc: string,
    title: string,
    date: string,
    img: string | Blob[],
}