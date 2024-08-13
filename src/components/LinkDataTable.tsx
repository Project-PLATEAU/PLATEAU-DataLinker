import React, { useState, useMemo } from "react";

// プロパティの型定義
interface DataTagTableProps {
  anyDataTags: string[];
  onSelectedTagsChange: (
    selectedData: { tag: string; plateauTag: string; attributeName: string; index: number }[]
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

// テキスト入力コンポーネント
/**
 * テキスト入力コンポーネント
 * @param {string} value - 入力フィールドの初期値
 * @param {function} onChange - 入力フィールド��値が変更されたときに呼び出される関数
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
    { tag: string; plateauTag: string; attributeName: string; index: number }[]
  >([]);
  const [attributeNames, setAttributeNames] = useState(anyDataTags);


  // anyDataTagsが変更されたときにselectedDataを初期化する
  useMemo(() => {
    setSelectedData([]);
    setAttributeNames(anyDataTags);
    onSelectedTagsChange([]);
  }, [anyDataTags]);


  // チェックボックスの変更を処理する関数
  /**
   * チェックボックスの状態が変更されたときに呼び出される関数
   * @param {string} tag - 任意のデータタグ
   * @param {boolean} isChecked - チェックボックスの新しい状態
   * @param {number} index - 行番号
   * @param {string} plateauTag - 選択されているPLATEAUタグの値
   * @param {string} attributeName - 入力されている属性名
   */
  const handleCheckboxChange = ({
    tag,
    isChecked,
    index,
    plateauTag,
    attributeName,
  }: {
    tag: string;
    isChecked: boolean;
    index: number;
    plateauTag: string;
    attributeName: string;
  }) => {
    let updatedSelectedData = [...selectedData];
    if (isChecked) {
      updatedSelectedData.push({
        tag,
        plateauTag,
        attributeName,
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

    const updatedSelectedData = selectedData.map((data) =>
      data.index === index ? { ...data, attributeName: value } : data
    );

    setSelectedData(updatedSelectedData);
    onSelectedTagsChange(updatedSelectedData);
  };

  return (
    <div
      className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
      style={{ maxHeight: "450px", overflow: "auto" }}
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
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    handleCheckboxChange({
                      tag,
                      isChecked: e.target.checked,
                      index,
                      plateauTag: "gen:stringAttribute",
                      attributeName: attributeNames[index],
                    })
                  }
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{tag}</td>
              <td className="px-6 py-4 whitespace-nowrap">{'Generic属性'}</td>
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
