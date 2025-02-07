export default function min(values) {
    return Math.min(...values);

}

export default function max(values) {
    return Math.max(...values);
}

export default function between(value, bounds, inclusive = false) {
    const low = min(bounds);
    const high = max(bounds);
    
    if (inclusive) {
        return value >= low && value <= high;
    }

    return value > low && value < high;
}
