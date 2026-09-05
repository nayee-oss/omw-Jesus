import { AvatarScene, BodyScene, DepartureScene, HubScene, PartyScene, ResultScene, TitleScene, WorldScene } from './scenes'

export function createOMWGame(parent) {
  const Phaser = window.Phaser
  return new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: 640,
    height: 360,
    backgroundColor: '#0a0810',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 640,
      height: 360,
      expandParent: true,
    },
    render: {
      antialias: false,
      pixelArt: true,
      roundPixels: true,
      powerPreference: 'high-performance',
    },
    input: {
      activePointers: 3,
    },
    scene: [TitleScene, AvatarScene, DepartureScene, BodyScene, HubScene, WorldScene, PartyScene, ResultScene],
  })
}
