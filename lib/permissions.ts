interface perms {
    [key: string]: string
}

const permissions:perms = {
    basic: "Konfiguracja podstawowa",
    footer: "Konfiguracja stopki",
    menu: "Konfiguracja nawigacji górnej",
    news: "Zarządzanie aktualnościami",
    workers: "Zarządzanie pracownikami",
    reservations: "Zarządzanie rezerwacjami",
    smtpconfig: "Ustawienia poczty e-mail",
    users: "Zarządzanie dostępem do panelu"
}

export default permissions;