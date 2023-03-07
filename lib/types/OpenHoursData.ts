export default interface OpenHoursData {
    _id: string,
    short: "pon" | "wto" | "sro" | "czw" | "pia" | "sob" | "nie",
    long: "Poniedziałek" | "Wtorek" | "Środa" | "Czwartek" | "Piątek" | "Sobota" | "Niedziela",
    start: string,
    end: string,
    closed: boolean,
    order: number
}