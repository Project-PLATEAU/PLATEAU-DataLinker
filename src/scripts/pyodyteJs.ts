// windowオブジェクトの型定義を拡張
declare global {
  interface Window {
    xmlSchemaString: string;
    xmlString: string;
  }
}

export async function loadXSDFile(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch XSD file: ${response.statusText}`);
  }
  return await response.text();
}

(async () => {
  const xmlString = await loadXSDFile("schemas/uro/3.0/53392642_brid_6697_op.gml");
  const xmlSchemaString = await loadXSDFile("schemas/uro/3.0/urbanObject.xsd");
  // 拡張した型定義を使用してwindowオブジェクトにプロパティを追加
  window.xmlSchemaString = xmlSchemaString;
  window.xmlString = xmlString;
})();


export async function xmlValidate() {
  const pyodide = await (window as any).loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/",
  });

  await pyodide.loadPackage("micropip");
  await pyodide
    .runPythonAsync(
      `
    import sys
    import micropip
    await micropip.install('lxml')  # lxmlをインストール

    import js
    from lxml import etree

    print('a')
    etree.XMLParser(no_network=False)
    # JavaScriptの変数をPythonで使用
    schema_root = etree.XML(js.xmlSchemaString.encode("utf-8"))
    schema = etree.XMLSchema(schema_root)

    print('b')

    # バリデーションするXMLドキュメント
    doc = etree.XML(js.xmlString.encode("utf-8"))

    # バリデーション実行
    result = schema.validate(doc)  # True or False

    result
  `).then((result: any) => {
      if (result) {
        alert("PLATEAU品質評価: OK");
      } else {      
        alert("PLATEAU品質評価: NG");
      }
    })
    .catch((error: any) => {
      console.error("Validation error:", error);
      alert(
        "バリデーションエラーが発生しました。詳細はコンソールを確認してください。"
      );
    });
}
