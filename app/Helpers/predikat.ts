export function predikatHelper(num: number, category: string) {
    if (num < 75 && category == 'PENGETAHUAN') {
        return 'Cukup baik, sudah memahami beberapa kompetensi dan masih harus lebih intensif menelaah materi'
    } else if (num >= 75 && num <= 82 && category == 'PENGETAHUAN') {
        return 'Cukup baik, sudah memahami semua kompetensi yang diajarkan, tetapi masih perlu ditingkatkan'
    } else if (num >= 83 && num <= 91 && category == 'PENGETAHUAN') {
        return 'Baik, sudah memahami semua kompetensi yang diajarkan'
    } else if (num >= 92 && num <= 100 && category == 'PENGETAHUAN') {
        return 'Sangat baik, sudah memahami seluruh kompetensi yang diajarkan'
    } else if (num < 75 && category == 'KETERAMPILAN') {
        return 'Cukup terampil, dalam mengimplementasikan kompetensi tetapi harus lebih banyak meningkatkan telaah materi'
    } else if (num >= 75 && num <= 82 && category == 'KETERAMPILAN') {
        return 'Baik, sudah cukup terampil mengimplementasikan kompetensi'
    } else if (num >= 83 && num <= 91 && category == 'KETERAMPILAN') {
        return 'Baik, terampil dalam mengimplementasikan dalam kehidupan sehari-hari'
    } else if (num >= 92 && num <= 100 && category == 'PENGETAHUAN') {
        return 'Sangat terampil, dapat mengaplikasikan kompetensi ke dalam kehidupan sehari-hari'
    }
}


export function predikatHalUmum(nilai: number) {
    if (nilai < 75) {
        return 'D'
    } else if (nilai >= 75 && nilai <= 82) {
        return 'C'
    } else if (nilai >= 82.5 && nilai < 91.5) {
        return 'B'
    } else {
        return 'A'
    }
}

export function predikatSikap(sikap: string) {
    if (sikap == 'C') {
        return 'Cukup konsisten dalam menjalankan sikap beriman, bertaqwa, jujur, disiplin, dan bekerja sama, namun perlu peningkatan rasa percaya diri'
    } else if (sikap == 'B') {
        return 'Konsisten dalam menjalankan sikap beriman,bertaqwa, jujur, disiplin, bertanggung jawab dan kerja sama, namun perlu peningkatan rasa percaya diri'
    } else  {
        return 'Sudah sangat konsisten menunjukkan sikap beriman, bertaqwa, jujur, disiplin, bertanggung jawab, dan bekerja sama'
    }
}