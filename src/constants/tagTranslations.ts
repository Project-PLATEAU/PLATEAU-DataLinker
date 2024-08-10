const tagTranslations: { [key: string]: string } = {
  "core:creationDate": "データ作成日",
  "core:terminationDate": "データ削除日",
  "bldg:Building[@gml:id]": "GML ID",
  "uro:buildingID": "建物ID",
  "gml:posList": "建物の座標(経度、緯度)",
  "bldg:measuredHeight": "建物の高さ(m)",
  "bldg:storeysAboveGround": "地上階数",
  "bldg:storeysBelowGround": "地下階数",
  "xAL:CountryName": "国名",
  "xAL:LocalityName": "建物の住所(市町村、区、郡、市)",
  "gml:name": "建物の名称",
  "gml:description": "建物の説明",

  "uro:vacancy": "空家状態",
  "uro:buildingCoverageRate": "建蔽率",
  "uro:floorAreaRate": "容積率",
  "uro:specifiedBuildingCoverageRate": "指定建蔽率",
  "uro:specifiedFloorAreaRate": "指定容積率",
  "uro:surveyYear": "調査年",
  "uro:lodType": "LODの区分",
  "uro:realEstateIDOfBuilding": "建築物全体の不動産ID",
  "uro:numberOfBuildingUnit":  "建築物の区分所有の数量",
  "uro:numberOfRealEstateIDOfLand": "建築物のある土地（筆）の数量",
  "uro:matchingScore": "不動産IDマッチングスコア",
  "uro:buildingArea": "建物の面積(m2)",
  "uro:buildingAreaCoefficient": "延べ面積換算係数",
  "uro:realEstateIDOfLand": "土地の不動産ID",
};


export const ALLOWED_KEYS = [
  "gen:stringAttribute[@name]",
  "bldg:Building[@gml:id]",
  "uro:buildingID",
  "gml:posList",
  "bldg:measuredHeight",
  "xAL:LocalityName",
  "gml:name",
];

export default tagTranslations;