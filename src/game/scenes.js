import { AVATAR_PALETTES, COLORS, createSharedTextures, drawDither, drawRoom, ensureAvatarTexture } from './art'

const Phaser = window.Phaser
import { defaultState, readSave, writeSave } from './state'

const GAME_W = 640
const GAME_H = 360
const SCALE = 3

const bodyChoices = [
  ['CREMATION', 'Keep it compact.'],
  ['BURIAL', 'Classic underground era.'],
  ['GREEN BURIAL', 'Return me to nature.'],
  ['SEA FAREWELL', 'Let the ocean handle it.'],
  ['DONATE MY BODY', 'One final contribution.'],
  ['NOT SURE YET', 'Fair. This got specific quickly.'],
]

const venues = [
  ['THE CLASSIC HALL', 0xf2d7c3],
  ['SUNSET BEACH', 0xf5a65b],
  ['SECRET GARDEN', 0x78c79c],
  ['ROOFTOP AFTERPARTY', 0x7666be],
  ['PRIVATE BAR', 0x9d5067],
  ['INTO THE WILD', 0x719b89],
]

function text(scene, value, x, y, style = {}) {
  return scene.add.text(x, y, value, {
    fontFamily: 'Courier New, monospace',
    fontSize: style.fontSize || '10px',
    color: style.color || '#f8edcf',
    fontStyle: style.fontStyle || 'normal',
    align: style.align || 'left',
    wordWrap: style.wordWrap,
    lineSpacing: style.lineSpacing || 2,
  }).setOrigin(style.originX ?? 0, style.originY ?? 0)
}

function makeButton(scene, label, x, y, width, height, onClick, active = false) {
  const box = scene.add.rectangle(x, y, width, height, active ? COLORS.yellow : COLORS.ink2, 0.96)
    .setStrokeStyle(2, active ? COLORS.ink : COLORS.mint, 0.9)
    .setInteractive({ useHandCursor: true })
  const labelText = text(scene, label, x, y + 1, { fontSize: '10px', color: active ? '#17121f' : '#f8edcf', align: 'center', originX: 0.5, originY: 0.5 })
  box.on('pointerover', () => box.setStrokeStyle(2, COLORS.yellow, 1))
  box.on('pointerout', () => box.setStrokeStyle(2, active ? COLORS.ink : COLORS.mint, 0.9))
  box.on('pointerdown', onClick)
  return { box, labelText }
}

class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key)
    this.save = readSave()
  }

  createBackground(color = COLORS.ink) {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, color)
    createSharedTextures(this)
  }

  addHud(label, number) {
    text(this, 'OMWGOD', 16, 14, { fontSize: '11px', color: '#ffd866', fontStyle: 'bold' })
    text(this, label, 16, 30, { fontSize: '8px', color: '#8e8297' })
    text(this, number, 614, 18, { fontSize: '10px', color: '#ffd866', fontStyle: 'bold', originX: 1 })
    this.add.rectangle(16, 43, 608, 1, COLORS.mint, 0.28).setOrigin(0)
  }

  fadeTo(key, data = {}) {
    this.cameras.main.fadeOut(220, 10, 8, 16)
    this.time.delayedCall(240, () => this.scene.start(key, data))
  }
}

export class TitleScene extends BaseScene {
  constructor() { super('TitleScene') }

  create() {
    this.createBackground(0x100c18)
    const g = this.add.graphics()
    g.fillStyle(0x251b38).fillRect(0, 0, GAME_W, GAME_H)
    drawDither(g, 0, 0, GAME_W, GAME_H, 0xffffff, 0.07, 5)
    g.fillStyle(0x17121f).fillRect(0, 258, GAME_W, 102)

    // A tiny moon and a deliberately suspiciously grand entrance.
    g.fillStyle(COLORS.yellow).fillCircle(506, 82, 34)
    g.fillStyle(0x251b38).fillCircle(521, 72, 32)
    text(this, 'OMWGOD', 42, 58, { fontSize: '17px', color: '#ffd866', fontStyle: 'bold' })
    text(this, 'A LITTLE GAME ABOUT\nA VERY BIG EXIT', 42, 92, { fontSize: '27px', color: '#f8edcf', fontStyle: 'bold', lineSpacing: -1 })
    text(this, 'They’re going to play the wrong song at your funeral.', 43, 177, { fontSize: '11px', color: '#f46f9b' })
    text(this, 'Your family means well. Their taste is another story.', 43, 195, { fontSize: '9px', color: '#bcb0c4' })

    makeButton(this, 'START GAME', 117, 246, 156, 32, () => this.fadeTo('AvatarScene'))
    makeButton(this, 'CONTINUE', 117, 288, 156, 24, () => this.fadeTo('AvatarScene'), Boolean(this.save.avatar))
    text(this, 'ARROW KEYS / WASD TO MOVE  ·  TAP TO INTERACT', 320, 332, { fontSize: '8px', color: '#8e8297', originX: 0.5 })

    // Pixel memorial plaque as environmental storytelling.
    g.fillStyle(0x332642).fillRect(407, 224, 112, 45)
    g.lineStyle(2, COLORS.pink).strokeRect(411, 228, 104, 37)
    text(this, 'NO BORING\nSPEECHES', 463, 246, { fontSize: '9px', color: '#ffd866', align: 'center', originX: 0.5, originY: 0.5 })
  }
}

export class AvatarScene extends BaseScene {
  constructor() { super('AvatarScene') }

  create() {
    this.createBackground()
    this.addHud('CHARACTER ROOM', '1 / 6')
    drawRoom(this)

    text(this, 'MAKE A LITTLE YOU', 28, 65, { fontSize: '15px', color: '#f8edcf', fontStyle: 'bold' })
    text(this, 'No pressure. Just pick a face\nthat your family can identify.', 28, 86, { fontSize: '9px', color: '#bcb0c4' })

    this.avatar = this.add.sprite(314, 233, ensureAvatarTexture(this, this.save.avatar), 0)
      .setScale(SCALE)
      .setOrigin(0.5, 1)
    this.avatar.play({ key: this.avatar.texture.key, frameRate: 5, repeat: -1 })

    this.add.rectangle(314, 241, 82, 4, COLORS.ink, 0.38)
    text(this, '←  MOVE AROUND  →', 314, 273, { fontSize: '8px', color: '#ffd866', originX: 0.5 })
    text(this, 'walk over to a mirror', 314, 287, { fontSize: '8px', color: '#8e8297', originX: 0.5 })

    this.addMirror()
    this.addWardrobe()
    this.setupInput()
    this.addCustomizer()
  }

  addMirror() {
    const mirror = this.add.rectangle(123, 181, 66, 116, 0x14111d).setStrokeStyle(2, COLORS.yellow)
    mirror.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.shuffleAvatar())
    text(this, 'MIRROR', 123, 305, { fontSize: '8px', color: '#ffd866', originX: 0.5 })
    this.add.sprite(123, 236, ensureAvatarTexture(this, this.save.avatar), 0).setScale(2.5).setTint(0x8c72d8)
  }

  addWardrobe() {
    const wardrobe = this.add.rectangle(518, 181, 74, 116, 0x3b2941).setStrokeStyle(2, COLORS.pink)
    wardrobe.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.cycleOutfit())
    text(this, 'WARDROBE', 518, 305, { fontSize: '8px', color: '#f46f9b', originX: 0.5 })
  }

  addCustomizer() {
    const choices = [
      ['SKIN', ['1', '2', '3', '4', '5']],
      ['HAIR', ['WAVE', 'BOB', 'CURL', 'BUZZ']],
      ['FIT', ['PURPLE', 'PINK', 'TEAL', 'ORANGE', 'GOLD']],
    ]
    choices.forEach(([label, items], row) => {
      const y = 88 + row * 36
      text(this, label, 416, y, { fontSize: '7px', color: '#8e8297' })
      items.forEach((item, index) => {
        const x = 465 + index * 30
        makeButton(this, item, x, y + 1, 25, 19, () => {
          if (label === 'SKIN') this.save.avatar.skin = index
          if (label === 'HAIR') this.save.avatar.hair = index
          if (label === 'FIT') this.save.avatar.outfit = index
          this.refreshAvatar()
        }, false)
      })
    })
    text(this, 'CLICK A CATEGORY.\nTHE LITTLE PERSON CHANGES.', 416, 210, { fontSize: '8px', color: '#bcb0c4' })
    makeButton(this, 'THAT’S ME ENOUGH  →', 490, 334, 170, 26, () => this.startDeparture())
  }

  setupInput() {
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,A,D')
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y > 210 && pointer.y < 290 && pointer.x > 200 && pointer.x < 390) this.shuffleAvatar()
    })
  }

  shuffleAvatar() {
    this.save.avatar.hair = (this.save.avatar.hair + 1) % 4
    this.save.avatar.outfit = (this.save.avatar.outfit + 1) % 5
    this.refreshAvatar()
  }

  cycleOutfit() {
    this.save.avatar.outfit = (this.save.avatar.outfit + 1) % 5
    this.refreshAvatar()
  }

  refreshAvatar() {
    const key = ensureAvatarTexture(this, this.save.avatar)
    this.avatar.setTexture(key, 0)
    this.avatar.play({ key, frameRate: 5, repeat: -1 })
    writeSave(this.save)
  }

  update() {
    if (!this.avatar || this.departing) return
    const left = this.keys.LEFT.isDown || this.keys.A.isDown
    const right = this.keys.RIGHT.isDown || this.keys.D.isDown
    if (left || right) {
      this.avatar.x = Phaser.Math.Clamp(this.avatar.x + (right ? 1.2 : -1.2), 230, 390)
      this.avatar.setFlipX(left)
      this.avatar.play({ key: this.avatar.texture.key, frameRate: 8, repeat: -1 })
    } else {
      this.avatar.play({ key: this.avatar.texture.key, frameRate: 4, repeat: -1 })
    }
  }

  startDeparture() {
    if (this.departing) return
    this.departing = true
    writeSave(this.save)
    this.fadeTo('DepartureScene', { avatar: this.save.avatar })
  }
}

export class DepartureScene extends BaseScene {
  constructor() { super('DepartureScene') }

  create(data) {
    this.createBackground()
    drawRoom(this)
    this.add.rectangle(320, 170, 640, 340, 0x0b0911, 0).setAlpha(0)
    const key = ensureAvatarTexture(this, data.avatar || this.save.avatar)
    this.avatar = this.add.sprite(320, 236, key, 0).setScale(SCALE).setOrigin(0.5, 1)
    this.avatar.play({ key, frameRate: 4, repeat: -1 })
    this.avatar.setPipeline('Light2D')
    this.lights.enable().setAmbientColor(0x777777)
    this.lights.addLight(413, 190, 120, 0xffd866, 1.5)

    text(this, 'ONE LAST PHOTO', 320, 41, { fontSize: '8px', color: '#ffd866', originX: 0.5 })
    this.title = text(this, '', 320, 295, { fontSize: '22px', color: '#f8edcf', fontStyle: 'bold', align: 'center', originX: 0.5 })
    this.subtitle = text(this, '', 320, 329, { fontSize: '9px', color: '#f46f9b', originX: 0.5 })
    this.flash = this.add.rectangle(320, 180, 640, 360, 0xffffff, 0)
    this.cameras.main.flash(250, 255, 255, 255)

    this.time.delayedCall(1050, () => {
      this.cameras.main.flash(120, 255, 255, 255)
      this.avatar.setTint(0x999999)
      this.lights.setAmbientColor(0x333333)
      this.spawnSoul()
    })
    this.time.delayedCall(1700, () => this.title.setText('On my way\nto God.'))
    this.time.delayedCall(2180, () => this.subtitle.setText('Okay. First practical question.'))
    this.time.delayedCall(3600, () => this.fadeTo('BodyScene'))
  }

  spawnSoul() {
    for (let i = 0; i < 12; i += 1) {
      const p = this.add.image(320 + Phaser.Math.Between(-24, 24), 180, 'spark').setScale(Phaser.Math.Between(1, 2)).setTint(i % 2 ? COLORS.pink : COLORS.yellow)
      this.tweens.add({ targets: p, y: Phaser.Math.Between(36, 125), x: p.x + Phaser.Math.Between(-48, 48), alpha: 0, duration: Phaser.Math.Between(1000, 1700), delay: i * 40, ease: 'Sine.easeOut', onComplete: () => p.destroy() })
    }
  }
}

export class BodyScene extends BaseScene {
  constructor() { super('BodyScene') }

  create() {
    this.createBackground(0x12101a)
    this.addHud('CHOOSE THE ROUTE', '2 / 6')
    text(this, 'SO… WHAT ARE WE DOING\nWITH THE BODY?', 28, 70, { fontSize: '22px', color: '#f8edcf', fontStyle: 'bold', lineSpacing: -2 })
    text(this, 'Weird question. Important answer.', 30, 122, { fontSize: '9px', color: '#f46f9b' })

    const g = this.add.graphics()
    g.fillStyle(0x221c2d).fillRect(272, 161, 96, 72)
    g.fillStyle(0x3a3044).fillRect(278, 167, 84, 60)
    g.fillStyle(COLORS.yellow).fillRect(302, 179, 36, 3)
    text(this, 'YOUR BODY\nYOUR CALL', 320, 204, { fontSize: '8px', color: '#bcb0c4', align: 'center', originX: 0.5, originY: 0.5 })

    bodyChoices.forEach(([label, line], index) => {
      const col = index % 3
      const row = Math.floor(index / 3)
      const x = 120 + col * 200
      const y = 155 + row * 75
      const box = makeButton(this, label, x, y, 174, 52, () => this.chooseBody(index), false)
      text(this, line, x, y + 16, { fontSize: '7px', color: '#8e8297', originX: 0.5 })
      box.box.setDepth(2)
    })
    text(this, 'This records a preference, not a legal registration.\nLocal rules and formal donation programmes still apply.', 28, 324, { fontSize: '7px', color: '#77707f' })
  }

  chooseBody(index) {
    this.save.bodyChoice = bodyChoices[index][0]
    writeSave(this.save)
    this.cameras.main.flash(110, 255, 216, 102)
    this.time.delayedCall(180, () => this.fadeTo('HubScene'))
  }
}

export class HubScene extends BaseScene {
  constructor() { super('HubScene') }

  create() {
    this.createBackground(0x171522)
    this.addHud('THE FAREWELL WORLD', '3 / 6')
    text(this, 'WELCOME TO THE AFTERPARTY', 320, 67, { fontSize: '19px', color: '#f8edcf', fontStyle: 'bold', originX: 0.5 })
    text(this, 'Pick a place. We’ll make the rest emotionally complicated.', 320, 94, { fontSize: '9px', color: '#f46f9b', originX: 0.5 })

    const g = this.add.graphics()
    g.lineStyle(3, 0x5d4d73, 1)
    g.strokeCircle(320, 215, 55)
    g.strokeCircle(320, 215, 108)
    g.lineBetween(320, 107, 320, 160)
    g.lineBetween(320, 270, 320, 323)
    g.lineBetween(212, 215, 265, 215)
    g.lineBetween(375, 215, 428, 215)
    g.fillStyle(COLORS.yellow).fillCircle(320, 215, 8)
    text(this, 'YOU', 320, 230, { fontSize: '7px', color: '#ffd866', originX: 0.5 })

    const locations = [
      ['THE CLASSIC HALL', 320, 112, 0xf2d7c3],
      ['SUNSET BEACH', 320, 310, 0xf5a65b],
      ['SECRET GARDEN', 145, 215, 0x78c79c],
      ['ROOFTOP AFTERPARTY', 495, 215, 0x7666be],
    ]
    locations.forEach(([name, x, y, color]) => {
      const spot = this.add.rectangle(x, y, 126, 32, color, 1).setStrokeStyle(2, COLORS.ink).setInteractive({ useHandCursor: true })
      text(this, name, x, y, { fontSize: '7px', color: '#17121f', fontStyle: 'bold', align: 'center', originX: 0.5, originY: 0.5 })
      spot.on('pointerdown', () => this.chooseLocation(name))
      spot.on('pointerover', () => spot.setScale(1.05))
      spot.on('pointerout', () => spot.setScale(1))
    })
    text(this, 'PRIVATE BAR', 48, 330, { fontSize: '8px', color: '#f46f9b' })
    text(this, 'INTO THE WILD', 592, 330, { fontSize: '8px', color: '#78d7b5', originX: 1 })
    text(this, 'CLICK A DESTINATION TO ENTER', 320, 345, { fontSize: '8px', color: '#8e8297', originX: 0.5 })
  }

  chooseLocation(name) {
    this.save.venue = name
    writeSave(this.save)
    this.cameras.main.flash(100, 255, 216, 102)
    this.time.delayedCall(160, () => this.fadeTo('WorldScene', { venue: name }))
  }
}

export class WorldScene extends BaseScene {
  constructor() { super('WorldScene') }

  create(data) {
    this.createBackground(0x0e0b15)
    this.addHud('FAREWELL LOCATION', '4 / 6')
    const selected = data.venue || this.save.venue || 'SUNSET BEACH'
    const palette = venues.find(([name]) => name === selected)?.[1] || 0xf5a65b
    const g = this.add.graphics()
    g.fillStyle(palette).fillRect(0, 44, 640, 316)
    g.fillStyle(0x17121f, 0.35).fillRect(0, 260, 640, 100)
    drawDither(g, 0, 44, 640, 216, 0xffffff, 0.1, 5)
    text(this, selected, 22, 64, { fontSize: '18px', color: '#17121f', fontStyle: 'bold' })
    text(this, 'THE WORLD HAS ENTERED ITS FINAL FORM.', 22, 90, { fontSize: '8px', color: '#17121f' })

    const key = ensureAvatarTexture(this, this.save.avatar)
    this.avatar = this.add.sprite(320, 255, key, 0).setScale(SCALE).setOrigin(0.5, 1)
    this.avatar.play({ key, frameRate: 4, repeat: -1 })
    this.add.ellipse(320, 265, 86, 10, COLORS.ink, 0.28)
    text(this, 'YOUR AVATAR', 320, 282, { fontSize: '7px', color: '#f8edcf', originX: 0.5 })
    makeButton(this, 'CUSTOMIZE THE PARTY  →', 320, 323, 220, 28, () => this.fadeTo('PartyScene'))
  }
}

export class PartyScene extends BaseScene {
  constructor() { super('PartyScene') }

  create() {
    this.createBackground(0x1a1220)
    this.addHud('CUSTOMIZE THE PARTY', '5 / 6')
    text(this, 'NOW MAKE IT FEEL LIKE YOU.', 24, 68, { fontSize: '20px', color: '#f8edcf', fontStyle: 'bold' })
    text(this, 'The relatives have been temporarily removed from the aux.', 24, 94, { fontSize: '9px', color: '#f46f9b' })
    const sections = [
      ['MUSIC', 'Indie playlist'],
      ['DRESS CODE', 'Black but elegant'],
      ['FLOWERS', 'Wildflowers'],
      ['FOOD', 'Champagne + canapes'],
      ['CEREMONY', 'Non-religious'],
      ['ABSOLUTELY NOT', 'Boring speeches'],
    ]
    sections.forEach(([label, value], index) => {
      const x = 126 + (index % 3) * 194
      const y = 158 + Math.floor(index / 3) * 75
      this.add.rectangle(x, y, 170, 55, 0x2d2038).setStrokeStyle(2, index === 5 ? COLORS.pink : COLORS.mint)
      text(this, label, x - 72, y - 17, { fontSize: '7px', color: '#8e8297' })
      text(this, value, x - 72, y + 1, { fontSize: '10px', color: index === 5 ? '#f46f9b' : '#f8edcf' })
      text(this, 'CHANGE  ↗', x + 66, y + 18, { fontSize: '6px', color: '#ffd866', originX: 1 })
    })
    makeButton(this, 'SHOW ME THE FINAL VIBE  →', 320, 325, 230, 30, () => this.fadeTo('ResultScene'))
  }
}

export class ResultScene extends BaseScene {
  constructor() { super('ResultScene') }

  create() {
    this.createBackground(0x0d0b12)
    this.addHud('FAREWELL PROFILE', '6 / 6')
    const g = this.add.graphics()
    g.fillStyle(0x272039).fillRect(30, 62, 580, 245)
    g.lineStyle(2, COLORS.yellow).strokeRect(34, 66, 572, 237)
    drawDither(g, 36, 68, 568, 231, 0xffffff, 0.05, 5)
    text(this, 'YOUR FAREWELL', 54, 87, { fontSize: '8px', color: '#ffd866' })
    text(this, 'THE CINEMATIC\nMENACE', 54, 111, { fontSize: '29px', color: '#f8edcf', fontStyle: 'bold', lineSpacing: -3 })
    text(this, 'A beautiful send-off with one rule:', 54, 190, { fontSize: '9px', color: '#bcb0c4' })
    text(this, 'NO BORING SPEECHES.', 54, 207, { fontSize: '13px', color: '#f46f9b', fontStyle: 'bold' })
    const key = ensureAvatarTexture(this, this.save.avatar)
    this.add.sprite(480, 215, key, 0).setScale(5).setOrigin(0.5, 1)
    text(this, '87% ICONIC', 480, 252, { fontSize: '9px', color: '#ffd866', originX: 0.5 })
    text(this, 'CREMATION  ·  SUNSET BEACH  ·  INDIE PLAYLIST  ·  WILDFLOWERS', 320, 282, { fontSize: '7px', color: '#bcb0c4', align: 'center', originX: 0.5 })
    makeButton(this, 'SAVE THIS ENERGY', 222, 331, 180, 24, () => this.showSaved())
    makeButton(this, 'START OVER', 462, 331, 110, 24, () => this.scene.start('TitleScene'))
  }

  showSaved() {
    text(this, 'SAVED LOCALLY. TELL NO ONE (OR EVERYONE).', 320, 314, { fontSize: '8px', color: '#78d7b5', originX: 0.5 })
  }
}
