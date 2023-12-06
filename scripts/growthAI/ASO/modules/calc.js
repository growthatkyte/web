// calc.js

export function zScore(value, mean, stdDev) {
    return (value - mean) / stdDev;
}

export function iScore(min, max, value) {
    return (value - min) / (max - min);
}

export function izScore(max, index) {
    return 1 - (index / max);
}

export function aggregate(weights, scores) {
    const weightedSum = scores.reduce((acc, score, i) => acc + score * weights[i], 0);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    return weightedSum / totalWeight;
}
