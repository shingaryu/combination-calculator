type StrengthRow = {
  index: number,
  strategyId: string,
  species: string,
  originalVector: number[],
  vector: number[],
  strategyType?: string,
  hasBoost?: boolean;
}

export default StrengthRow;