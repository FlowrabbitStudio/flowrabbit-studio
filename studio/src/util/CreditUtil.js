export function microCentoToEuro(micro) {
    return micro / (1000000 * 100); // 1 Cent = 1,000,000 MicroCents
}

export function euroToMicroCent(euro) {
    return Math.round(euro * 1000000 * 100); 
}

export function pricePerMillionToPriceMicroCent(pricePerMillionInEuro) {
    const pricePerTokenInEuro = pricePerMillionInEuro / 1000000;
    return euroToMicroCent(pricePerTokenInEuro);
}

export function pricePerUnitToPricePerMillion(priceInMicroCent) {
    const pricePerMillionToPriceMicroCent = Math.round(priceInMicroCent * 1000000);
    return microCentoToEuro(pricePerMillionToPriceMicroCent);
}
