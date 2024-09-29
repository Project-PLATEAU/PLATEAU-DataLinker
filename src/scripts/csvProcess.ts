import tagTranslations from "../constants/tagTranslations";

/**
 * タグを翻訳する関数
 * @param {string} tag - 翻訳するタグ
 * @returns {string} 翻訳されたタグ
 */
const translateTag = (tag: string): string => {
  // タグに "　@_" が含まれているかチェック
  if (tag.includes("　@_")) {
    // タグを "　@_" で分割
    const [key, suffix] = tag.split("　@_");
    // キーに対応する翻訳を取得
    const translationKey = tagTranslations[key];
    // 翻訳が見つからない場合は元のタグを返す
    if (translationKey === undefined) {
      return tag;
    }
    // 翻訳されたキーとサフィックスを結合して返す
    return `${translationKey}　${suffix}`;
  } else {
    // "　@_" が含まれていない場合は、タグ全体を翻訳するか元のタグを返す
    return tagTranslations[tag] || tag;
  }
};

/**
 * CSVコンテンツをダウンロードする関数
 * @param {string} csvContent - CSVコンテンツ
 * @param {string} fileName - ダウンロードするファイルの名前
 */
function downloadCsvContent(csvContent: string, fileName: string): void {
  // CSVコンテンツからBlobオブジェクトを作成
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  // ダウンロード用のリンク要素を作成
  const link = document.createElement("a");
  // BlobオブジェクトからURLを生成し、リンクのhref属性に設定
  link.href = URL.createObjectURL(blob);
  // ダウンロードするファイル名を設定
  link.download = fileName;
  // リンク要素をDOMに追加
  document.body.appendChild(link);
  // プログラムによるクリックイベントを発生させ、ダウンロードを開始
  link.click();
  // 不要になったリンク要素をDOMから削除
  document.body.removeChild(link);
}

/**
 * XMLオブジェクトを反復的にトラバースする関数
 * @param {Object} xmlObject - XMLオブジェクト
 * @param {string} tag - 検索するタグ
 * @returns {string[]|null} タグに対応する値の配列、見つからない場合はnull
 */
const traverseXmlObject = (xmlObject: any, tag: string): string[] | null => {
  // スタックを使用して深さ優先探索を実装
  const stack: { obj: any; tag: string }[] = [{ obj: xmlObject, tag }];
  const results: string[] = [];
  
  while (stack.length > 0) {
    const { obj, tag } = stack.pop()!;
    
    if (typeof obj === "object" && obj !== null) {
      for (let [key, value] of Object.entries(obj)) {

        // 直接一致する場合
        if (key === tag) {
          results.push(value === 0 ? "0" : (value as string));
        }

        // bldg:BuildingのgmlIDを処理
        if (
          tag.includes("gml:id") &&
          key === "bldg:Building" &&
          typeof value === "object" &&
          value !== null &&
          "@_gml:id" in value
        ) {
          results.push((value as { "@_gml:id": string })["@_gml:id"]);
        }

        // @_属性を含むタグの処理
        if (tag.includes("@_") && typeof value === "object") {

          const [tagKey, tagValue] = tag.split("=");
          const result = processAttributes(value, tagValue);
          if (result !== null && tagKey.split("　")[0] === key) {         
            results.push(result);
          }
        }

        // gen:valueの処理
        if (typeof value === "string" && tag === value) {
          results.push(obj["gen:value"] as string);
        }

        // #textを含むオブジェクトの処理
        if (typeof value === "object" && tag === key) {
          results.push((value as { [key: string]: any })["#text"]);
        }

        // gml:posListの特殊処理
        if ("gml:posList" === tag && key === "bldg:lod0RoofEdge") {
          results.push(obj["bldg:lod0RoofEdge"]["gml:MultiSurface"]["gml:surfaceMember"]["gml:Polygon"]["gml:exterior"]["gml:LinearRing"]["gml:posList"]);
        }

        // 再帰的探索のためにスタックに追加
        stack.push({ obj: value, tag });
      }
    }
  }
  // 該当する値が見つからなかった場合
  return results.length > 0 ? results : null;
};

/**
 * 汎用的に@_属性を処理する関数
 * @param {Object} value - XMLオブジェクトの値
 * @param {string} tagValue - タグの値
 * @returns {string|null} 属性に対応する値、見つからない場合はnull
 */
const processAttributes = (value: any, tagValue: string): string | null => {
  if (typeof value === "object" && value !== null) {
    for (const [attrKey, attrValue] of Object.entries(value)) {
      if (attrKey.startsWith("@_") && attrValue === tagValue) {
        return value["#text"] || null;
      }
    }
  }
  return null;
};

/**
 * XMLオブジェクトからCSVデータを生成し、ダウンロード可能なファイルとして出力する関数
 * この関数は、XMLデータを解析し、指定されたタグに基づいてCSV形式のデータを作成します。
 * 生成されたCSVファイルは自動的にダウンロードされます。
 * @param {Object} xmlObject - XMLオブジェクト
 * @param {Array<{ tag: string, index: number }>} selectedCsvData - 選択されたCSVデータ
 */
export function processCsvData(
  xmlObject: any,
  selectedCsvData: { tag: string; index: number }[]
): void {
  // selectedCsvDataの要素をindexの昇順で並べ替える
  selectedCsvData.sort((a, b) => a.index - b.index);

  // タグと翻訳されたヘッダータグを抽出
  const tags = selectedCsvData.map((data) => data.tag);
  const headerTags: string[] = [];
  const tagCounts: { [key: string]: number } = {};

  // ヘッダーのタグにインデックスを付ける
  for (const tag of tags) {
    if (tagCounts[tag] === undefined) {
      tagCounts[tag] = 1;
    } else {
      tagCounts[tag]++;
    }
    // 重複がある場合のみインデックスを付ける
    const headerTag = tagCounts[tag] > 1 ? `${translateTag(tag) || tag}${tagCounts[tag]}` : `${translateTag(tag) || tag}`;
    headerTags.push(headerTag);
  }

  // CSVのヘッダー行を作成
  const rows: string[][] = [headerTags];
  const xmlObj = xmlObject["core:CityModel"]["core:cityObjectMember"];

  // XMLオブジェクトを走査してCSVデータを生成
  for (const obj of xmlObj) {
    const row: string[] = [];
    const tagValueCounts: { [key: string]: number } = {};

    for (const tag of tags) {
      // XMLオブジェクトからタグに対応する値を取得
      let results = traverseXmlObject(obj, tag);
      
      // 特定のタグの場合、配列を文字列に変換
      if (tag === "uro:realEstateIDOfLand" && Array.isArray(results)) {
        results = [results.join(" ")];
      }
      
      // 結果をCSV行に追加（nullの場合は空文字列）
      if (results !== null) {
        for (const result of results) {
          if (tagValueCounts[tag] === undefined) {
            tagValueCounts[tag] = 1;
          } else {
            tagValueCounts[tag]++;
            // 重複する場合は連番を付ける
            rows[0].push(tagValueCounts[tag] > 1 ? `${tag}${tagValueCounts[tag]}` : tag);
          }
          row.push(result);
        }
      } else {
        row.push("");
      }
    }
    rows.push(row);
  }

  // CSVコンテンツを生成
  const csvContent = rows.map((e) => e.join(",")).join("\n");
  
  // 生成したCSVをダウンロード
  downloadCsvContent(csvContent, "Result.csv");
}