function generateDistinctColors(n) {
    const colors = [];
    const goldenRatio = 0.618033988749895;
    let hue = Math.random();

    for (let i = 0; i < n; i++) {
        hue += goldenRatio;
        hue %= 1;
        const saturation = 0.6 + Math.random() * 0.2;
        const lightness = 0.5 + Math.random() * 0.2;
        colors.push(hslToHex(hue * 360, saturation * 100, lightness * 100));
    }
    return colors;
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

const catToHumanYears = [
    { cat: 1, human: 0.1071 }, { cat: 2, human: 0.1548 }, { cat: 3, human: 0.2024 },
    { cat: 4, human: 0.2524 }, { cat: 5, human: 0.253567 }, { cat: 6, human: 0.334933 },
    { cat: 7, human: 0.3762 }, { cat: 8, human: 0.417467 }, { cat: 9, human: 0.458733 },
    { cat: 10, human: 0.5 }, { cat: 11, human: 0.5332 }, { cat: 12, human: 0.5664 },
    { cat: 13, human: 0.5996 }, { cat: 14, human: 0.6328 }, { cat: 15, human: 0.666 },
    { cat: 16, human: 0.777333 }, { cat: 17, human: 0.888667 }, { cat: 18, human: 1.0 },
    { cat: 19, human: 1.166667 }, { cat: 20, human: 1.333333 }, { cat: 21, human: 1.5 },
    { cat: 22, human: 1.666667 }, { cat: 23, human: 1.833333 }, { cat: 24, human: 2.0 },
    { cat: 25, human: 2.181818 }, { cat: 26, human: 2.363636 }, { cat: 27, human: 2.545455 },
    { cat: 28, human: 2.727273 }, { cat: 29, human: 2.909091 }, { cat: 30, human: 3.090909 },
    { cat: 31, human: 3.272727 }, { cat: 32, human: 3.454545 }, { cat: 33, human: 3.636364 },
    { cat: 34, human: 3.818182 }, { cat: 35, human: 4.0 }, { cat: 36, human: 4.285714 },
    { cat: 37, human: 4.571429 }, { cat: 38, human: 4.857143 }, { cat: 39, human: 5.142857 },
    { cat: 40, human: 5.428571 }, { cat: 41, human: 5.714286 }, { cat: 42, human: 6.0 },
    { cat: 43, human: 6.25 }, { cat: 44, human: 6.5 }, { cat: 45, human: 6.75 },
    { cat: 46, human: 7.0 }, { cat: 47, human: 7.25 }, { cat: 48, human: 7.5 },
    { cat: 49, human: 7.75 }, { cat: 50, human: 8.0 }, { cat: 51, human: 8.2 },
    { cat: 52, human: 8.4 }, { cat: 53, human: 8.6 }, { cat: 54, human: 8.8 },
    { cat: 55, human: 9.0 }, { cat: 56, human: 9.2 }, { cat: 57, human: 9.4 },
    { cat: 58, human: 9.6 }, { cat: 59, human: 9.8 }, { cat: 60, human: 10.0 },
    { cat: 61, human: 10.2 }, { cat: 62, human: 10.4 }, { cat: 63, human: 10.6 },
    { cat: 64, human: 10.8 }, { cat: 65, human: 11.0 }, { cat: 66, human: 11.2 },
    { cat: 67, human: 11.4 }, { cat: 68, human: 11.6 }, { cat: 69, human: 11.8 },
    { cat: 70, human: 12.0 }, { cat: 71, human: 12.2 }, { cat: 72, human: 12.4 },
    { cat: 73, human: 12.6 }, { cat: 74, human: 12.8 }, { cat: 75, human: 13.0 },
    { cat: 76, human: 13.2 }, { cat: 77, human: 13.4 }, { cat: 78, human: 13.6 },
    { cat: 79, human: 13.8 }, { cat: 80, human: 14.0 }, { cat: 81, human: 14.5 },
    { cat: 82, human: 15.0 }, { cat: 83, human: 15.5 }, { cat: 84, human: 16.0 }
];

function convertToCatYears(humanYears) {
    for (let i = 0; i < catToHumanYears.length - 1; i++) {
        if (humanYears >= catToHumanYears[i].human && humanYears <= catToHumanYears[i + 1].human) {
            const lower = catToHumanYears[i];
            const upper = catToHumanYears[i + 1];
            const ratio = (humanYears - lower.human) / (upper.human - lower.human);
            return lower.cat + ratio * (upper.cat - lower.cat);
        }
    }

    if (humanYears < catToHumanYears[0].human) {
        return (humanYears / catToHumanYears[0].human) * catToHumanYears[0].cat;
    }

    if (humanYears > catToHumanYears[catToHumanYears.length - 1].human) {
        return catToHumanYears[catToHumanYears.length - 1].cat;
    }

    return humanYears * 18;
}

function convertCatYearsToHuman(catYears) {
    for (let i = 0; i < catToHumanYears.length; i++) {
        if (Math.abs(catToHumanYears[i].cat - catYears) < 0.5) {
            return catToHumanYears[i].human;
        }
    }

    for (let i = 0; i < catToHumanYears.length - 1; i++) {
        if (catYears >= catToHumanYears[i].cat && catYears <= catToHumanYears[i + 1].cat) {
            const lower = catToHumanYears[i];
            const upper = catToHumanYears[i + 1];
            const ratio = (catYears - lower.cat) / (upper.cat - lower.cat);
            return lower.human + ratio * (upper.human - lower.human);
        }
    }

    return catYears / 18;
}