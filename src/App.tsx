import React, { useState } from "react";
import "./App.css";
// components
import PlateauFileUploader from "./components/PlateauFileUploader";
import AnyDataFileUploader from "./components/AnyDataFileUploader";
import PlateauTagsListBox from "./components/PlateauTagsListBox";
import AnyDataTagsListBox from "./components/AnyDataTagsListBox";
import LinkDataTable from "./components/LinkDataTable";
import CsvLinkDataTable from "./components/CsvLinkDataTable";
// scripts
import { processGMLData, processGMLDataforCsv } from "./scripts/dataProcessing";
import { processCsvData } from "./scripts/csvProcess";

/**
 * メインのアプリケーションコンポーネント
 * PLATEAUと任意のデータをアップロードし、タグを選択してデータを紐づけるUIを提供します。
 */
function App() {
  const [mode, setMode] = useState("GML");
  const [plateauTags, setPlateauTags] = useState<string[]>([]);
  const [anyDataTags, setAnyDataTags] = useState<string[]>([]);
  const [plateauXmlObject, setPlateauXmlObject] = useState<any>(null);
  const [anyDataXmlObject, setAnyDataXmlObject] = useState<any>(null);
  const [selectedPlateauTag, setSelectedPlateauTag] = useState<string>("");
  const [selectedAnyDataTag, setSelectedAnyDataTag] = useState<string>("");
  const [selectedData, setSelectedData] = useState<
    { tag: string; plateauTag: string; attributeName: string }[]
  >([]);
  const [selectedCsvData, setSelectedCsvData] = useState<
    { tag: string; index: number }[]
  >([]);
  const [plateauXmlObjectForCsv, setPlateauXmlObjectForCsv] =
    useState<any>(null);
  const [tagsForCsv, setTagsForCsv] = useState<string[]>([]);

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
  const handleSelectedTagsChange = (
    selectedData: { tag: string; plateauTag: string; attributeName: string }[]
  ) => {
    setSelectedData(selectedData);
  };

  /**
   * 選択されたタグの変更をハンドルする
   * @param selectedCsvData 選択されたデータの配列
   */
  const handleSelectedCsvTagsChange = (
    selectedCsvData: { tag: string; index: number }[]
  ) => {
    setSelectedCsvData(selectedCsvData);
  };



  return (
    <div>

      {/* ヘッダー */}
      <header className="bg-[#463C64] text-white text-center py-4">
        <h1 className="text-2xl font-bold">PLATEAU DataLinker</h1>
      </header>

      {/* メインコンテンツ */}
      <div className="container mx-auto p-4 flex justify-between">
        {/* 左側 */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2 mr-2">
          <h2 className="block text-gray-700 text-xl font-bold mb-2">
            ①PLATEAU
          </h2>
          <p className="block text-gray-700 text-sm font-bold mb-2">
            CityGMLをアップロード
            <br />
            ※ファイル形式：GML
          </p>
          <PlateauFileUploader
            onTagsCollected={handlePlateauTagsCollected}
            onDataParsed={handlePlateauParsed}
            accept=".gml"
          />
          <PlateauTagsListBox
            tags={plateauTags}
            selectedTag={selectedPlateauTag}
            onTagSelected={handlePlateauTagSelected}
          />
        </div>

        {/* 右側 */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2 ml-2">
          <h2 className="block text-gray-700 text-xl font-bold mb-2">
            ②紐づけたいデータ
          </h2>
          <p className="block text-gray-700 text-sm font-bold mb-2">
            任意のファイルをアップロード
            <br />
            ※ファイル形式：GML, XML, CSV, JSON
          </p>
          <AnyDataFileUploader
            onTagsCollected={handleAnyDataTagsCollected}
            onDataParsed={handleAnyDataParsed}
            accept=".gml,.xml,.csv,.json,.geojson"
          />
          <AnyDataTagsListBox
            tags={anyDataTags}
            selectedTag={selectedAnyDataTag}
            onTagSelected={handleAnyDataTagSelected}
          />
        </div>
      </div>

      {/* データ紐づけ */}
      <div className="container mx-auto p-4">
        <h2 className="block text-gray-700 text-xl font-bold mb-2">
          ③「紐づけたいデータ」から追加したい属性を選択し、属性名を記入してください
        </h2>
        <LinkDataTable
          anyDataTags={anyDataTags}
          onSelectedTagsChange={handleSelectedTagsChange}
        />
      </div>

      {/* 出力モード選択 */}
      <div className="container mx-auto p-4 flex justify-center">
        <div className="flex items-center space-x-4">
          <label htmlFor="mode-select" className="text-gray-700 font-bold">
            出力モード選択:
          </label>
          <select
            id="mode-select"
            className="border border-gray-300 rounded-md p-2"
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="GML">GML</option>
            <option value="CSV">CSV</option>
          </select>
        </div>
      </div>

      {/* GMLモード */}
      {mode === "GML" && (
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
      )}

      {/* CSVモード */}
      {mode === "CSV" && (
        <div>
          {/* データ紐づけ */}
          <div className="flex justify-center mt-4 mb-4">
            <button
              className="bg-[#01BEBF] hover:bg-[#019A9A] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => {
              // processGMLDataforCsv関数を呼び出し、GMLデータと任意のデータを処理する
              const xmlContent = processGMLDataforCsv(
                plateauXmlObject,       // PLATEAUのXMLオブジェクト
                anyDataXmlObject,       // 任意のデータのXMLオブジェクト
                selectedPlateauTag,     // 選択されたPLATEAUのタグ
                selectedAnyDataTag,     // 選択された任意のデータのタグ
                selectedData            // 選択されたデータの配列
              );
            
              // xmlContentが存在する場合、Promiseが返される
              if (xmlContent) {
                // Promiseが解決されたときの処理
                xmlContent.then((resolvedXmlContent) => {
                  // selectedDataからattributeNameを抽出し、plateauTagsに追加する
                  const attributeNames = selectedData.map(data => data.attributeName);
                  setTagsForCsv(plateauTags.concat(attributeNames));
            
                  // 解決されたXMLコンテンツをplateauXmlObjectForCsvに設定する
                  setPlateauXmlObjectForCsv(resolvedXmlContent);
                }).catch((error) => {
                  // エラーが発生した場合の処理
                  console.error("XML content processing failed:", error);
                });
              }
            }}
          >
            データを紐づける
          </button>
        </div>
          <div className="container mx-auto p-4">
            <CsvLinkDataTable
              anyDataTags={tagsForCsv}
              onSelectedTagsChange={handleSelectedCsvTagsChange}
            />
          </div>
          <div className="flex justify-center mt-4 mb-4">
            <button
              className="bg-[#01BEBF] hover:bg-[#019A9A] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() =>
                processCsvData(
                  plateauXmlObjectForCsv,
                  selectedCsvData
                )
              }
            >
              CSVとして出力する
            </button>
          </div>
        </div>
      )}

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