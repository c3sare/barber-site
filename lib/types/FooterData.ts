export default interface FooterData {
    file: string,
    linkBoxes: {
        name: string,
        links: {
            id: number,
            name: string,
            url: string
        }[]
    }[],
    desc:string,
    btnTitle?: string,
    btnLink?: string,
    btnMore: boolean,
    logo: string
}