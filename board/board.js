import * as PIXI from "pixi.js"
import * as TWEEN from "@tweenjs/tween.js"
import React from "react";

const CELL_SIZE = 16;
const SCALE = 4;

const BOARD_WIDTH = 16;
const BOARD_HEIGHT = 12;

const COMMON_TINT = 0xB0B0B0;
const HIGHLIGHT_TINT = 0xFFFFFF;

class Player {
    row_pos;
    col_pos;
    graphics;

    board = null

    constructor(board) {
        this.board = board

        const graphics = new PIXI.Graphics();

        this.row_pos = board.getRandomInteger(0, BOARD_HEIGHT);
        this.col_pos = board.getRandomInteger(0, BOARD_WIDTH);
        board.setPositionOnBoard(graphics, this.row_pos, this.col_pos);

        const player_color = board.getRandomInteger(0xC0C0C0, 0xFFFFFF + 1);
        const outline_color = board.getRandomInteger(0xC0C0C0, 0xFFFFFF + 1);

        graphics.lineStyle(2, outline_color, 1);
        graphics.beginFill(player_color, 1);
        graphics.drawCircle(0, 0, CELL_SIZE / 3 * SCALE);
        graphics.endFill();

        graphics.eventMode = 'static';
        graphics.cursor = 'pointer';
        graphics.on('pointerdown', board.onDragStart, graphics);

        graphics.zIndex = BOARD_WIDTH * BOARD_HEIGHT + 1;

        graphics.player_ref = this;
        this.graphics = graphics;
    }

    moveTo(row, col) {
        this.row_pos = row;
        this.col_pos = col;

        this.board.setPositionOnBoard(this.graphics, row, col, TWEEN.Easing.Elastic.Out);
    }

    dropCurrentMove() {
        this.board.setPositionOnBoard(this.graphics, this.row_pos, this.col_pos, TWEEN.Easing.Elastic.Out);
    }
}


export default class BoardPIXI extends React.Component {
    app = null
    board = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH));
    board_container = new PIXI.Container();
    dragTarget = null;
    canvasRef = React.createRef();
    players = [];

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        if (this.app != null) {
            return
        }

        this.app = new PIXI.Application({
            backgroundColor: '#CCCCFF',
            width: window.innerWidth,
            height: window.innerHeight
        });
        this.app.stage.sortableChildren = true;
        this.canvasRef.current.appendChild(this.app.view);

        this.board_container.sortableChildren = true;
        this.board_container.x = this.app.screen.width / 2;
        this.board_container.y = this.app.screen.height / 2;

        this.app.stage.addChild(this.board_container);

        this.createBackground();
        this.createBoard(/* here goes texture map */ null);

        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        this.app.stage.on('pointerup', this.onDragEnd);
        this.app.stage.on('pointerupoutside', this.onDragEnd);

        window.addEventListener('keydown', (kEvent) => {
            const key = kEvent.key;
            if (key == 'f') {
                this.addPlayer();
            } else if (key == 'j') {
                this.removePlayer();
            }
        });
    }

    getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setPositionOnBoard(obj, row, col, easing = null, timeout = 1000) {
        const target_x = (col * CELL_SIZE + CELL_SIZE / 2) * SCALE;
        const target_y = (row * CELL_SIZE + CELL_SIZE / 2) * SCALE;

        if (!easing) {
            obj.x = target_x;
            obj.y = target_y;
            return;
        }

        const coords = { x: obj.x, y: obj.y }

        const tween = new TWEEN.Tween(coords, false)
          .to({ x: target_x, y: target_y }, timeout)
          .easing(easing)
          .onUpdate(() => {
              obj.x = coords.x;
              obj.y = coords.y;
          })
          .start()

        function animate(time) {
            tween.update(time)
            requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
    }

    getNearestCell(dragTarget) {
        let row = Math.round((dragTarget.y / SCALE - CELL_SIZE / 2) / CELL_SIZE);
        row = Math.max(0, row);
        row = Math.min(BOARD_HEIGHT - 1, row);

        let col = Math.round((dragTarget.x / SCALE - CELL_SIZE / 2) / CELL_SIZE);
        col = Math.max(0, col);
        col = Math.min(BOARD_WIDTH - 1, col);

        return [ row, col ];
    }

    createBackground() {
        const texture = PIXI.Texture.from('./board/assets/background.png');

        const background = new PIXI.Sprite(
          texture,
          this.app.screen.width,
          this.app.screen.height
        );

        background.anchor.set(0.5);
        background.x = this.app.screen.width / 2;
        background.y = this.app.screen.height / 2;
        background.scale.set(1.35);
        background.tint = COMMON_TINT;
        background.zIndex = -1;

        this.app.stage.addChild(background);
    }

    createBoard(textureMap) {
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            for (let j = 0; j < BOARD_WIDTH; j++) {
                const texture_num = ['01', '02', '03', '04', '05'][this.getRandomInteger(0, 5)];
                const texture = PIXI.Texture.from(`./board/assets/tiles${texture_num}.png`);
                texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

                const tile = new PIXI.Sprite(
                  texture,
                  this.app.screen.width,
                  this.app.screen.height
                );

                tile.anchor.set(0.5);
                this.setPositionOnBoard(tile, i, j);
                tile.scale.set(SCALE);
                tile.tint = COMMON_TINT;

                this.board_container.addChild(tile);

                (this.board)[i][j] = tile;
            }
        }

        this.board_container.pivot.x = this.board_container.width / 2;
        this.board_container.pivot.y = this.board_container.height / 2;
    }

    onDragMove(event) {
        if (this.dragTarget) {
            let [ row, col ] = this.getNearestCell(this.dragTarget);
            this.board[row][col].scale.set(SCALE);
            this.board[row][col].tint = COMMON_TINT;
            this.board[row][col].zIndex = row * BOARD_WIDTH + col;

            this.dragTarget.parent.toLocal(event.global, null, this.dragTarget.position);

            [ row, col ] = this.getNearestCell(this.dragTarget);
            this.board[row][col].scale.set(SCALE * 1.75);
            this.board[row][col].tint = HIGHLIGHT_TINT;
            this.board[row][col].zIndex = BOARD_WIDTH * BOARD_HEIGHT;
        }
    }

    onDragStart() {
        this.dragTarget = this.onDragStart;
        this.dragTarget.alpha = 0.75;
        this.app.stage.on('pointermove', this.onDragMove);
    }

    onDragEnd() {
        if (this.dragTarget) {
            this.app.stage.off('pointermove', this.onDragMove);
            this.dragTarget.alpha = 1;

            let [ row, col ] = this.getNearestCell(this.dragTarget);

            this.board[row][col].scale.set(SCALE);
            this.board[row][col].tint = COMMON_TINT;
            this.board[row][col].zIndex = row * BOARD_WIDTH + col;

            if (!this.dragTarget.player_ref) {
                this.dragTarget = null;
                return;
            }

            if (this.getRandomInteger(0, 3)) { // if we can move to (row, col)
                this.dragTarget.player_ref.moveTo(row, col);
            } else {
                this.dragTarget.player_ref.dropCurrentMove();
            }

            this.dragTarget = null;
        }
    }

    addPlayer() {
        const player = new Player(this);
        this.board_container.addChild(player.graphics);
        this.players.push(player);
    }

    removePlayer() {
        if (!this.players.length) {
            return;
        }

        const player = this.players.pop();
        this.board_container.removeChild(player.graphics);
    }

    componentWillUnmount() {
        // cleanup
        if (this.app) {
            this.app.stop(); // stop the renderer
            this.app.destroy(true); // remove pixi and the canvas
            this.app = null; // cleanup refernce to pixi
        }
    }

    render() {
        return <div ref={this.canvasRef} />;
    }
}
