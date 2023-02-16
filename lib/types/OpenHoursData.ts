export default interface OpenHoursData {
    _id: string,
    short: "PON" | "WTO" | "ŚRO" | "CZW" | "PIĄ" | "CZW" | "NIEDZ",
    long: "Poniedziałek" | "Wtorek" | "Środa" | "Czwartek" | "Piątek" | "Sobota" | "Niedziela",
    hours: string,
}