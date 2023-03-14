export default interface NewsData {
    _id: string,
    desc: string,
    title: string,
    date: string,
    img: string | Blob[],
    slug: string
}