import React, { useState } from "react";
import { XMLParser } from "fast-xml-parser";

interface PlateauFileUploaderProps {
  onTagsCollected: (tags: string[]) => void;
  onDataParsed: (data: any) => void; // XMLまたはCSVデータの解析結果を扱うための共通関数
  accept: string;
}

/**
 * FileUploaderコンポーネント
 * ユーザーがファイルをアップロードし、その内容を解析するためのコンポーネント。
 *
 * @param {PlateauFileUploaderProps} props - コンポーネントのプロパティ
 * @param {function} props.onTagsCollected - ファイルから収集したタグを処理するコールバック関数
 * @param {function} props.onDataParsed - 解析されたデータを処理するコールバック関数
 * @param {string} props.accept - アップロードを許可するファイルのMIMEタイプ
 */
const PlateauFileUploader: React.FC<PlateauFileUploaderProps> = ({
  onTagsCollected,
  onDataParsed,
  accept,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  /**
   * ファイルがアップロードされたときに呼び出
   * @param {React.ChangeEvent<HTMLInputElement>} event - ファイル入力の変更イベント
   */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      handleFileProcessing(file);
    }
  };

  /**
   * ファイルのMIMEタイプに基づいて適切な解析関数を呼び出す関数
   * @param {File} file - 解析するファイル
   */
  const handleFileProcessing = (file: File) => {
    parseXMLFile(file);
  };

  /**
   * ファイルを読み込み、コールバック関数に内容を渡す関数
   * @param {File} file - 読み込むファイル
   * @param {function} onLoad - 読み込んだ内容を受け取るコールバック関数
   */
  const parseFile = (file: File, onLoad: (result: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        onLoad(result);
      }
    };
    reader.onerror = (e) => {
      alert("ファイルの読み込みに失敗しました。");
    };
    reader.readAsText(file);
  };

  /**
   * XMLファイルを解析する関数
   * @param {File} file - 解析するXMLファイル
   */
  const parseXMLFile = (file: File) => {
    parseFile(file, (xml) => {
      const option = { ignoreAttributes: false, ignoreDeclaration: true };
      const parser = new XMLParser(option);
      const xmlParsed = parser.parse(xml);

      if (
        xmlParsed.hasOwnProperty("core:CityModel") &&
        xmlParsed["core:CityModel"].hasOwnProperty("core:cityObjectMember")
      ) {
        const cityObjectMembers =
          xmlParsed["core:CityModel"]["core:cityObjectMember"];
        collectAllTags(cityObjectMembers, true);
      } else {
        collectTags(xmlParsed, true);
      }

      onDataParsed(xmlParsed);
    });
  };

  /**
   * XMLオブジェクトからタグを収集する関数
   * @param {any} data - タグを収集するデータ
   * @param {boolean} isXML - データがXMLかどうか
   */
  /**
   * データからタグを収集する関数
   * @param {any} data - タグを収集するデータ
   * @param {boolean} isXML - データがXMLかどうか
   */
  const collectTags = (data: any, isXML: boolean) => {
    // タグを格納するSetを作成
    const tags: [string, string, string][] = [];

    /**
     * XPathを使用してXMLオブジェクトの最初のcore:cityObjectMember要素の子要素を取得する関数
     * @param {Document} xmlDoc - XMLドキュメント
     * @returns {Element[]} - 最初のcore:cityObjectMember要素の子要素の配列
     */
    const getFirstCityObjectMemberElements = (xmlDoc: Document): Element[] => {
      const xpath = "(//core:cityObjectMember)[1]//*";
      const result = xmlDoc.evaluate(
        xpath,
        xmlDoc,
        document.createNSResolver(xmlDoc.documentElement),
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      const elements: Element[] = [];
      for (let i = 0; i < result.snapshotLength; i++) {
        const node = result.snapshotItem(i);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          elements.push(node as Element);
        }
      }
      return elements;
    };

    // XMLドキュメントを作成
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    // 最初のcore:cityObjectMember要素の子要素を取得
    const firstCityObjectMemberElements = getFirstCityObjectMemberElements(xmlDoc);
    // 取得した要素から値を持つタグを収集
    firstCityObjectMemberElements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      if (tagName && element.textContent?.trim() && !element.children.length) {
        if (!tags.some(tag => tag[0] === tagName && tag[1] === '' && tag[2] === '')) {
          tags.push([tagName, '', '']);
        }
      }
      // 属性も収集
      for (const attr of element.attributes) {
        if (attr.value.trim()) {
          const attrName = attr.name.toLowerCase();
          if (!tags.some(tag => tag[0] === tagName && tag[1] === attrName && tag[2] === attr.value)) {
            tags.push([tagName, attrName, attr.value]);
          }
        }
      }
    });

    // 収集したタグをコールバック関数に渡す
    onTagsCollected(tags.flatMap(tag => tag.join('')));
  };

  const collectAllTags = (data: any, isXML: boolean) => {
    // タグを格納するSetを作成
    const tags = new Set<string>();
    // デフォルトのタグを追加

    tags.forEach((tag) => tags.add(tag));
    let beforeTags = "";
    let previousKey = '';
    let previousValue = null;
    let previousObj: any = null;
    let prevPrevObj: any = null;
    /**
     * XMLデータを再帰的にトラバースしてタグを収集する関数
     * @param {any} obj - トラバースするオブジェクト
     */
    const traverseXML = (obj: any) => {
      // 'core:cityObjectMember'が存在する場合、タグに追加
      if (obj.hasOwnProperty("core:cityObjectMember")) {
        tags.add("core:cityObjectMember");
      }

      // オブジェクトを再帰的にトラバース
      if (obj && typeof obj === "object") {      
        Object.entries(obj).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => traverseXML(item));
          } else {
            if (key === "@_name") {
              beforeTags = 'gen:stringAttribute name="' + String(value) + '"';
              tags.add(String(beforeTags));
            }
            if (key === "@_gml:id" && String(value).indexOf("bldg_") === 0) {
              tags.add("gml:id");
            }

            // '@_'が含まれるプロパティを動的に取得
            if ((typeof value === "object" && value !== null) && Object.prototype.hasOwnProperty.call(value, "#text")) {
              Object.entries(value as { [key: string]: any }).forEach(([propKey, propValue]) => {
                if (propKey.startsWith("@_") && typeof propValue === "string") {
                  const tag = `${key}　${propKey}=${propValue}`;
                  tags.add(tag);
                }
              });
            }

            if (typeof value === "object") {
              traverseXML(value);
            } else {
              if (
                !key.includes("@_") &&
                !key.includes("#") &&
                key !== "gen:value"
              ) {
                tags.add(key);
              }
            }
            // オブジェクトをシフト
            prevPrevObj = previousObj;
            previousObj = { [key]: value };

          }
        });
      }
    };

    traverseXML(data);
    // 収集したタグをコールバック関数に渡す
    onTagsCollected(Array.from(tags));
  };

  return (
    <div>
      <div>
        <label htmlFor="file-input" className="sr-only">
          Choose file
        </label>
        <input
          type="file"
          name="file-input"
          id="file-input"
          onChange={handleFileUpload}
          multiple={false}
          accept={accept}
          className="mb-4 block w-full border border-gray-200 shadow-sm rounded-lg text-md focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none file:bg-[#01BEBF] file:border-0 file:me-4 file:py-1 file:text-white"
        />
      </div>
    </div>
  );
};

export default PlateauFileUploader;