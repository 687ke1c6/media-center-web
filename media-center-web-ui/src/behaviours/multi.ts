export const multi = (...behaviours: Array<(el: HTMLElement) => void>) =>
    (el: HTMLElement) => 
        behaviours.forEach(beh => beh(el));