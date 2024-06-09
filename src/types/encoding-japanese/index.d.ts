declare module 'encoding-japanese' {
  const Encoding: {
    detect: (data: Uint8Array | number[] | string) => string;
    stringToCode: (data: string) => number[];
    codeToString: (data: number[]) => string;
    convert: (data: number[], options: { to: string, from: string }) => number[];
  };
  export default Encoding;
}