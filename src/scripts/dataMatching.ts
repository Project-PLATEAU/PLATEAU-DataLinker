import { XMLBuilder } from "fast-xml-parser";

const options = {
  ignoreAttributes: false,
  format: true,
};
const builder = new XMLBuilder(options);

// 2つのGMLオブジェクトと2つの文字列を引数に取り、特定の処理を行う関数
export function processGMLData(
  gmlObject: any,
  gmlObject2: any,
  str1: string,
  str2: string,
  selectedData: { tag: string; plateauTag: string; attributeName: string }[]
) {
  if (gmlObject && typeof gmlObject === "object") {
    const cityObjectMembers = extractCityObjectMembers(gmlObject);
    const traverseResults = cityObjectMembers.map((member: any) =>
      traverseCityGML(member, str1)
    );

    let averageValue2 = traverse(gmlObject2, str2);

    const pairs = matchPairs(traverseResults, averageValue2);
    if (pairs.length === 0) {
      alert("紐づけできませんでした。適切なペアが見つかりません。");
      return;
    }


    // gmlObjectの建物要素を更新する
    const updatedGmlObject = updateBuildingElements(gmlObject, pairs, selectedData);


    // downloadXMLContent(builder.build(updatedGmlObject), "testResult.gml");
  }
}

function extractCityObjectMembers(gmlObject: any): any[] {
  const cityObjectMembers: any = [];
  if (
    gmlObject["core:CityModel"] &&
    Array.isArray(gmlObject["core:CityModel"]["core:cityObjectMember"])
  ) {
    gmlObject["core:CityModel"]["core:cityObjectMember"].forEach(
      (member: any) => {
        cityObjectMembers.push(member);
      }
    );
  }
  return cityObjectMembers;
}

function matchPairs(traverseResults: any[], averageValue2: any[]): any[] {
  // 結果のペアを格納するための配列を初期化
  const pairs: any[] = [];

  // traverseResultsとaverageValue2の要素のgmlIdとresultがnullでないかをチェック
  if (
    traverseResults.some(
      (obj: any) => obj.gmlId === null || obj.result === null
    ) ||
    averageValue2.some((av2: any) => av2.gmlId === null || av2.result === null)
  ) {
    console.error("null値が含まれています。");
    return [];
  }

  // traverseResultsの各要素に対して処理を行う
  traverseResults.forEach((obj: any) => {
    if (
      !obj ||
      typeof obj.result !== "object" ||
      obj.result === null ||
      obj.result.max === null
    ) {
      console.error("traverseResults���要素が不正です。");
      return;
    }
    // averageValue2の各要素に対して処理を行う
    averageValue2.forEach((av2: any) => {
      if (!av2 || av2.primeKey === null) {
        console.error("averageValue2の要素が不正です。");
        return;
      }
      // av2のprimeKeyがobjのresultのminとmaxの範囲内にあるかをチェック
      if (av2.primeKey >= obj.result.min && av2.primeKey <= obj.result.max) {
        // 条件を満たす場合、ペアをpairs配列に追加
        pairs.push({ gmlId: obj.gmlId, result: av2.result });
      }
    });
  });
  // 作成したペアの配列を返す

  return pairs;
}

function updateBuildingElements(
  gmlObject: any,
  pairs: any[],
  selectedData: { tag: string; plateauTag: string; attributeName: string }[]
): any {
  // gmlObjectのディープコピーを作成
  const clonedGmlObject = JSON.parse(JSON.stringify(gmlObject));

  // pairs配列をループして各ペアに対する処理を行う
  pairs.forEach((pair: any) => {
    // clonedGmlObjectから建物要素を抽出
    const buildingElements = clonedGmlObject["core:CityModel"][
      "core:cityObjectMember"
    ].filter(
      (member: any) =>
        member["bldg:Building"] &&
        member["bldg:Building"]["@_gml:id"] === pair.gmlId
    );

    // 抽出した建物要素に対して処理を行う
    buildingElements.forEach((buildingElement: any) => {
      selectedData.forEach((data) => {
        if (pair.result[data.tag]) {
          buildingElement["bldg:Building"]["gen:stringAttribute"].push({
            "@_name": data.attributeName,
            "gen:value": pair.result[data.tag]
          });
        }
      });
    });
  });

  return clonedGmlObject; // 変更を加えた複製オブジェクトを返す
}

function downloadXMLContent(xmlContent: string, fileName: string): void {
  const blob = new Blob([xmlContent], { type: "text/xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// オブジェクト内を再帰的に探索し、特定のキーに対応する値を処理する関数
function traverse(obj: any, targetKey: string): any[] {
  let valuesList: any[] = []; // 値を格納するためのリストを初期化

  // オブジェクトがnullまたはオブジェクト型でない場合は、空のリストを返す
  if (typeof obj !== "object" || obj === null) {
    return valuesList;
  }

  // 目的のキーが現在のオブジェクトに存在する場合は、その値をリストに追加
  if (obj.hasOwnProperty(targetKey) && typeof obj[targetKey] === "string") {
    const sumList = calculateSumOfNumericPairsFromString(obj[targetKey]);
    const primeKey = adjustArrayOrSingleValue(sumList);

    valuesList.push({
      primeKey: primeKey,
      result: obj,
    });
  }

  // オブジェクトの各プロパティに対して再帰的に探索を行う
  Object.values(obj).forEach((value) => {
    if (typeof value === "object") {
      const childValues = traverse(value, targetKey);
      childValues.forEach((childValue) => {
        valuesList.push({
          primeKey: childValue.primeKey,
          result: childValue.result,
        });
      });
    }
  });

  return valuesList; // 最終的に収集した値のリストを返す
}

function traverseCityGML(
  obj: any,
  targetKey: string
): { result: any; gmlId: string | null } {
  let gmlId: string | null = null; // gmlIdを初期化
  if (typeof obj !== "object" || obj === null) {
    return { result: 0, gmlId: gmlId }; // オブジェクトでない場合は0を返す
  }
  // bldg:Buildingのgml:idを取得
  if (obj["bldg:Building"]) {
    gmlId = obj["bldg:Building"]["@_gml:id"];
  }
  // CityGMLの特定の属性を探索するための条件を追加
  if (obj.hasOwnProperty(targetKey) && typeof obj[targetKey] === "string") {
    const sumList = calculateSumOfNumericPairsFromString(obj[targetKey]);
    const result = getMinMaxOrNull(sumList);
    return {
      result: result,
      gmlId: gmlId,
    }; // 目的のキーが見つかった場合はその値を処理
  }
  // CityGMLの階層構造を考慮して再帰的に探索
  for (const value of Object.values(obj)) {
    if (typeof value === "object") {
      const { result, gmlId: innerGmlId } = traverseCityGML(value, targetKey);
      if (result !== 0) {
        return {
          gmlId: innerGmlId || gmlId,
          result: result,
        }; // 再帰的に探索し、0以外の値が見つかった場合はその値を返す
      }
    }
  }

  return { result: 0, gmlId: gmlId }; // 対象のキーが見つからなかった場合は0を返す
}

// 配列の長さに応じて最小値と最大値を返すか、nullを返す関数
function getMinMaxOrNull(
  values: number[]
): { min: number; max: number } | null {
  return values.length >= 2 ? getMinMaxValues(values) : null;
}

// 配列の長さに応じて単一の値または配列を返す関数
function adjustArrayOrSingleValue(values: number[]): number | number[] {
  return values.length <= 1
    ? values.length === 1
      ? values[0]
      : values
    : values;
}

// 文字列から数値のペアの合計を計算する関数
function calculateSumOfNumericPairsFromString(value: string): number[] {
  const numericValues = convertStringToNumericArray(value);
  return calculateSumPairs(numericValues);
}

// 文字列を数値の配列に変換する関数
function convertStringToNumericArray(value: string): number[] {
  return value.split(/[\s,]+/).map(parseFloat);
}

// 数値配���からペアの合計を計算する関数
function calculateSumPairs(numericValues: number[]): number[] {
  const isDivisibleByThree = numericValues.length % 3 === 0;
  const valuesToSum = isDivisibleByThree
    ? filterEveryThirdValue(numericValues)
    : numericValues;
  return calculateSumForValuePairs(valuesToSum);
}

// 配列から最大値と最小値を取得する関数
function getMinMaxValues(values: number[]): { min: number; max: number } {
  return { min: Math.min(...values), max: Math.max(...values) };
}

// 3つごとの値をフィルタリングする関数
function filterEveryThirdValue(values: number[]): number[] {
  return values.filter((_, index) => (index + 1) % 3 !== 0);
}

// 値のペアごとに合計を計算する関数
function calculateSumForValuePairs(values: number[]): number[] {
  const sumPairs = [];
  for (let i = 0; i < values.length; i += 2) {
    if (values[i + 1] !== undefined) {
      sumPairs.push(values[i] + values[i + 1]);
    }
  }
  return sumPairs;
}
