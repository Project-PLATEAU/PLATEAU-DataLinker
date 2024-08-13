import React, { useState, useEffect } from "react";
import tagTranslations, { ALLOWED_KEYS } from "../constants/tagTranslations";

interface TagsComboBoxProps {
  tags: string[];
  selectedTag: string;
  onTagSelected: (tag: string) => void;
}

/**
 * TagsComboBoxコンポーネント
 *
 * このコンポーネントは、ユーザーが複数のタグから一つを選択できるドロップダウンメニューを提供します。
 *
 * @param {TagsComboBoxProps} props - コンポーネントのプロパティ
 * @param {string[]} props.tags - 利用可能なタグのリスト
 * @param {string} props.selectedTag - 現在選択されているタグ
 * @param {function} props.onTagSelected - タグが選択されたときに呼び出されるコールバック関数
 *
 * @returns {JSX.Element} - TagsComboBoxコンポーネントのJSX要素
 */
const PlateauTagsComboBox: React.FC<TagsComboBoxProps> = ({
  tags,
  selectedTag,
  onTagSelected,
}) => {
  const [currentTag, setCurrentTag] = useState<string>(selectedTag);
  const [translations, setTranslations] = useState<{ [key: string]: string }>(tagTranslations);

  // タグが選択された時の処理
  const handleTagSelected = (tag: string) => {
    onTagSelected(tag);
    setCurrentTag(tag);
    
  };

  // タグの変換関数
  const transformTag = (tag: string): string => {
    if(tag.includes("　@_")) {
      const splitTag = tag.split("　@_");
      const key = splitTag[0];
      return key;
    } else {
      return tag;
    }
  };

  useEffect(() => {
    // 許可されたタグまたは特定のパターンに一致するタグをフィルタリング
    const filteredTags = tags.filter(
      (tag) => ALLOWED_KEYS.includes(transformTag(tag)) || /gen:stringAttribute name="[^"]+"/.test(tag)
    );

    // 新しい翻訳を追加
    const newTranslations = { ...tagTranslations };
    filteredTags.forEach((tag) => {
      if(tag.includes("　@_uom")) {
        const splitTag = tag.split("　@_");
        const key = splitTag[0];
        if (!newTranslations[key]) {
          newTranslations[tag] = key;
        }
      } else {
      const match = tag.match(/gen:stringAttribute name="([^"]+)"/);
      if (match && !newTranslations[tag]) {
        newTranslations[tag] = match[1];
      }
    }});

    setTranslations(newTranslations);
  }, [tags]);

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tag-select">
        紐づける属性を選択
      </label>
      <select
        value={currentTag}
        onChange={(e) => handleTagSelected(e.target.value)}
        id="tag-select"
        className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
        size={10}
      >
        {tags
          .filter((tag) => ALLOWED_KEYS.includes(transformTag(tag)) || /gen:stringAttribute name="[^"]+"/.test(tag))
          .map((tag, index) => (
            <option title={tag} key={index} value={tag}>
              {translations[transformTag(tag)] || tag}
            </option>
          ))}
      </select>
      <div className="mt-4">
        <h3 className="text-gray-700 text-sm font-bold mb-2">
          選択された紐付けのキーとなる属性:
        </h3>
        <p className="text-gray-700 text-sm">{translations[currentTag] || currentTag}</p>
      </div>
    </div>
  );
};

export default PlateauTagsComboBox;