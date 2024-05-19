// このファイルには、アプリケーション全体で再利用可能なユーティリティ関数が含まれています。

// ヘルパー関数

/**
 * 値がオブジェクトかどうかを判定します。
 * @param value - 判定する値
 * @returns オブジェクトであれば true、それ以外は false
 */
function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

/**
 * 配列内に null 値を持つオブジェクトが含まれているかを判定します。
 * @param array - 判定する配列
 * @returns null 値が含まれていれば true、それ以外は false
 */
function hasNullValues(array: any[]): boolean {
  return array.some((obj: any) => obj.gmlId === null || obj.result === null);
}

/**
 * traverse 関数の結果が有効かどうかを判定します。
 * @param obj - 判定するオブジェクト
 * @returns 有効であれば true、それ以外は false
 */
function isValidTraverseResult(obj: any): boolean {
  return obj && isObject(obj.result) && obj.result !== null && obj.result.max !== null;
}

/**
 * matchingValues の要素が有効かどうかを判定します。
 * @param mv - 判定するオブジェクト
 * @returns 有効であれば true、それ以外は false
 */
function isValidAverageValue(mv: any): boolean {
  return mv && mv.primeKey !== null;
}

/**
 * 値が指定された範囲内にあるかどうかを判定します。
 * @param value - 判定する値
 * @param min - 範囲の最小値
 * @param max - 範囲の最大値
 * @returns 範囲内であれば true、それ以外は false
 */
function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 数値配列から最小値と最大値を取得します。配列の長さが2未満の場合は null を返します。
 * @param values - 数値配列
 * @returns 最小値と最大値のオブジェクト、または null
 */
function getMinMaxOrNull(values: number[]): { min: number; max: number } | null {
  return values.length >= 2 ? getMinMaxValues(values) : null;
}

/**
 * 配列の長さが1の場合、その要素を返します。それ以外の場合は配列をそのまま返します。
 * @param values - 数値配列
 * @returns 単一の数値または数値配列
 */
function adjustArrayOrSingleValue(values: number[]): number | number[] {
  return values.length === 1 ? values[0] : values;
}

/**
 * 文字列から数値ペアの合計を計算します。
 * @param value - 数値を含む文字列
 * @returns 数値ペアの合計を含む配列
 */
function calculateSumOfNumericPairsFromString(value: string): number[] {
  const numericValues = convertStringToNumericArray(value);
  return calculateSumPairs(numericValues);
}

// メイン関数
/**
 * オブジェクトを再帰的にトラバースし、指定されたキーを持つオブジェクトを収集します。
 * @param obj - トラバースするオブジェクト
 * @param targetKey - 収集するキー
 * @returns 収集されたオブジェクトの配列
 */
export function traverse(obj: any, targetKey: string): any[] {
  // 結果を格納する配列を初期化
  let valuesList: any[] = [];

  // オブジェクトでない場合は空の配列を返す
  if (!isObject(obj)) {
    return valuesList;
  }

  // objがtargetKeyを持ち、その値が配列の場合
  if (obj.hasOwnProperty(targetKey) && Array.isArray(obj[targetKey])) {

    // 配列の各要素に対して数値ペアの合計を計算
    const sumList = calculateSumPairs(obj[targetKey]);
    // 各配列の長さに応じて単一の数値または数値配列を取得
    const primeKey = adjustArrayOrSingleValue(sumList);
    // 結果をvaluesListに追加
    valuesList.push({ primeKey, result: obj });
  }

  
  // オブジェクトがtargetKeyを持ち、その値が文字列の場合
  if (obj.hasOwnProperty(targetKey) && typeof obj[targetKey] === "string") {
    // 文字列から数値ペアの合計を計算
    const sumList = calculateSumOfNumericPairsFromString(obj[targetKey]);
    // 配列の長さに応じて単一の数値または数値配列を取得
    const primeKey = adjustArrayOrSingleValue(sumList);

    // 結果をvaluesListに追加
    valuesList.push({ primeKey, result: obj });
  }

  // オブジェクトの各値を再帰的に処理
  Object.values(obj).forEach((value) => {
    if (isObject(value)) {
      // 子オブジェクトの結果を取得し、valuesListに追加
      const childValues = traverse(value, targetKey);
      valuesList.push(...childValues);
    }
  });

  // 結果を返す
  return valuesList;
}

/**
 * CityGMLオブジェクトを再帰的にトラバースし、指定されたキーを持つオブジェクトを収集します。
 * @param obj - トラバースするオブジェクト
 * @param targetKey - 収集するキー
 * @returns 収集されたオブジェクトとGML IDのオブジェクト
 */
export function traverseCityGML(
  obj: any,
  targetKey: string
): { result: any; gmlId: string | null } {
  let gmlId: string | null = null;

  if (!isObject(obj)) {
    return { result: 0, gmlId };
  }

  if (obj["bldg:Building"]) {
    gmlId = obj["bldg:Building"]["@_gml:id"];
  }

  if (obj.hasOwnProperty(targetKey) && typeof obj[targetKey] === "string") {
    const sumList = calculateSumOfNumericPairsFromString(obj[targetKey]);
    const result = getMinMaxOrNull(sumList);
    return { result, gmlId };
  }

  for (const value of Object.values(obj)) {
    if (isObject(value)) {
      const { result, gmlId: innerGmlId } = traverseCityGML(value, targetKey);
      if (result !== 0) {
        return { gmlId: innerGmlId || gmlId, result };
      }
    }
  }

  return { result: 0, gmlId };
}

/**
 * traverse関数の結果とmatchingValuesのペアをマッチングします。
 * @param traverseResults - traverse関数の結果
 * @param matchingValues - マッチングする値の配列
 * @returns マッチングされたペアの配列
 */
export function matchPairs(traverseResults: any[], matchingValues: any[]): any[] {
  const pairs: any[] = [];
  
  if (hasNullValues(traverseResults) || hasNullValues(matchingValues)) {
    console.error("null値が含まれています。");
    return [];
  }

  traverseResults.forEach((obj: any) => {
    if (!isValidTraverseResult(obj)) {
      console.error("traverseResultsの要素が不正です。");
      return;
    }

    matchingValues.forEach((mv: any) => {
      if (!isValidAverageValue(mv)) {
        console.error("matchingValuesの要素が不正です。");
        return;
      }

      if (isWithinRange(mv.primeKey, obj.result.min, obj.result.max)) {
        pairs.push({ gmlId: obj.gmlId, result: mv.result });
      }
    });
  });

  return pairs;
}

/**
 * 数値配列から最小値と最大値を取得します。
 * @param values - 数値配列
 * @returns 最小値と最大値のオブジェクト
 */
function getMinMaxValues(values: number[]): { min: number; max: number } {
  return { min: Math.min(...values), max: Math.max(...values) };
}

/**
 * 配列から3番目以降の要素を削除します。
 * @param values - 配列
 * @returns 新しい配列
 */
function filterEveryThirdValue(values: number[]): number[] {
  return values.filter((_, index) => (index + 1) % 3 !== 0);
}

/**
 * 数値配列のペアの合計を計算します。
 * @param values - 数値配列
 * @returns 合計を含む配列
 */
function calculateSumForValuePairs(values: number[]): number[] {
  const sumPairs = [];
  for (let i = 0; i < values.length; i += 2) {
    if (values[i + 1] !== undefined) {
      sumPairs.push(values[i] + values[i + 1]);
    }
  }
  return sumPairs;
}

/**
 * 文字列を数値配列に変換します。
 * @param value - 文字列
 * @returns 数値配列
 */
function convertStringToNumericArray(value: string): number[] {
  return value.split(/[\s,]+/).map(parseFloat);
}

/**
 * 数値配列のペアの合計を計算します。
 * @param numericValues - 数値配列
 * @returns 合計を含む配列
 */
function calculateSumPairs(numericValues: number[]): number[] {
  const isDivisibleByThree = numericValues.length % 3 === 0;
  const valuesToSum = isDivisibleByThree
    ? filterEveryThirdValue(numericValues)
    : numericValues;
  return calculateSumForValuePairs(valuesToSum);
}
