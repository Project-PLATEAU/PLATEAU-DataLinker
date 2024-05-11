import React, { useState } from "react";
import { XMLParser } from "fast-xml-parser";

interface FileUploaderProps {
  onTagsCollected: (tags: string[]) => void;
  onDataParsed: (data: any) => void; // XMLまたはCSVデータの解析結果を扱うための共通関数
  accept: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onTagsCollected,
  onDataParsed,
  accept,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setUploadedFile(file);
  };

  const getMimeTypeFromHeader = (header: Uint8Array): string => {
    const headerHex = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join('');

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

  // ファイルヘッダを読み取り、MIMEタイプを推測する関数
  const readFileHeader = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const header = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 50);
        const mimeType = getMimeTypeFromHeader(header);
        resolve(mimeType);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  // ファイルタイプに基づいて適切な処理関数を呼び出す関数
  const handleFileProcessing = (file: File, mimeType: string) => {
    switch (mimeType) {
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

  // パースボタンがクリックされたときの処理
  const handleParseButtonClick = async () => {
    if (!uploadedFile) {
      alert("ファイルがアップロードされていません。");
      return;
    }

    const fileType = uploadedFile.type || '';
    if (!fileType) {
      try {
        // ファイルヘッダからMIMEタイプを読み取る
        const mimeType = await readFileHeader(uploadedFile);
        console.log(mimeType);
        // 読み取ったMIMEタイプに基づいてファイル処理を行う
        handleFileProcessing(uploadedFile, mimeType);
      } catch (error) {
        alert("ファイルの読み込みに失敗しました。");
        console.error(error);
      }
    } else {
      // ファイルタイプが存在する場合、直接処理を行う
      handleFileProcessing(uploadedFile, fileType);
    }
  };

  const parseXMLFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const xml = e.target?.result;
      if (typeof xml === "string") {
        const option = {
          ignoreAttributes: false,
        };
        const parser = new XMLParser(option);
        const xmlParsed = parser.parse(xml);
        collectTags(xmlParsed);
        onDataParsed(xmlParsed);  // onXmlParsedからonDataParsedに変更
      }
    };
    reader.onerror = (e) => {
      alert("ファイルの読み込みに失敗しました。");
    };
    reader.readAsText(file);
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result;
      if (typeof csvData === "string") {
        const rows = csvData.split('\n').map(row => row.split(','));
        const tags = rows[0]; // CSVの最初の行をタグ��して取得
        onTagsCollected(tags);
        const data = rows.slice(1).map(row => {
          return row.reduce<{ [key: string]: string }>((acc, cur, index) => {
            acc[tags[index]] = cur;
            return acc;
          }, {});
        });
        onDataParsed(data);  // CSVデータの解析結果をonDataParsedに渡す
      }
    };
    reader.readAsText(file);
  };

  const collectTags = (xmlObject: any) => {
    const tags = new Set<string>();

    const traverse = (obj: any) => {
      if (obj && typeof obj === "object") {
        Object.entries(obj).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => traverse(item));
          } else {
            if (
              typeof value !== "object" &&
              !key.startsWith("@") &&
              key !== "#text"
            ) {
              tags.add(key);
            }
            if (typeof value === "object") {
              traverse(value);
            }
          }
        });
      }
    };
    traverse(xmlObject);
    onTagsCollected(Array.from(tags));
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
