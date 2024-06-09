import React, { useState, useMemo } from "react";

// プロパティの型定義
interface CsvDataItemTableProps {
  anyDataTags: string[];
  onSelectedTagsChange: (
    selectedData: { tag: string; index: number }[]
  ) => void; // 親コンポーネントに選択された行の情報を通知するためのコールバック
}

// チェックボックスコンポーネント
/**
 * チェックボックスコンポーネント
 * @param {boolean} checked - チェックボックスの初期状態
 * @param {function} onChange - チェックボックスの状態が変更されたときに呼び出される関数
 */
const Checkbox = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    className="form-checkbox h-5 w-5 text-gray-600"
  />
);

// データタグテーブルコンポーネント
/**
 * データタグテーブルコンポーネント
 * @param {string[]} anyDataTags - 任意のデータタグのリスト
 * @param {function} onSelectedTagsChange - 選択されたタグの情報を親コンポーネントに通知するためのコールバック関数
 */
const CsvDataItemTable: React.FC<CsvDataItemTableProps> = ({
  anyDataTags,
  onSelectedTagsChange,
}) => {
  const tagTranslations: { [key: string]: string } = {
    "gml:id": "GML ID",
    "gml:posList": "建物の座標",
    "bldg:measuredHeight": "建物の高さ",
    "xAL:LocalityName": "建物の住所",
  };

  const [selectedData, setSelectedData] = useState<
    { tag: string; index: number }[]
  >([]);
  // const [attributeNames, setAttributeNames] = useState<string[]>(
  //   new Array(anyDataTags.length).fill("")
  // );

  // anyDataTagsが変更されたときにselectedDataを初期化する
  // useMemo(() => {
  //   setSelectedData([]);
  //   setAttributeNames(new Array(anyDataTags.length).fill(""));
  //   onSelectedTagsChange([]);
  // }, [anyDataTags]);

  // チェックボックスの変更を処理する関数
  /**
   * チェックボックスの状態が変更されたときに呼び出される関数
   * @param {string} tag - 任意のデータタグ
   * @param {boolean} isChecked - チェックボックスの新しい状態
   * @param {number} index - 行番号
   */
  const handleCheckboxChange = ({
    tag,
    isChecked,
    index,
  }: {
    tag: string;
    isChecked: boolean;
    index: number;
  }) => {
    let updatedSelectedData = [...selectedData];
    if (isChecked) {
      updatedSelectedData.push({
        tag,
        index,
      });
    } else {
      updatedSelectedData = updatedSelectedData.filter(
        (data) => data.tag !== tag
      );
    }
    setSelectedData(updatedSelectedData);
    onSelectedTagsChange(updatedSelectedData);
  };

  return (
    <div
      className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
      style={{ maxHeight: "260px", overflowY: "auto" }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead
          className="bg-gray-50"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "#f9fafb",
          }}
        >
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              選択
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              データ項目
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {anyDataTags.map((tag, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Checkbox
                  checked={selectedData.some((data) => data.tag === tag)}
                  onChange={(e) =>
                    handleCheckboxChange({
                      tag,
                      isChecked: e.target.checked,
                      index,
                    })
                  }
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {tagTranslations[tag] || tag}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvDataItemTable;
