import { gsap } from "gsap";
import { sound } from '@pixi/sound'
import * as PIXI from 'pixi.js'

import { PixiPlugin } from "gsap/PixiPlugin";

gsap.registerPlugin(PixiPlugin);

PixiPlugin.registerPIXI(PIXI);

sound.add('stick', '/assets/attacks/stick.mp3')
sound.add('carrot', '/assets/attacks/carrot.mp3')
sound.add('lightning', '/assets/attacks/lightning.mp3')

PIXI.Assets.load('/assets/attacks/stick.png')
PIXI.Assets.load('/assets/attacks/carrot.png')
PIXI.Assets.load('/assets/attacks/lightning.png')
