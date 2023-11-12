import { BOARD_WIDTH, BOARD_HEIGHT } from '../GlobalParameters'
import { BoardInfo } from '../entities/BoardInfo'
import { TileInfo } from '../entities/TileInfo'

function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

export class BoardApi {
  constructor() { }

  async getBoard(): Promise<BoardInfo> {
    const rows = BOARD_HEIGHT
    const cols = BOARD_WIDTH
    const tiles: TileInfo[][] = []

    for (let i = 0; i < BOARD_HEIGHT; i++) {
      tiles[i] = []
      for (let j = 0; j < BOARD_WIDTH; j++) {
        const texture_num = ['01', '02', '03', '04', '05'][
          getRandomInteger(0, 5)
        ]
        const texture = `/assets/tiles/${texture_num}.png`

        const tile = new TileInfo(texture, i, j)
        tiles[i][j] = tile
      }
    }

    return new BoardInfo(rows, cols, tiles)
  }
}
