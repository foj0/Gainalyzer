import { useMemo } from "react";
import { Unit, convertWeight, formatWeight } from "@/utils/units";

interface UseUserUnitsOptions {
    preferredUnit: Unit; // The unit user selected in profile settings
    storageUnit?: Unit; // The canonical DB storage unit (default: kg)
}

export function useUserUnits({ preferredUnit, storageUnit = "kg" }: UseUserUnitsOptions) {
    return useMemo(() => {
        return {
            preferredUnit,

            // Value stored in DB → shown to user
            toUserUnit(dbValue: number): number {
                return convertWeight(dbValue, storageUnit, preferredUnit);
            },

            // Value user enters → convert to DB storage unit
            toStorageUnit(userValue: number): number {
                return convertWeight(userValue, preferredUnit, storageUnit);
            },

            // Format for display
            format(valueInDbUnits: number): string {
                const val = convertWeight(valueInDbUnits, storageUnit, preferredUnit);
                return formatWeight(val, preferredUnit);
            },
        };
    }, [preferredUnit, storageUnit]);
}

