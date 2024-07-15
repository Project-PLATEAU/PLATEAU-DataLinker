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
  return (
    obj &&
    isObject(obj.result) &&
    obj.result !== null &&
    obj.result.max !== null
  );
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
function getMinMaxOrNull(
  values: number[]
): { min: number; max: number } | null {
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

/**
 * 文字列を数値化し、経緯度のリストを作成します。
 * @param value - 数値を含む文字列
 * @returns [[経度, 緯度], [経度, 緯度], ...]の形の配列
 */
function convertStringToCoordinatePairs(value: string): [number, number][] {
  const numericValues = convertStringToNumericArray(value);
  if (numericValues.length % 3 === 0) {
    const filteredValues = filterEveryThirdValue(numericValues);
    return convertToCoordinatePairs(filteredValues);
  } else {
    return convertToCoordinatePairs(numericValues);
  }
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
    // 文字列がカンマ区切りまたは半角スペース区切りの数値かどうかを判定
    const regex = /^(\d+(\.\d+)?([, ]\d+(\.\d+)?)+)$/;
    if (regex.test(obj[targetKey])) {
      const numericValues = obj[targetKey].split(/[, ]/).map(Number);
      if (numericValues.every((value: number) => !isNaN(value))) {
        // 配列の長さに応じて単一の数値または数値配列を取得
        const primeKey = adjustArrayOrSingleValue(numericValues);
        valuesList.push({ primeKey, result: obj });
      }
    } else {
      // 文字列がクオーテーションで囲まれている場合、クオーテーションを削除
      if (obj[targetKey].includes('"')) {
        obj[targetKey] = obj[targetKey].replace(/"/, "");
      }
      const primeKey = obj[targetKey].split(/[, ]+/);
      valuesList.push({ primeKey, result: obj });
    }
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
  let result: any;

  // オブジェクトでない場合は初期値を返す
  if (!isObject(obj)) {
    return { result: 0, gmlId };
  }

  // "bldg:Building"キーが存在する場合��gmlIdを取得
  if (obj["bldg:Building"]) {
    gmlId = obj["bldg:Building"]["@_gml:id"];
  }

  // GML ID
  if (targetKey === "gml:id" && obj["bldg:Building"]) {
    result = obj["bldg:Building"]["@_gml:id"];
    return { result, gmlId };
  }

  // 建物の高さ
  if (targetKey === "bldg:measuredHeight" && obj["bldg:measuredHeight"]) {
    result = obj["bldg:measuredHeight"]["#text"];
    return { result, gmlId };
  }

  // 建物の住所
  if (targetKey === "xAL:LocalityName" && obj.hasOwnProperty(targetKey)) {
    result = obj["xAL:LocalityName"]["#text"];
    return { result, gmlId };
  }

  if (obj["@_name"] === targetKey) {
    result = obj["gen:value"];
    return { result, gmlId };
  }

  // targetKeyが存在し、その値が文字列の場合
  if (obj.hasOwnProperty(targetKey) && typeof obj[targetKey] === "string") {
    // targetKeyがgml:posListの場合の処理
    if (targetKey === "gml:posList") {
      // 文字列から数値ペアの合計を計算
      result = convertStringToCoordinatePairs(obj[targetKey]);

      // const sumList = calculateSumOfNumericPairsFromString(obj[targetKey]);
      // // 最小値と最大値を取得
      // result = getMinMaxOrNull(sumList);
    } else {
      console.log(obj[targetKey]);
    }

    return { result, gmlId };
  }

  // オブジェクトの各値を再帰的に処理
  for (const value of Object.values(obj)) {
    if (isObject(value)) {
      // 子オブジェクトの結果を取得
      const { result, gmlId: innerGmlId } = traverseCityGML(value, targetKey);
      // 結果が初期値でない場合、結果を返す
      if (result !== 0) {
        return { gmlId: innerGmlId || gmlId, result };
      }
    }
  }

  // 初期値を返す
  return { result: 0, gmlId };
}

/**
 * traverse関数の結果とmatchingValuesのペアをマッチングします。
 * @param traverseResults - traverse関数の結果
 * @param matchingValues - マッチングする値の配列
 * @returns マッチングされたペアの配列
 */
export function matchPairs(
  traverseResults: any[],
  matchingValues: any[]
): any[] {
  const pairs: any[] = [];

  if (
    traverseResults.every(
      (obj: any) => obj.gmlId === null || obj.result === null
    ) ||
    matchingValues.every((mv: any) => mv.primeKey === null)
  ) {
    console.error("すべての値がnullです。");
    return [];
  }

  traverseResults.forEach((obj: any) => {
    // if (!isValidTraverseResult(obj)) {
    //   console.log(obj);
    //   console.error("traverseResultsの要素が不正です。");
    //   return;
    // }

    matchingValues.forEach((mv: any) => {
      if (!isValidAverageValue(mv)) {
        console.error("matchingValuesの要素が不正です。");
        return;
      }
      if (typeof obj.result !== "object") {
        if (mv.primeKey === obj.result) {
          pairs.push({ gmlId: obj.gmlId, result: mv.result });
        }
      } else if (typeof obj.result === "object") {
        if (isPointInPolygon(mv.primeKey, obj.result)) {
          pairs.push({ gmlId: obj.gmlId, result: mv.result });
        }
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
 * 数値配列のペア合計を計算します。
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

/**
 * 数値配列を[[経度, 緯度], [経度, 緯度], ...]の形に変換します。
 * @param values - 数値配列
 * @returns [[経度, 緯度], [経度, 緯度], ...]の形の配列
 */
function convertToCoordinatePairs(values: number[]): [number, number][] {
  const coordinatePairs: [number, number][] = [];
  for (let i = 0; i < values.length; i += 2) {
    if (values[i + 1] !== undefined) {
      coordinatePairs.push([values[i], values[i + 1]]);
    }
  }
  return coordinatePairs;
}

/**
 * 多角形の中���特定の点が含まれているかを判定します。（いわゆる交差数判定
 * @param point - 判定する点 [経度, 緯度]
 * @param polygon - 多角形を構成する点のリスト [[経度, 緯度], [経度, 緯度], ...]
 * @returns 点が多角形の中に含まれている場合はtrue、そうでない場合はfalse
 */
function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  let isInside = false; // 点が多角形の内部にあるかどうかを示すフラグ
  const [x, y] = point; // 判定する点の座標を分割代入

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]; // 現在の頂点の座標
    const [xj, yj] = polygon[j]; // 前の頂点の座標
    // 点が多角形の辺を横切るかどうかを判定
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) isInside = !isInside; // 横切る場合、フラグを反転
  }
  // console.log(isInside);
  return isInside; // 点が多角形の内部にある場合はtrueを返す
}
