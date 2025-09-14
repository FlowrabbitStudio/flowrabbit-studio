export function microCentoToEuro(micro) {
    return micro / (1000000 * 100); // 1 Cent = 1,000,000 MicroCents
}

export function euroToMicroCento(euro) {
    return Math.round(euro * 1000000 * 100); 
}