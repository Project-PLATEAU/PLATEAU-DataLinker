import React, { useState } from "react";
import { XMLParser } from "fast-xml-parser";

interface FileUploaderProps {
  onTagsCollected: (tags: string[]) => void;
  onXmlParsed: (xmlObject: any) => void; // この行を追加
  accept: string; // ファイルの種類を指定するためのプロパティ
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onTagsCollected,
  onXmlParsed, // この行を追加
  accept,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setUploadedFile(file);
  };

  const handleParseButtonClick = () => {
    if (uploadedFile) {
      parseXMLFile(uploadedFile);
    } else {
      alert("ファイルがアップロードされていません。");
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
        onXmlParsed(xmlParsed); // この行を追加
      }
    };
    reader.readAsText(file);
  };

  // XMLオブジェクトからタグを収集する関数
  const collectTags = (xmlObject: any) => {
    // 重複しないタグを保持するためのSet
    const tags = new Set<string>();

    // オブジェクトを再帰的にトラバースする関数
    const traverse = (obj: any) => {
      // オブジェクトがnullでなく、オブジェクト型の場合に処理を実行
      if (obj && typeof obj === "object") {
        // オブジェクトのキーと値をループ処理
        Object.entries(obj).forEach(([key, value]) => {
          // 値が配列の場合、その要素を直接トラバース
          if (Array.isArray(value)) {
            value.forEach((item) => traverse(item));
          } else {
            // 値がオブジェクトでない、特定のキーを持たない場合にタグとして追加
            if (
              typeof value !== "object" &&
              !key.startsWith("@") &&
              key !== "#text"
            ) {
              tags.add(key);
            }
            // 値がオブジェクトの場合、再帰的にトラバース
            if (typeof value === "object") {
              traverse(value);
            }
          }
        });
      }
    };
    // XMLオブジェクトをトラバースしてタグを収集
    traverse(xmlObject);
    onTagsCollected(Array.from(tags));
  };

  return (
    <div>
      {/* ファイルアップロードのinput要素 */}
      <input
        id="file-upload-left"
        type="file"
        accept={accept} // 受け入れるファイルの種類
        onChange={handleFileUpload} // ファイルが選択された時のイベントハンドラ
        multiple={false} // 複数ファイルのアップロードを不許可
        className="mb-4" // マージンボトムスタイル
      />

      {/* 読み込みボタン */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" // ボタンのスタイル
          type="button"
          onClick={handleParseButtonClick} // ボタンクリック時のイベントハンドラ
        >
          読み込む
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
