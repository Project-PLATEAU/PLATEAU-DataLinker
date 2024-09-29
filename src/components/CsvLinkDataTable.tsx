import React, { useState } from "react";
import tagTranslations from "../constants/tagTranslations";

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

// タグの変換関数
const transformTag = (tag: string): string => {
  if (tag.includes("　@_")) {
    const [key, value] = tag.split("　@_");
    return tagTranslations[key] ? `${tagTranslations[key]}　${value}` : tag;
  } else {
    const match = tag.match(/gen:stringAttribute name="([^"]+)"/);
    return match ? match[1] : tag;
  }
};

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
  const [selectedData, setSelectedData] = useState<
    { tag: string; index: number }[]
  >([]);

  // チェックボックスの変更を処理する関数
  /**
   * チェックボックスの状態が変更されたときに呼び出される
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
    const transformedTag = transformTag(tag);
    const updatedSelectedData = isChecked
      ? [...selectedData, { tag: transformedTag, index }]
      : selectedData.filter((data) => data.tag !== transformedTag);

    // 状態を更新
    setSelectedData(updatedSelectedData);

    // 親コンポーネントに変更を通知
    onSelectedTagsChange(updatedSelectedData);
  };

  // 全選択・全解除のハンドラー
  const handleSelectAllToggle = () => {
    const allSelectedData = selectedData.length === anyDataTags.length
      ? []
      : anyDataTags.map((tag, index) => ({
          tag: transformTag(tag),
          index,
        }));

    setSelectedData(allSelectedData);
    onSelectedTagsChange(allSelectedData);
  };

  return (
    <div
      className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
      style={{ maxHeight: "500px", overflow: "auto" }}
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
            <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              選択
              <div className="px-1 pt-1">
                <Checkbox
                  checked={selectedData.length === anyDataTags.length}
                  onChange={handleSelectAllToggle}
                />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-s font-medium text-gray-500 uppercase tracking-wider">
              データ項目
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {anyDataTags.map((tag, index) => {
            const transformedTag = transformTag(tag);
            return (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Checkbox
                    checked={selectedData.some((data) => data.tag === transformedTag)}
                    onChange={(e) =>
                      handleCheckboxChange({
                        tag,
                        isChecked: e.target.checked,
                        index,
                      })
                    }
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap" title={transformedTag}>
                  {tagTranslations[transformedTag.split("　@_")[0]] || transformedTag}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CsvDataItemTable;