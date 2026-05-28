import { useState, useEffect, useCallback } from "react";
import { getWeightUnit, setWeightUnit, WeightUnit } from "@/lib/storage";

const KG_TO_LBS = 2.20462;

export function useWeightUnit() {
  const [unit, setUnitState] = useState<WeightUnit>("kg");

  useEffect(() => {
    getWeightUnit().then(setUnitState);
  }, []);

  const changeUnit = useCallback(async (newUnit: WeightUnit) => {
    await setWeightUnit(newUnit);
    setUnitState(newUnit);
  }, []);

  const toDisplay = useCallback(
    (kg: number): number => {
      const val = unit === "lbs" ? kg * KG_TO_LBS : kg;
      return Math.round(val * 10) / 10;
    },
    [unit]
  );

  const toKg = useCallback(
    (displayVal: number): number => {
      const kg = unit === "lbs" ? displayVal / KG_TO_LBS : displayVal;
      return Math.round(kg * 10) / 10;
    },
    [unit]
  );

  return { unit, changeUnit, toDisplay, toKg };
}
