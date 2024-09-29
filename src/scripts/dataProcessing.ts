// src/scripts/dataProcessing.ts
import { traverse, traverseCityGML, matchPairs } from './utilities';
import { XMLBuilder } from "fast-xml-parser";
/**
 * GMLデータを処理し、建物要素を更新します。
 * 
 * @param primaryGml - 処理対象のGMLオブジェクト
 * @param secondaryGml - 追加のGMLオブジェクト
 * @param searchTag1 - 最初の検索文字列
 * @param searchTag2 - 2番目の検索文字列
 * @param updateData - 更新に使用するデータの配列
 */
export async function processGMLData(
  primaryGml: any,
  secondaryGml: any,
  searchTag1: string,
  searchTag2: string,
  updateData: { tag: string; plateauTag: string; attributeName: string }[]
) {
  if (primaryGml && typeof primaryGml === "object") {
    const cityObjectMembers = extractCityObjectMembers(primaryGml);
    const cityGmlResults = cityObjectMembers.map((member: any) =>
      traverseCityGML(member, searchTag1)
    );
    const secondaryGmlResults = await traverse(secondaryGml, searchTag2);
  
    const matchedPairs: any[] = await matchPairs(cityGmlResults, secondaryGmlResults);
       
    if (matchedPairs.length === 0) {
      alert("紐づけできませんでした。適切なペアが見つかりません。");
      return;
    }

    const updatedGml = updateBuildingElements(
      primaryGml,
      matchedPairs,
      updateData
    );

    const options = {
      ignoreAttributes: false,
      format: true,
    };
    const builder = new XMLBuilder(options);
    const xmlContent = builder.build(updatedGml);
    downloadXMLContent(xmlContent, "Result.gml");
  }
}

/**
 * CSV用にGMLデータを処理し、建物要素を更新します。
 * 
 * @param primaryGml - 処理対象のGMLオブジェクト
 * @param secondaryGml - 追加のGMLオブジェクト
 * @param searchTag1 - 最初の検索文字列
 * @param searchTag2 - 2番目の検索文字列
 * @param updateData - 更新に使用するデータの配列
 * @returns 更新されたGMLオブジェクト
 */
export async function processGMLDataForCsv(
  primaryGml: any,
  secondaryGml: any,
  searchTag1: string,
  searchTag2: string,
  updateData: { tag: string; plateauTag: string; attributeName: string }[]
) {
  if (primaryGml && typeof primaryGml === "object") {
    const cityObjectMembers = extractCityObjectMembers(primaryGml);
    const cityGmlResults = cityObjectMembers.map((member: any) =>
      traverseCityGML(member, searchTag1)
    );
    const secondaryGmlResults = await traverse(secondaryGml, searchTag2);

    const matchedPairs: any[] = await matchPairs(cityGmlResults, secondaryGmlResults);

    if (matchedPairs.length === 0) {
      alert("紐づけできませんでした。適切なペアが見つかりません。");
      return;
    }

    const updatedGml = updateBuildingElements(
      primaryGml,
      matchedPairs,
      updateData
    );

    return updatedGml;
  }
}

/**
 * GMLオブジェクトからCityObjectMemberを抽出します。
 * 
 * @param gmlObject - 処理対象のGMLオブジェクト
 * @returns CityObjectMemberの配列
 */
function extractCityObjectMembers(gmlObject: any): any[] {
  const cityObjectMembers: any[] = [];
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
 * @param updateData - 更新に使用するデータの配列
 * @returns 更新されたGMLオブジェクト
 */
function updateBuildingElements(
  gmlObject: any,
  pairs: any[],
  updateData: { tag: string; plateauTag: string; attributeName: string }[]
): any {
  const clonedGmlObject = JSON.parse(JSON.stringify(gmlObject));

  pairs.forEach((pair: any) => {
    const buildingElements = clonedGmlObject["core:CityModel"][
      "core:cityObjectMember"
    ].filter(
      (member: any) =>
        member["bldg:Building"] &&
        member["bldg:Building"]["@_gml:id"] === pair.gmlId
    );

    buildingElements.forEach((buildingElement: any) => {
      updateData.forEach((data) => {
        if (pair.result[data.tag]) {
          if (!buildingElement["bldg:Building"]) {
            buildingElement["bldg:Building"] = {};
          }

          if (!buildingElement["bldg:Building"]["gen:stringAttribute"]) {
            buildingElement["bldg:Building"]["gen:stringAttribute"] = [];
          } else if (!Array.isArray(buildingElement["bldg:Building"]["gen:stringAttribute"])) {
            buildingElement["bldg:Building"]["gen:stringAttribute"] = [buildingElement["bldg:Building"]["gen:stringAttribute"]];
          }

          buildingElement["bldg:Building"]["gen:stringAttribute"].push({
            "@_name": data.attributeName,
            "gen:value": pair.result[data.tag],
          });
        }
      });
    });
  });

  return clonedGmlObject;
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