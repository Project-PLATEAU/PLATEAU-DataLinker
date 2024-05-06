type StringType = 'キーワード' | '座標';

export function analyzeString(input: string): StringType {
    // 座標かどうかを判断する正規表現
    const coordinatePattern = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;

    // 正規表現にマッチする場合は座標と判断
    if (coordinatePattern.test(input.trim())) {
        return '座標';
    }

    // それ以外はキーワードと判断
    return 'キーワード';
}

// 使用例
console.log(analyzeString("スカイツリー店"));  // 出力: キーワード
console.log(analyzeString("36.21451, 126.24512"));  // 出力: 座標