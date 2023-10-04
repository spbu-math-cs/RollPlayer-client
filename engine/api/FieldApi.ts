export interface ICellInfo {
  texture: string
}

export interface IFieldInfo {
  width: number
  height: number
  grid: ICellInfo[]
}

export class FieldApi {
  constructor() {}

  async getField(): Promise<IFieldInfo> {
    return { width: 0, height: 0, grid: [] }
  }
}
