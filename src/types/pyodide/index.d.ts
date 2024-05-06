// @types/pyodide/index.d.ts

declare module 'pyodide' {
  export function loadPyodide(config: { indexURL: string }): Promise<any>;
}