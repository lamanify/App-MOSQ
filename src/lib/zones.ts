// JAKIM Waktu Solat Zone Codes
// Source: https://www.e-solat.gov.my/

export interface Zone {
    code: string;
    name: string;
    state: string;
}

export interface StateZones {
    state: string;
    zones: Zone[];
}

export const STATES = [
    "Johor",
    "Kedah",
    "Kelantan",
    "Melaka",
    "Negeri Sembilan",
    "Pahang",
    "Perak",
    "Perlis",
    "Pulau Pinang",
    "Sabah",
    "Sarawak",
    "Selangor",
    "Terengganu",
    "Wilayah Persekutuan",
] as const;

export type StateName = (typeof STATES)[number];

export const ZONE_DATA: StateZones[] = [
    {
        state: "Johor",
        zones: [
            { code: "JHR01", name: "Pulau Aur dan Pulau Pemanggil", state: "Johor" },
            { code: "JHR02", name: "Johor Bahru, Kota Tinggi, Mersing, Kulai", state: "Johor" },
            { code: "JHR03", name: "Kluang, Pontian", state: "Johor" },
            { code: "JHR04", name: "Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak", state: "Johor" },
        ],
    },
    {
        state: "Kedah",
        zones: [
            { code: "KDH01", name: "Kota Setar, Kubang Pasu, Pokok Sena (Daerah Kecil)", state: "Kedah" },
            { code: "KDH02", name: "Kuala Muda, Yan, Pendang", state: "Kedah" },
            { code: "KDH03", name: "Padang Terap, Sik", state: "Kedah" },
            { code: "KDH04", name: "Baling", state: "Kedah" },
            { code: "KDH05", name: "Bandar Baharu, Kulim", state: "Kedah" },
            { code: "KDH06", name: "Langkawi", state: "Kedah" },
            { code: "KDH07", name: "Puncak Gunung Jerai", state: "Kedah" },
        ],
    },
    {
        state: "Kelantan",
        zones: [
            { code: "KTN01", name: "Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku", state: "Kelantan" },
            { code: "KTN02", name: "Gua Musang (Daerah Galas Dan Bertam), Jeli, Jajahan Kecil Lojing", state: "Kelantan" },
        ],
    },
    {
        state: "Melaka",
        zones: [
            { code: "MLK01", name: "Seluruh Negeri Melaka", state: "Melaka" },
        ],
    },
    {
        state: "Negeri Sembilan",
        zones: [
            { code: "NGS01", name: "Tampin, Jempol", state: "Negeri Sembilan" },
            { code: "NGS02", name: "Jelebu, Kuala Pilah, Port Dickson, Rembau, Seremban", state: "Negeri Sembilan" },
        ],
    },
    {
        state: "Pahang",
        zones: [
            { code: "PHG01", name: "Pulau Tioman", state: "Pahang" },
            { code: "PHG02", name: "Rompin, Pekan, Muadzam Shah, Kuantan", state: "Pahang" },
            { code: "PHG03", name: "Jerantut, Temerloh, Maran, Bera, Chenor, Jengka", state: "Pahang" },
            { code: "PHG04", name: "Bentong, Lipis, Raub", state: "Pahang" },
            { code: "PHG05", name: "Genting Highlands, Cameron Highlands", state: "Pahang" },
        ],
    },
    {
        state: "Perak",
        zones: [
            { code: "PRK01", name: "Tapah, Slim River, Tanjung Malim", state: "Perak" },
            { code: "PRK02", name: "Kuala Kangsar, Sg. Siput (Daerah Kecil), Ipoh, Batu Gajah, Kampar", state: "Perak" },
            { code: "PRK03", name: "Lenggong, Pengkalan Hulu, Grik", state: "Perak" },
            { code: "PRK04", name: "Temengor, Belum", state: "Perak" },
            { code: "PRK05", name: "Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor", state: "Perak" },
            { code: "PRK06", name: "Selama, Taiping, Bagan Serai, Parit Buntar", state: "Perak" },
            { code: "PRK07", name: "Bukit Larut", state: "Perak" },
        ],
    },
    {
        state: "Perlis",
        zones: [
            { code: "PLS01", name: "Kangar, Padang Besar, Arau", state: "Perlis" },
        ],
    },
    {
        state: "Pulau Pinang",
        zones: [
            { code: "PNG01", name: "Seluruh Negeri Pulau Pinang", state: "Pulau Pinang" },
        ],
    },
    {
        state: "Sabah",
        zones: [
            { code: "SBH01", name: "Bahagian Sandakan (Timur), Bandar Sandakan, Kinabatangan", state: "Sabah" },
            { code: "SBH02", name: "Beluran, Telupid, Pinangah, Terusan, Kuamut, Bahagian Sandakan (Barat)", state: "Sabah" },
            { code: "SBH03", name: "Lahad Datu, Silabukan, Kunak, Semporna, Tungku, Bahagian Tawau (Timur)", state: "Sabah" },
            { code: "SBH04", name: "Bandar Tawau, Balong, Merotai, Kalabakan, Bahagian Tawau (Barat)", state: "Sabah" },
            { code: "SBH05", name: "Kudat, Kota Marudu, Pitas, Bahagian Kudat", state: "Sabah" },
            { code: "SBH06", name: "Gunung Kinabalu", state: "Sabah" },
            { code: "SBH07", name: "Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan, Bahagian Pantai Barat", state: "Sabah" },
            { code: "SBH08", name: "Pensiangan, Keningau, Tambunan, Nabawan, Bahagian Pendalaman (Atas)", state: "Sabah" },
            { code: "SBH09", name: "Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pa Sia, Membakut, Weston, Bahagian Pendalaman (Bawah)", state: "Sabah" },
        ],
    },
    {
        state: "Sarawak",
        zones: [
            { code: "SWK01", name: "Limbang, Lawas, Sundar, Trusan", state: "Sarawak" },
            { code: "SWK02", name: "Miri, Niah, Bekenu, Sibuti, Marudi", state: "Sarawak" },
            { code: "SWK03", name: "Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu", state: "Sarawak" },
            { code: "SWK04", name: "Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit", state: "Sarawak" },
            { code: "SWK05", name: "Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai", state: "Sarawak" },
            { code: "SWK06", name: "Lubok Antu, Sri Aman, Engkelili, Betong, Spaoh, Pusa, Saratok", state: "Sarawak" },
            { code: "SWK07", name: "Serian, Simunjan, Samarahan, Sebuyau, Meludam", state: "Sarawak" },
            { code: "SWK08", name: "Kuching, Bau, Lundu, Sematan", state: "Sarawak" },
            { code: "SWK09", name: "Zon Khas (Kampung Patarikan)", state: "Sarawak" },
        ],
    },
    {
        state: "Selangor",
        zones: [
            { code: "SGR01", name: "Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam", state: "Selangor" },
            { code: "SGR02", name: "Kuala Selangor, Sabak Bernam", state: "Selangor" },
            { code: "SGR03", name: "Klang, Kuala Langat", state: "Selangor" },
        ],
    },
    {
        state: "Terengganu",
        zones: [
            { code: "TRG01", name: "Kuala Terengganu, Marang, Kuala Nerus", state: "Terengganu" },
            { code: "TRG02", name: "Besut, Setiu", state: "Terengganu" },
            { code: "TRG03", name: "Hulu Terengganu", state: "Terengganu" },
            { code: "TRG04", name: "Dungun, Kemaman", state: "Terengganu" },
        ],
    },
    {
        state: "Wilayah Persekutuan",
        zones: [
            { code: "WLY01", name: "Kuala Lumpur, Putrajaya", state: "Wilayah Persekutuan" },
            { code: "WLY02", name: "Labuan", state: "Wilayah Persekutuan" },
        ],
    },
];

export function getZonesByState(state: string): Zone[] {
    const stateData = ZONE_DATA.find((s) => s.state === state);
    return stateData?.zones || [];
}

export function getZoneByCode(code: string): Zone | undefined {
    for (const stateData of ZONE_DATA) {
        const zone = stateData.zones.find((z) => z.code === code);
        if (zone) return zone;
    }
    return undefined;
}
