import StrengthRow from "./StrengthRow";

export function addVectors(...vectors: number[][]) {
  const length = vectors[0].length;
  for (let i = 0; i < vectors.length; i++) {
    if (length !== vectors[i].length) {
      throw new Error('the number of elements is not same');
    }
    
  }

  const newVec = [];
  for (let i = 0; i < length; i++) {
    let elementsSum = 0;
    for (let j = 0; j < vectors.length; j++) {
      elementsSum += vectors[j][i];
    }
    newVec.push(elementsSum);
  } 

  return newVec;
}

export function addVector(vector1: number[], vector2: number[]) {
  if (vector1.length !== vector2.length) {
    throw new Error('the number of elements is not same');
  }

  const newVec = [];
  for (let i = 0; i < vector1.length; i++) {
    newVec.push(vector1[i] + vector2[i]);
  } 

  return newVec;
}

export function cosineSimilarity(v1: number[], v2: number[]) {
  return dotProduct(v1, v2) / (l2norm(v1) * l2norm(v2));
}

export function dotProduct(vector1: number[], vector2: number[]) {
  if (vector1.length !== vector2.length) {
    throw new Error('the number of elements is not same');
  }

  let sum = 0;
  for (let i = 0; i < vector1.length; i++) {
    sum += vector1[i] * vector2[i];
  }

  return sum;
}

export function l2norm(vector: number[]) {
  let sum = 0;
  vector.forEach(x => {
    sum += x * x;
  });

  sum = Math.sqrt(sum);
  return sum;
}

export function compatibleTypes(strategyType: string) {
  let compatibleTypes: string[] = [];

  if (strategyType === 'Sweeper') {
    compatibleTypes = ['Sweeper', 'Tank'];
  } else if (strategyType === 'Tank') {
    compatibleTypes = ['Sweeper', 'Tank', 'Wall'];
  } else if (strategyType === 'Wall') {
    compatibleTypes = ['Tank', 'Wall'];
  }

  return compatibleTypes;
}

export function filterStrengthRows(acceptableTypes: string[], strengthRows: StrengthRow[]) {
  return strengthRows.filter(x => x.strategyType && acceptableTypes.indexOf(x.strategyType) >= 0);
}
