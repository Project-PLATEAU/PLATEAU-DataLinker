import React, { useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader";
import { processGMLData } from "./scripts/dataMatching"; // Importing exampleFunction from xml.ts
// import { xmlValidate, loadStaticFile } from "./pyodyteJs";
import { xmlValidate } from "./pyodyteJs";

import { analyzeString } from "./scripts/analysis";

import TagsComboBox from "./components/TagsComboBox";
import DataTagTable from "./components/DataTagTable"; // Importing the DataTagTable component
import { XMLBuilder } from "fast-xml-parser";

function App() {
  const [plateauTags, setPlateauTags] = useState<string[]>([]);
  const [anyDataTags, setAnyDataTags] = useState<string[]>([]);
  // New state for storing the parsed XML object
  const [plateauXmlObject, setPlateauXmlObject] = useState<any>(null);
  const [anyDataXmlObject, setAnyDataXmlObject] = useState<any>(null);
  const [selectedPlateauTag, setSelectedPlateauTag] = useState<string>("");
  const [selectedAnyDataTag, setSelectedAnyDataTag] = useState<string>("");
  const [selectedData, setSelectedData] = useState<{ tag: string; plateauTag: string; attributeName: string }[]>([]);

  const handlePlateauTagsCollected = (collectedTags: string[]) => {
    setPlateauTags(collectedTags);
  };

  const handleAnyDataTagsCollected = (collectedTags: string[]) => {
    setAnyDataTags(collectedTags);
  };

  // New handler for the parsed XML object
  const handlePlateauParsed = (xmlObject: any) => {
    setPlateauXmlObject(xmlObject);
  };

  const handleAnyDataParsed = (xmlObject: any) => {
    setAnyDataXmlObject(xmlObject);
  };

  const handlePlateauTagSelected = (tag: string) => {
    setSelectedPlateauTag(tag);
  };

  const handleAnyDataTagSelected = (tag: string) => {
    setSelectedAnyDataTag(tag);
  };

  const handleSelectedTagsChange = (selectedData: { tag: string; plateauTag: string; attributeName: string }[]) => {
    setSelectedData(selectedData);
  };
  // const validateXml = async () => {
  //   try {
  //     const schema = await loadStaticFile('/schemas/test.xsd'); // スキーマファイルのパスを指定
  //     const options = {
  //       ignoreAttributes: false,
  //       format: true,
  //     };
  //     const builder = new XMLBuilder(options);
  //     const a = builder.build(plateauXmlObject);

  //     if (a) {
  //       xmlValidate();
  //     } else {
  //       alert('XML ドキュメントが未設定です。');
  //     }
  //   } catch (error) {
  //     alert('スキーマファイルの読み込みに失敗しました。');
  //     console.error(error);
  //   }
  // };

  return (
    <div>
      <div className="container mx-auto p-4 flex justify-between">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2 mr-2">
          <h2 className="block text-gray-700 text-xl font-bold mb-2">
            PLATEAU
          </h2>
          <p className="block text-gray-700 text-sm font-bold mb-2">
            CityGMLをアップロード
          </p>
          <FileUploader
            onTagsCollected={handlePlateauTagsCollected}
            onXmlParsed={handlePlateauParsed} // Passing the new handler
            accept=".gml"
          />{" "}
          <TagsComboBox
            tags={plateauTags}
            selectedTag={selectedPlateauTag}
            onTagSelected={handlePlateauTagSelected}
          />
          {/* <TagsComboBox tags={plateauTags} /> */}
        </div>

        {/* <div className="connector-line"></div> */}

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2 ml-2">
          <h2 className="block text-gray-700 text-xl font-bold mb-2">
            紐づけたいデータ
          </h2>
          <p className="block text-gray-700 text-sm font-bold mb-2">
            任意のファイルをアップロード
          </p>
          <FileUploader
            onTagsCollected={handleAnyDataTagsCollected}
            onXmlParsed={handleAnyDataParsed} // Passing the new handler
            accept=".gml,.xml,.csv,.json,.geojson"
          />
          <TagsComboBox
            tags={anyDataTags}
            selectedTag={selectedAnyDataTag}
            onTagSelected={handleAnyDataTagSelected}
          />
          {/* <TagsComboBox tags={anyDataTags} /> */}
        </div>
      </div>

      <div className="container mx-auto p-4">
      <DataTagTable
          anyDataTags={anyDataTags}
          plateauTags={plateauTags}
          onSelectedTagsChange={handleSelectedTagsChange}
        />
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {
            console.log(selectedData);
          }}
        >
          関数テスト
        </button>
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
      <div className="flex justify-center mt-4">
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={xmlValidate}
        >
          PLATEAU品質評価
        </button>
      </div>
    </div>
  );
}

export default App;
