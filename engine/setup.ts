import { gsap } from "gsap";
import * as PIXI from 'pixi.js'

import { PixiPlugin } from "gsap/PixiPlugin";

gsap.registerPlugin(PixiPlugin);

PixiPlugin.registerPIXI(PIXI);
