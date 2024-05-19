import React, { useState } from "react";
import { XMLParser } from "fast-xml-parser";

interface FileUploaderProps {
  onTagsCollected: (tags: string[]) => void;
  onDataParsed: (data: any) => void; // XMLまたはCSVデータの解析結果を扱うための共通関数
  accept: string;
}

/**
 * FileUploaderコンポーネント
 * ユーザーがファイルをアップロードし、その内容を解析するためのコンポーネント。
 * 
 * @param {FileUploaderProps} props - コンポーネントのプロパティ
 * @param {function} props.onTagsCollected - ファイルから収集したタグを処理するコールバック関数
 * @param {function} props.onDataParsed - 解析されたデータを処理するコールバック関数
 * @param {string} props.accept - アップロードを許可するファイルのMIMEタイプ
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  onTagsCollected,
  onDataParsed,
  accept,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  /**
   * ファイルがアップロードされたときに呼び出されるハンドラ
   * @param {React.ChangeEvent<HTMLInputElement>} event - ファイル入力の変更イベント
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setUploadedFile(selectedFile);
  };

  /**
   * ファイルのヘッダーからMIMEタイプを推測する関数
   * @param {Uint8Array} header - ファイルのヘッダー部分
   * @returns {string} 推測されたMIMEタイプ
   */
  const getMimeTypeFromHeader = (header: Uint8Array): string => {
    const headerHex = Array.from(header).map(byte => byte.toString(16).padStart(2, '0')).join('');
    const mimeTypes = [
      { signature: '3c3f786d6c', mimeType: 'application/xml' }, // XML files start with '<?xml'
      { signature: '474d4c', mimeType: 'application/gml+xml' }, // GML files start with 'GML'
      { signature: '7b2274797065223a', mimeType: 'application/geo+json' }, // GeoJSON files start with '{"type":'
      { signature: '5b7b22', mimeType: 'application/json' }, // JSON files start with '[{"'
      { signature: '7b22', mimeType: 'application/json' }, // JSON files start with '{"'
    ];

    for (const { signature, mimeType } of mimeTypes) {
      if (headerHex.startsWith(signature)) {
        return mimeType;
      }
    }

    return 'unknown';
  };

  /**
   * ファイルのヘッダーを読み込み、MIMEタイプを推測する関数
   * @param {File} file - 読み込むファイル
   * @returns {Promise<string>} 推測されたMIMEタイプ
   */
  const readFileHeader = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        const header = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 10);
        resolve(getMimeTypeFromHeader(header));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file.slice(0, 10));
    });
  };

  /**
   * ファイルのMIMEタイプに基づいて適切な解析関数を呼び出す関数
   * @param {File} file - 解析するファイル
   * @param {string} mimeType - ファイルのMIMEタイプ
   */
  const handleFileProcessing = (file: File, mimeType: string) => {
    switch (mimeType) {
      case "application/json":
        parseJSONFile(file);
        break;
      case "application/xml":
      case "application/gml+xml":
        parseXMLFile(file);
        break;
      case "text/csv":
        parseCSVFile(file);
        break;
      default:
        alert("サポートされていないファイル形式です。");
        break;
    }
  };

  /**
   * JSONファイルを解析する関数
   * @param {File} file - 解析するJSONファイル
   */
  const parseJSONFile = (file: File) => {
    parseFile(file, (jsonData) => {
      try {
        const parsedData = JSON.parse(jsonData);
        console.log(parsedData);
        collectTags(parsedData, false);
        onDataParsed(parsedData);
      } catch (error) {
        alert("JSONファイルのパースに失敗しました。");
        console.error(error);
      }
    });
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
      collectTags(xmlParsed, true);
      onDataParsed(xmlParsed);
    });
  };

  /**
   * CSVファイルを解析する関数
   * @param {File} file - 解析するCSVファイル
   */
  const parseCSVFile = (file: File) => {
    parseFile(file, (csvData) => {
      const rows = csvData.split('\n').map(row => row.split(','));
      const tags = rows[0];
      onTagsCollected(tags);
      const data = rows.slice(1).map(row => {
        return row.reduce<{ [key: string]: string }>((acc, cur, index) => {
          acc[tags[index]] = cur;
          return acc;
        }, {});
      });
      onDataParsed(data);
    });
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
   * XMLオブジェクトからタグを収集する関数
   * @param {any} data - タグを収集するデータ
   * @param {boolean} isXML - データがXMLかどうか
   */
  const collectTags = (data: any, isXML: boolean) => {
    const tags = new Set<string>();

    const traverseXML = (obj: any) => {
      if (obj && typeof obj === "object") {
        Object.entries(obj).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => traverseXML(item));
          } else {
            if (
              typeof value !== "object" &&
              !key.startsWith("@") &&
              key !== "#text"
            ) {
              tags.add(key);
            }
            if (typeof value === "object") {
              traverseXML(value);
            }
          }
        });
      }
    };

    const traverseJSON = (obj: any) => {
      if (obj && typeof obj === "object") {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value !== "object" || value === null) {
            tags.add(key);
          } else if (Array.isArray(value)) {
            if (value.length > 1) {
              tags.add(key);
            }
            value.forEach((item) => traverseJSON(item));
          } else {
            traverseJSON(value);
          }
        });
      }
    };

    if (isXML) {
      traverseXML(data);
    } else {
      traverseJSON(data);
    }

    onTagsCollected(Array.from(tags));
  };

  /**
   * ファイルのMIMEタイプを取得する関数
   * @param {File} file - MIMEタイプを取得するファイル
   * @returns {Promise<string>} ファイルのMIMEタイプ
   */
  const getFileMimeType = async (file: File): Promise<string> => {
    const fileType = file.type || '';
    if (!fileType) {
      return await readFileHeader(file);
    }
    return fileType;
  };

  /**
   * ファイルを解析するボタンを押したときのハンドラ
   */
  const handleParseButtonClick = async () => {
    if (!uploadedFile) {
      alert("ファイルがアップロードされていません。");
      return;
    }

    try {
      const mimeType = await getFileMimeType(uploadedFile);
      handleFileProcessing(uploadedFile, mimeType);
    } catch (error) {
      alert("ファイルの読み込みに失敗しました。");
      console.error(error);
    }
  };

  return (
    <div>
      <input
        id="file-upload-left"
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        multiple={false}
        className="mb-4"
      />

      <div className="flex items-center justify-between mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={handleParseButtonClick}
        >
          読み込む
        </button>
      </div>
    </div>
  );
};


export default FileUploader;
