// src/scripts/dataProcessing.ts
import { traverse, traverseCityGML, matchPairs } from './utilities';
import { XMLBuilder } from "fast-xml-parser";
/**
 * GMLデータを処理し、建物要素を更新します。
 * 
 * @param gmlObject - 処理対象のGMLオブジェクト
 * @param gmlObject2 - 追加のGMLオブジェクト
 * @param str1 - 最初の検索文字列
 * @param str2 - 2番目の検索文字列
 * @param selectedData - 更新に使用するデータの配列
 */
export function processGMLData(
  gmlObject: any,
  gmlObject2: any,
  str1: string,
  str2: string,
  selectedData: { tag: string; plateauTag: string; attributeName: string }[]
) {

  if (gmlObject && typeof gmlObject === "object") {

    const cityObjectMembers = extractCityObjectMembers(gmlObject);


    const traverseCityGmlResults = cityObjectMembers.map((member: any) =>
      traverseCityGML(member, str1)
    );

    let traverseResults = traverse(gmlObject2, str2);
    console.log(traverseResults);
    
    const pairs = matchPairs(traverseCityGmlResults, traverseResults);


    if (pairs.length === 0) {
      alert("紐づけできませんでした。適切なペアが見つかりません。");
      return;
    }

    // gmlObjectの建物要素を更新する
    const updatedGmlObject = updateBuildingElements(
      gmlObject,
      pairs,
      selectedData
    );

    // console.log(updatedGmlObject["core:CityModel"]["core:cityObjectMember"]);

    const options = {
      ignoreAttributes: false,
      format: true,
    };
    
    const builder = new XMLBuilder(options);

    const xmlContent = builder.build(updatedGmlObject);
    downloadXMLContent(xmlContent, "Result.gml");

  }
}

export function processGMLDataforCsv(
  gmlObject: any,
  gmlObject2: any,
  str1: string,
  str2: string,
  selectedData: { tag: string; plateauTag: string; attributeName: string }[]
) {

  if (gmlObject && typeof gmlObject === "object") {

    const cityObjectMembers = extractCityObjectMembers(gmlObject);


    const traverseCityGmlResults = cityObjectMembers.map((member: any) =>
      traverseCityGML(member, str1)
    );


    let traverseResults = traverse(gmlObject2, str2);
    
    const pairs = matchPairs(traverseCityGmlResults, traverseResults);

    if (pairs.length === 0) {
      alert("紐づけできませんでした。適切なペアが見つかりません。");
      return;
    }

    // gmlObjectの建物要素を更新する
    const updatedGmlObject = updateBuildingElements(
      gmlObject,
      pairs,
      selectedData
    );

    return updatedGmlObject;

  }
}



/**
 * GMLオブジェクトからCityObjectMemberを抽出します。
 * 
 * @param gmlObject - 処理対象のGMLオブジェクト
 * @returns CityObjectMemberの配列
 */
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

/**
 * 建物要素を更新します。
 * 
 * @param gmlObject - 元のGMLオブジェクト
 * @param pairs - 紐づけられたペアの配列
 * @param selectedData - 更新に使用するデータの配列
 * @returns 更新されたGMLオブジェクト
 */
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
    // 各建物要素に対して処理を行う
    buildingElements.forEach((buildingElement: any) => {
      // 選択されたデータの配列をループ
      selectedData.forEach((data) => {

        
        // ペアの結果にデータタグが存在するか確認
if (pair.result[data.tag]) {
  // bldg:Buildingオブジェクトが存在するか確認
  if (!buildingElement["bldg:Building"]) {
    buildingElement["bldg:Building"] = {};
  }

  // gen:stringAttributeが存在しない場合は初期化
  if (!buildingElement["bldg:Building"]["gen:stringAttribute"]) {
    buildingElement["bldg:Building"]["gen:stringAttribute"] = [];
  } else if (!Array.isArray(buildingElement["bldg:Building"]["gen:stringAttribute"])) {
    // gen:stringAttributeが配列でない場合、既存のデータを保持したまま配列に変換
    buildingElement["bldg:Building"]["gen:stringAttribute"] = [buildingElement["bldg:Building"]["gen:stringAttribute"]];
  }

  // 建物要素の指定されたPLATEAUタグに新しい属性を追加
  buildingElement["bldg:Building"]["gen:stringAttribute"].push({
    "@_name": data.attributeName, // 属性名を設定
    "gen:value": pair.result[data.tag], // ペアの結果から値を設定
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
