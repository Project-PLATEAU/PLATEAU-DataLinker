const tagTranslations: { [key: string]: string } = {
  // core
  "core:creationDate": "データ作成日",
  "core:terminationDate": "データ削除日",

  // gml
  "gml:posList": "建物の座標(経度、緯度)",
  "gml:name": "建物の名称",
  "gml:description": "建物の説明",

  // bldg
  "gml:id": "GML ID",
  "bldg:class": "建物の分類",
  "bldg:usage": "建物の用途",
  "bldg:measuredHeight": "建物の高さ(m)",
  "bldg:storeysAboveGround": "地上階数",
  "bldg:storeysBelowGround": "地下階数",

  // xAL
  "xAL:CountryName": "国名",
  "xAL:LocalityName": "建物の住所(市町村、区、郡、市)",

  // uro
  "uro:buildingID": "建物ID",
  "uro:prefecture": "都道府県コード",
  "uro:city": "市区町村コード",
  "uro:buildingRoofEdgeArea": "建物の屋根の面積(m2)",
  "uro:fireproofStructureType": "耐火構造タイプ",
  "uro:urbanPlanType": "都市計画タイプ",
  "uro:areaClassificationType": "地域分類タイプ",
  "uro:districtsAndZonesType": "地区・区域タイプ",
  "uro:landUseType": "土地利用タイプ",
  "uro:detailedUsage": "詳細用途",
  "uro:description": "説明",
  "uro:rank": "ランク",
  "uro:depth": "深さ(m)",
  "uro:adminType": "行政区分",
  "uro:scale": "規模",
  "uro:geometrySrcDesc": "幾何の源原点資料に関する説明",
  "uro:thematicSrcDesc": "主題の源原点資料に関する説明",
  "uro:appearanceSrcDesc": "外観の源原点資料に関する説明",
  "uro:lod1HeightType": "LOD1の高さ区分",
  "uro:lod2HeightType": "LOD2の高さ区分",
  "uro:lodType": "LODの区分",
  "uro:realEstateIDOfBuilding": "建築物全体の不動産ID",
  "uro:numberOfBuildingUnit":  "建築物の区分所有の数量",
  "uro:numberOfRealEstateIDOfLand": "建築物のある土地（筆）の数量",
  "uro:matchingScore": "不動産IDマッチングスコア",
  "uro:buildingArea": "建物の面積(m2)",
  "uro:buildingAreaCoefficient": "延べ面積換算係数",
  "uro:realEstateIDOfLand": "土地の不動産ID",
  "uro:buildingCoverageRate": "建蔽率",
  "uro:floorAreaRate": "容積率",
  "uro:specifiedBuildingCoverageRate": "指定建蔽率",
  "uro:specifiedFloorAreaRate": "指定容積率",
  "uro:surveyYear": "調査年",
  "uro:vacancy": "空家状態",
  "uro:buildingDataQualityAttribute": "建物のデータ品質属性",
  "uro:key": "キー",
  "uro:codeValue": "コード値",
  "uro:duration": "期間",
  "uro:srcScale": "ソーススケール",
  "uro:areaType": "地域タイプ",
};


export const ALLOWED_KEYS = [
  "gml:id",
  "uro:buildingID",
  "gml:posList",
  "bldg:measuredHeight",
  "xAL:LocalityName",
  "gml:name",
  //gen:stringAttributeは出力対象だが name=""があるため別途各コンポーネントで定義
];

export default tagTranslations;