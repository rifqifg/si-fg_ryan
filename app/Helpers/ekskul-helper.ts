export function nilaiEkskul(nilai: string | undefined) {
    if (nilai == 'A') {
        return 'Sangat Baik'
    } else if (nilai == 'B') {
        return 'Baik'
    } else if (nilai == 'C') {
        return 'Cukup'
    } else {
        return 'Format nilai tidak valid'
    }
}