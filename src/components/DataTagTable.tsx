import React, { useState } from "react";

// プロパティの型定義
interface DataTagTableProps {
  anyDataTags: string[];
  // plateauTags: string[];
  onSelectedTagsChange: (
    selectedData: { tag: string; plateauTag: string; attributeName: string }[]
  ) => void; // 親コンポーネントに選択された行の情報を通知するためのコールバック
}

const plateauTags = [
  {
    value: "gen:stringAttribute",
    label: "Generic属性",
    explanation: "独自の属性として追加可能なタグ",
  },
];

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

// PLATEAUタグを選択するためのセレクトボックスコンポーネント
/**
 * PLATEAUタグを選択するためのセレクトボックスコンポーネント
 * @param {string[]} tags - 選択可能なタグのリスト
 * @param {string} value - 現在選択されているタグの値
 * @param {string[]} option - 各タグの説明
 * @param {function} onChange - タグが選択されたときに呼び出される関数
 */
const SelectPlateauTag = ({
  tags,
  value,
  option,
  onChange,
}: {
  tags: string[];
  value: string;
  option: string[];
  onChange: (value: string) => void;
}) => (
  <select
    className="block appearance-none w-full bg-white border border-gray-300 leading-tight focus:outline-none focus:shadow-outline"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    {tags.map((tag, index) => (
      <option key={index} value={tag} title={option[index]}>
        {tag}
      </option>
    ))}
  </select>
);

// テキスト入力コンポーネント
/**
 * テキスト入力コンポーネント
 * @param {string} value - 入力フィールドの初期値
 * @param {function} onChange - 入力フィールドの値が変更されたときに呼び出される関数
 */
const TextInput = ({
  value = "",
  onChange,
}: {
  value?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    className="block appearance-none w-full bg-white border border-gray-300 leading-tight focus:outline-none focus:shadow-outline"
  />
);

// データタグテーブルコンポーネント
/**
 * データタグテーブルコンポーネント
 * @param {string[]} anyDataTags - 任意のデータタグのリスト
 * @param {function} onSelectedTagsChange - 選択されたタグの情報を親コンポーネントに通知するためのコールバック関数
 */
const DataTagTable: React.FC<DataTagTableProps> = ({
  anyDataTags,
  onSelectedTagsChange,
}) => {
  const [selectedData, setSelectedData] = useState<
    { tag: string; plateauTag: string; attributeName: string }[]
  >([]);
  const [attributeNames, setAttributeNames] = useState<string[]>(
    new Array(anyDataTags.length).fill("")
  );
  const [plateauTagSelections, setPlateauTagSelections] = useState<string[]>(
    new Array(anyDataTags.length).fill("")
  );

  // チェックボックスの変更を処理する関数
  /**
   * チェックボックスの状態が変更されたときに呼び出される関数
   * @param {string} tag - 任意のデータタグ
   * @param {boolean} isChecked - チェックボックスの新しい状態
   */
  const handleCheckboxChange = (tag: string, isChecked: boolean) => {
    let updatedSelectedData = [...selectedData];
    if (isChecked) {
      updatedSelectedData.push({
        tag,
        plateauTag: "",
        attributeName: "",
      });
    } else {
      updatedSelectedData = updatedSelectedData.filter(
        (data) => data.tag !== tag
      );
    }
    setSelectedData(updatedSelectedData);
    onSelectedTagsChange(updatedSelectedData);
  };

  // PLATEAUタグの選択を処理する関数
  /**
   * PLATEAUタグの選択が変更されたときに呼び出される関数
   * @param {number} index - 任意のデータタグのインデックス
   * @param {string} value - 新しく選択されたPLATEAUタグの値
   */
  const handlePlateauTagChange = (index: number, value: string) => {
    const updatedSelections = [...plateauTagSelections];
    updatedSelections[index] = value;
    setPlateauTagSelections(updatedSelections);

    const updatedSelectedData = selectedData.map((data, i) =>
      i === index ? { ...data, plateauTag: value } : data
    );
    setSelectedData(updatedSelectedData);
    onSelectedTagsChange(updatedSelectedData);
  };

  // 属性名の入力を処理する関数
  /**
   * 属性名の入力が変更されたときに呼び出される関数
   * @param {number} index - 任意のデータタグのインデックス
   * @param {string} value - 新しく入力された属性名
   */
  const handleAttributeNameChange = (index: number, value: string) => {
    const updatedAttributeNames = [...attributeNames];
    updatedAttributeNames[index] = value;
    setAttributeNames(updatedAttributeNames);

    const updatedSelectedData = selectedData.map((data, i) =>
      i === index ? { ...data, attributeName: value } : data
    );
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
              任意のデータタグ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PLATEAUタグ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              属性名
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
                    handleCheckboxChange(tag, e.target.checked)
                  }
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{tag}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <SelectPlateauTag
                  tags={plateauTags.map((t) => t.value)}
                  value={plateauTagSelections[index]}
                  option={plateauTags.map((t) => t.explanation)}
                  onChange={(value) => handlePlateauTagChange(index, value)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TextInput
                  value={attributeNames[index]}
                  onChange={(e) =>
                    handleAttributeNameChange(index, e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTagTable;
