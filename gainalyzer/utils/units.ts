export type Unit = "kg" | "lbs";

// Constant conversion factors
const KG_TO_LBS = 2.20462262185;
const LBS_TO_KG = 1 / KG_TO_LBS;

/**
 * Convert a weight value between kg and lbs.
 * Expects `value` to be in `fromUnit`, returns value in `toUnit`.
 */
export function convertWeight(value: number, fromUnit: Unit, toUnit: Unit): number {
    if (fromUnit === toUnit) return value;

    return fromUnit === "kg"
        ? value * KG_TO_LBS // kg → lbs
        : value * LBS_TO_KG; // lbs → kg
}

/**
 * Format weight to a readable string with units.
 */
export function formatWeight(value: number, unit: Unit): string {
    const rounded = Math.round(value * 100) / 100; // 2 decimal rounding
    return `${rounded} ${unit}`;
}

// new ones

export function lbsToKg(lbs: number): number {
    return +(lbs * 0.45359237).toFixed(1);
}

export function kgToLbs(kg: number): number {
    return +(kg / 0.45359237).toFixed(1);
}

// Display weight in user's preferred units
export function convertForDisplay(valueInLbs: number, units: "lbs" | "kg") {
    return units === "kg" ? lbsToKg(valueInLbs) : valueInLbs;
}

// Convert weight back to lbs before saving
export function convertForSaving(value: number, units: "lbs" | "kg") {
    return units === "kg" ? kgToLbs(value) : value;
}

