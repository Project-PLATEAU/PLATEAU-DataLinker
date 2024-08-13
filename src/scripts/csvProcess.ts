import tagTranslations from "../constants/tagTranslations";


const trans = (tag: string): string => {
  if(tag.includes("　@_")) {
    const splitTag = tag.split("　@_");
    const key = splitTag[0];
    const translationKey = tagTranslations[key];
    if(tagTranslations[key] === undefined) {
      return tag;
    }
    const value = translationKey + "　" + splitTag[1];

    return value;
  } else {

    return tagTranslations[tag];
  }
}

// CSVデータを処理する関数
export function processCsvData(xmlObject: any, selectedCsvData: { tag: string; index: number }[]): void {

  // selectedCsvDataの要素をindexの昇順で並べ替える
  selectedCsvData.sort((a, b) => a.index - b.index);

  const tags = selectedCsvData.map(data => data.tag);
  const headerTags = selectedCsvData.map(data => trans(data.tag) || data.tag);


  // CSVのヘッダー行を作成
  const rows: string[][] = [headerTags];
  
  const xmlObj = xmlObject["core:CityModel"]["core:cityObjectMember"];

  // XMLオブジェクトを再帰的にトラバースする関数
  const traverse = (obj: any, tag: string): string | null => {
    if (typeof obj === "object" && obj !== null) {
      // オブジェクトの各キーと値をループで処理
      for (let [key, value] of Object.entries(obj)) {

        // タグが一致する場合、その値を返す
        if (key === tag) {
          if(value === 0) {
            value = "0";
          }
          return (value as string);
        }

        // 既存の処理
        if (tag.includes("gml:id") && key === "bldg:Building") {
          if (typeof value === "object" && value !== null && "@_gml:id" in value) {
            return (value as { "@_gml:id": string })["@_gml:id"];
          }
        }

        // コードスペースがある場合
        if (tag.includes("@_") && Object.prototype.hasOwnProperty.call(value, "@_codeSpace")) {
          const splitTag = tag.split("=");
          const key = splitTag[1];
          const strictValue = value as { "#text": string , "@_codeSpace": string };
          if (strictValue["@_codeSpace"] === key) {
            return strictValue["#text"];
          }
        }

        if (tag.includes("@_") && Object.prototype.hasOwnProperty.call(value, "@_uom")) {
          const splitTag = tag.split("=");
          const key = splitTag[1];
          const strictValue = value as { "#text": string , "@_uom": string };
          if (strictValue["@_uom"] === key) {
            return strictValue["#text"];
          }
        }

        if (typeof value === "string" && tag === value) {
          return obj["gen:value"] as string;
        }

        // キーが選択されたタグに含まれている場合
        if (typeof value === "object" && tag === key) {  
                  
          // 現在の行に値を追加
          return (value as { [key: string]: any })["#text"];
        }

        if ("gml:posList" === tag && key === "bldg:lod0RoofEdge") {
          return obj["bldg:lod0RoofEdge"]["gml:MultiSurface"]["gml:surfaceMember"]["gml:Polygon"]["gml:exterior"]["gml:LinearRing"]["gml:posList"];
        }

        // 再帰的にtraverse関数を呼び出す
        if (typeof value === "object") {
          const result = traverse(value, tag);
          if (result) return result;
        }
      }
    }
    return null;
  };

  for (const obj of xmlObj) {
    const row: string[] = [];
    for (const tag of tags) {
      let result = traverse(obj, tag);
      if (tag === "uro:realEstateIDOfLand" && Array.isArray(result)) {
        result = result.join(" ");
      }
      row.push(result !== null ? result : ""); // 値がnullの場合は空白を追加
    }
    rows.push(row);
  }

  // CSVコンテンツを生成
  const csvContent = rows.map(e => e.join(",")).join("\n");
  // CSVコンテンツをダウンロードする関数を呼び出す
  downloadCsvContent(csvContent, "Result.csv");
}

// CSVコンテンツをダウンロードする関数
function downloadCsvContent(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}