// CSVデータを処理する関数
export function processCsvData(xmlObject: any, selectedCsvData: { tag: string; index: number }[]): void {

  // 選択されたCSVデータのタグを抽出
  const tagMap: { [key: string]: string } = {
    "gml:id": "GML ID",
    "gml:posList": "建物の座標",
    "bldg:measuredHeight": "建物の高さ",
    "xAL:LocalityName": "建物の住所",
  };

  // selectedCsvDataの要素をindexの昇順で並べ替える
  selectedCsvData.sort((a, b) => a.index - b.index);

  const tags = selectedCsvData.map(data => data.tag);
  const headerTags = selectedCsvData.map(data => tagMap[data.tag] || data.tag);

  // CSVのヘッダー行を作成
  const rows: string[][] = [headerTags];

  const xmlObj = xmlObject["core:CityModel"]["core:cityObjectMember"];

  // XMLオブジェクトを再帰的にトラバースする関数
  const traverse = (obj: any, tag: string): string | null => {
    if (typeof obj === "object" && obj !== null) {
      // オブジェクトの各キーと値をループで処理
      for (const [key, value] of Object.entries(obj)) {

        if (tag.includes("gml:id") && key === "bldg:Building") {
          if (typeof value === "object" && value !== null && "@_gml:id" in value) {
            return (value as { "@_gml:id": string })["@_gml:id"];
          }
        }

        if (typeof value === "string" && tag===value) {
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

        // 値がオブジェクトである場合、再帰的にtraverse関数を呼び出す
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
      const result = traverse(obj, tag);
      if (result) row.push(result);
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
