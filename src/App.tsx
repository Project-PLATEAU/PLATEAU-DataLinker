import React, { useState } from "react";
import "./App.css";
import PlateauFileUploader from "./components/PlateauFileUploader";
import FileUploader from "./components/FileUploader";
import { processGMLData, processGMLDataforCsv } from "./scripts/dataProcessing";
import { xmlValidate } from "./scripts/pyodyteJs";
import { analyzeString } from "./scripts/analysis";
import TagsComboBox from "./components/TagsComboBox";
import DataTagTable from "./components/DataTagTable";
import CsvDataItemTable from "./components/CsvDataItemTable";
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
      <header className="bg-[#463C64] text-white text-center py-4">
        <h1 className="text-2xl font-bold">PLATEAU DataLinker</h1>
      </header>
      <div className="container mx-auto p-4 flex justify-between">
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
          <TagsComboBox
            tags={plateauTags}
            selectedTag={selectedPlateauTag}
            onTagSelected={handlePlateauTagSelected}
          />
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2 ml-2">
          <h2 className="block text-gray-700 text-xl font-bold mb-2">
            ②紐づけたいデータ
          </h2>
          <p className="block text-gray-700 text-sm font-bold mb-2">
            任意のファイルをアップロード
            <br />
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
        <h2 className="block text-gray-700 text-xl font-bold mb-2">
          ③「紐づけたいデータ」から追加したい属性を選択し、属性名を記入してください
        </h2>
        <DataTagTable
          anyDataTags={anyDataTags}
          onSelectedTagsChange={handleSelectedTagsChange}
        />
      </div>

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

      {mode === "CSV" && (
        <div>
                  <div className="flex justify-center mt-4 mb-4">
          <button
            className="bg-[#01BEBF] hover:bg-[#019A9A] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => {
              const xmlContent = processGMLDataforCsv(
                plateauXmlObject,
                anyDataXmlObject,
                selectedPlateauTag,
                selectedAnyDataTag,
                selectedData
              );
              if (xmlContent) {
                const attributeNames = selectedData.map(data => data.attributeName);
                setTagsForCsv(plateauTags.concat(attributeNames));
                setPlateauXmlObjectForCsv(xmlContent);

              }
            }}
          >
            データを紐づける
          </button>
        </div>
          <div className="container mx-auto p-4">
            <CsvDataItemTable
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
