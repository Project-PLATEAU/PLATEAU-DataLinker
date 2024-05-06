// windowオブジェクトの型定義を拡張
declare global {
  interface Window {
    xmlSchemaString: string;
  }
}

// JavaScriptで定義された変数
const xmlSchemaString = `\
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="a" type="xs:int"/>
</xs:schema>
`;

// 拡張した型定義を使用してwindowオブジェクトにプロパティを追加
window.xmlSchemaString = xmlSchemaString;

export async function xmlValidate() {
  const pyodide = await (window as any).loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/"
  });

  await pyodide.loadPackage('micropip');
  await pyodide.runPythonAsync(`
    import sys
    import micropip
    await micropip.install('lxml')  # lxmlをインストール

    import js
    from lxml import etree

    # JavaScriptの変数をPythonで使用
    schema_root = etree.XML(js.xmlSchemaString)
    schema = etree.XMLSchema(schema_root)

    # バリデーションするXMLドキュメント
    doc = etree.XML("<a>5</a>")

    # バリデーション実行
    result = schema.validate(doc)  # True or False
    result
  `).then((result: any) => {
    if (result) {
      alert("PLATEAU品質評価: OK");
    } else {
      alert("PLATEAU品質評価: NG");
    }
  });
}