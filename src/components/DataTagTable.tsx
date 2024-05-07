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
  {
    value: "bldg:address",
    label: "address属性",
    explanation: "住所を表す属性",
  },
];

// チェックボックスコンポーネント
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
// SelectPlateauTag コンポーネントは、PLATEAUタグを選択するためのセレクトボックスを提供します。
// `tags` は選択可能なタグのリスト、`value` は現選択されているタグの値、`onChange` はタグが選択さ���たときに呼び出される関数です。
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
    className="block appearance-none w-full bg-white border border-gray-300 leading-tight focus:outline-none focus:shadow-outline" // セレクトボックスのスタイルを定義
    value={value} // 現在選択されている値をセレクトボックスに設定
    onChange={(e) => onChange(e.target.value)} // 選択された値が変更されたときにonChange関数を呼び出す
  >
    {tags.map(
      (
        tag,
        index // `tags` 配列をループして、各タグに対して<option>要素を生成
      ) => (
        <option key={index} value={tag} title={option[index]}>
          {tag}
        </option>
      )
    )}
  </select>
);

// テキスト入力コンポーネント
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
  // チェックボックスの状態が変更されたときに呼び出される関数
  const handleCheckboxChange = (
    tag: string,
    isChecked: boolean,
    plateauTag: string,
    attributeName: string
  ) => {
    // 新しいデータオブジェクトを作成
    const newData = { tag, plateauTag, attributeName };
    // チェックされている場合は新しいデータを追加し、そうでない場合は既存のデータから削除
    const updatedSelectedData = isChecked
      ? [...selectedData, newData]
      : selectedData.filter((data) => data.tag !== tag);
    // 更新されたデータを状態に設定
    setSelectedData(updatedSelectedData);
    // 親コンポーネントに更新されたデータを通知
    onSelectedTagsChange(updatedSelectedData);
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributeNames = [...attributeNames];
    newAttributeNames[index] = value;
    setAttributeNames(newAttributeNames);

    // 属性名が変更された際に、選択されたデータを更新
    const newData = selectedData.map((data) => {
      if (data.tag === anyDataTags[index]) {
        return { ...data, attributeName: value };
      }
      return data;
    });
    setSelectedData(newData);
    onSelectedTagsChange(newData);
  };

  const handlePlateauTagChange = (index: number, newPlateauTag: string) => {
    const newPlateauTags = [...plateauTagSelections];
    newPlateauTags[index] = newPlateauTag;
    setPlateauTagSelections(newPlateauTags);

    if (selectedData.some((data) => data.tag === anyDataTags[index])) {
      const newData = selectedData.map((data) => {
        if (data.tag === anyDataTags[index]) {
          return { ...data, plateauTag: newPlateauTag };
        }
        return data;
      });
      setSelectedData(newData);
      onSelectedTagsChange(newData);
    }
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
                  // `checked`プロパティは、`selectedData`配列内に現在のタグが存在するかどうかを確認します。
                  // 存在する場合はチェックボックスがチェックされます。
                  checked={selectedData.some((data) => data.tag === tag)}
                  // `onChange`イベントは、チェックボックスの状態が変更されたときに呼び出されます。
                  // `handleCheckboxChange`関数に現在のタグ、チェック状態、対応するPLATEAUタグの値、属性名を渡します。
                  onChange={(e) =>
                    handleCheckboxChange(
                      tag,
                      e.target.checked,
                      plateauTagSelections[index],
                      attributeNames[index]
                    )
                  }
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{tag}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <SelectPlateauTag
                  tags={plateauTags.map((tag) => tag.label)}
                  // 選択されたデータから、現在のタグに対応するPLATEAUタグを取得します。見つからない場合は空文字列を返します。
                  value={plateauTagSelections[index]}
                  option={plateauTags.map((tag) => tag.explanation)}
                  // PLATEAUタグが変更された場合、handlePlateauTagChange関数を呼び出して、新しいタグとそのインデックスを渡します。
                  onChange={(newPlateauTag) =>
                    handlePlateauTagChange(index, newPlateauTag)
                  }
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TextInput
                  value={attributeNames[index]}
                  onChange={(e) => handleAttributeChange(index, e.target.value)}
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
