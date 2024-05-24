import React, { useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader";
import { processGMLData } from "./scripts/dataProcessing";
import { xmlValidate } from "./scripts/pyodyteJs";
import { analyzeString } from "./scripts/analysis";
import TagsComboBox from "./components/TagsComboBox";
import DataTagTable from "./components/DataTagTable";

/**
 * メインのアプリケーションコンポーネント
 * PLATEAUと任意のデータをアップロードし、タグを選択してデータを紐づけるUIを提供します。
 */
function App() {
  const [plateauTags, setPlateauTags] = useState<string[]>([]);
  const [anyDataTags, setAnyDataTags] = useState<string[]>([]);
  const [plateauXmlObject, setPlateauXmlObject] = useState<any>(null);
  const [anyDataXmlObject, setAnyDataXmlObject] = useState<any>(null);
  const [selectedPlateauTag, setSelectedPlateauTag] = useState<string>("");
  const [selectedAnyDataTag, setSelectedAnyDataTag] = useState<string>("");
  const [selectedData, setSelectedData] = useState<{ tag: string; plateauTag: string; attributeName: string }[]>([]);

  /**
   * PLATEAUのタグが収集されたときに呼ばれるハンドラー
   * @param collectedTags 収集されたタグの配列
   */
  const handlePlateauTagsCollected = (collectedTags: string[]) => {
    setPlateauTags(collectedTags);
  };

  /**
   * 任意のデータのタグが収集されたときに呼ばれるハンドラー
   * @param collectedTags 収集されたタグの配列
   */
  const handleAnyDataTagsCollected = (collectedTags: string[]) => {
    setAnyDataTags(collectedTags);
  };

  /**
   * PLATEAUのXMLデータがパースされたときに呼ばれるハンドラー
   * @param xmlObject パースされたXMLオブジェクト
   */
  const handlePlateauParsed = (xmlObject: any) => {
    setPlateauXmlObject(xmlObject);
  };

  /**
   * 任意のデータのXMLがパースされたときに呼ばれるハンドラー
   * @param xmlObject パースされたXMLオブジェクト
   */
  const handleAnyDataParsed = (xmlObject: any) => {
    setAnyDataXmlObject(xmlObject);
  };

  /**
   * PLATEAUのタグが選択されたときに呼ばれるハンドラー
   * @param tag 選択されたタグ
   */
  const handlePlateauTagSelected = (tag: string) => {
    setSelectedPlateauTag(tag);
  };

  /**
   * 任意のデータのタグが選択されたときに呼ばれるハンドラー
   * @param tag 選択されたタグ
   */
  const handleAnyDataTagSelected = (tag: string) => {
    setSelectedAnyDataTag(tag);
  };

  /**
   * 選択されたタグの変更をハンドルする
   * @param selectedData 選択されたデータの配列
   */
  const handleSelectedTagsChange = (selectedData: { tag: string; plateauTag: string; attributeName: string }[]) => {
    setSelectedData(selectedData);
  };

  return (
    <div>
      <header className="bg-[#463C64] text-white text-center py-4">
        <h1 className="text-2xl font-bold">PLATEAUデータリンクアプリ</h1>
      </header>
      <div className="container mx-auto p-4 flex justify-between">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2 mr-2">
          <h2 className="block text-gray-700 text-xl font-bold mb-2">
            PLATEAU
          </h2>
          <p className="block text-gray-700 text-sm font-bold mb-2">
            CityGMLをアップロード<br />
            ※ファイル形式：GML
          </p>
          <FileUploader
            onTagsCollected={handlePlateauTagsCollected}
            onDataParsed={handlePlateauParsed}
            accept=".gml"
          />
          <TagsComboBox
            tags={plateauTags}
            selectedTag={selectedPlateauTag}
            onTagSelected={handlePlateauTagSelected}
          />
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2 ml-2">
          <h2 className="block text-gray-700 text-xl font-bold mb-2">
            紐づけたいデータ
          </h2>
          <p className="block text-gray-700 text-sm font-bold mb-2">
            任意のファイルをアップロード<br />
            ※ファイル形式：GML, XML, CSV, JSON
          </p>
          <FileUploader
            onTagsCollected={handleAnyDataTagsCollected}
            onDataParsed={handleAnyDataParsed}
            accept=".gml,.xml,.csv,.json,.geojson"
          />
          <TagsComboBox
            tags={anyDataTags}
            selectedTag={selectedAnyDataTag}
            onTagSelected={handleAnyDataTagSelected}
          />
        </div>
      </div>

      <div className="container mx-auto p-4">
        <DataTagTable
          anyDataTags={anyDataTags}
          onSelectedTagsChange={handleSelectedTagsChange}
        />
      </div>

      {/* <div className="flex justify-center mt-4">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {
            console.log(selectedData);
          }}
        >
          関数テスト
        </button>
      </div> */}

      <div className="flex justify-center mt-4 mb-4">
        <button
          className="bg-[#01BEBF] hover:bg-[#019A9A] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() =>
            processGMLData(
              plateauXmlObject,
              anyDataXmlObject,
              selectedPlateauTag,
              selectedAnyDataTag,
              selectedData
            )
          }
        >
          データを紐づける
        </button>
      </div>
      {/* <div className="flex justify-center mt-4">
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={xmlValidate}
        >
          PLATEAU品質評価
        </button>
      </div> */}
    </div>
  );
}

export default App;
