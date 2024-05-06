import React, { useState } from 'react';

// プロパティの型定義
interface DataTagTableProps {
  anyDataTags: string[];
  plateauTags: string[];
  onSelectedTagsChange: (selectedData: { tag: string; plateauTag: string; attributeName: string }[]) => void; // 親コンポーネントに選択された行の情報を通知するためのコールバック
}

// テスト用のタグ配列
const plateauTags = ['gen:stringAttribute', 'gen:intAttribute', 'gen:doubleAttribute'];

// チェックボックスコンポーネント
const Checkbox = ({ checked, onChange }: { checked: boolean; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <input type="checkbox" checked={checked} onChange={onChange} className="form-checkbox h-5 w-5 text-gray-600" />
);

// PLATEAUタグを選択するためのセレクトボックスコンポーネント
const SelectPlateauTag = ({ tags, value, onChange }: { tags: string[]; value: string; onChange: (value: string) => void }) => (
  <select
    className="block appearance-none w-full bg-white border border-gray-300 leading-tight focus:outline-none focus:shadow-outline"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    {tags.map((tag, index) => (
      <option key={index} value={tag}>
        {tag}
      </option>
    ))}
  </select>
);

// テキスト入力コンポーネント
const TextInput = ({ value = '', onChange }: { value?: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <input type="text" value={value} onChange={onChange} className="block appearance-none w-full bg-white border border-gray-300 leading-tight focus:outline-none focus:shadow-outline" />
);



// データタグテーブルコンポーネント
const DataTagTable: React.FC<DataTagTableProps> = ({ anyDataTags, plateauTags, onSelectedTagsChange }) => {
  const [selectedData, setSelectedData] = useState<{ tag: string; plateauTag: string; attributeName: string }[]>([]);
  const [attributeNames, setAttributeNames] = useState<string[]>(new Array(anyDataTags.length).fill(''));

  // チェックボックスの変更を処理する関数
  const handleCheckboxChange = (tag: string, isChecked: boolean, plateauTag: string, attributeName: string) => {
    const newData = { tag, plateauTag, attributeName };
    const updatedSelectedData = isChecked
      ? [...selectedData, newData]
      : selectedData.filter(data => data.tag !== tag);
    setSelectedData(updatedSelectedData);
    onSelectedTagsChange(updatedSelectedData);
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributeNames = [...attributeNames];
    newAttributeNames[index] = value;
    setAttributeNames(newAttributeNames);

    // 属性名が変更された際に、選択されたデータを更新
    const newData = selectedData.map(data => {
      if (data.tag === anyDataTags[index]) {
        return { ...data, attributeName: value };
      }
      return data;
    });
    setSelectedData(newData);
    onSelectedTagsChange(newData);
  };

  const handlePlateauTagChange = (index: number, newPlateauTag: string) => {
    const tag = anyDataTags[index];
    const attributeName = attributeNames[index];
    const newData = selectedData.map(data => {
      if (data.tag === tag) {
        return { ...data, plateauTag: newPlateauTag };
      }
      return data;
    });
    setSelectedData(newData);
    onSelectedTagsChange(newData);
  };
  

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg" style={{ maxHeight: '260px', overflowY: 'auto' }}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50" style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f9fafb' }}>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">選択</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任意のデータタグ</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLATEAUタグ</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">属性名</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {anyDataTags.map((tag, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Checkbox
                  checked={selectedData.some(data => data.tag === tag)}
                  onChange={(e) => handleCheckboxChange(tag, e.target.checked, plateauTags[index], attributeNames[index])}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{tag}</td>
              <td className="px-6 py-4 whitespace-nowrap"><SelectPlateauTag
                tags={plateauTags}
                value={selectedData.find(data => data.tag === tag)?.plateauTag || ''}
                onChange={(newPlateauTag) => handlePlateauTagChange(index, newPlateauTag)}
              /></td>
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