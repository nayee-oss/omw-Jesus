export const COLORS = {
  ink: 0x17121f,
  ink2: 0x292037,
  cream: 0xf8edcf,
  paper: 0xfff8df,
  yellow: 0xffd866,
  pink: 0xf46f9b,
  mint: 0x78d7b5,
  blue: 0x63b6d8,
  purple: 0x8c72d8,
  red: 0xd95852,
}

export const AVATAR_PALETTES = {
  skin: ['#f6d8c8', '#dfb08a', '#b87850', '#815033', '#492c25'],
  hair: ['#201822', '#6d4430', '#e5aa3d', '#ce668a', '#86c5cf'],
  outfit: ['#8668d5', '#e96f96', '#387f78', '#cc704d', '#ded26d'],
}

const px = (ctx, color, x, y, w = 1, h = 1) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function drawAvatarFrame(ctx, frameX, config, frame, mode) {
  const x = frameX
  const outline = mode === 'ghost' ? '#8eb6bd' : '#18121f'
  const skin = mode === 'mono' ? '#aaa6aa' : mode === 'ghost' ? '#bcebf0' : AVATAR_PALETTES.skin[config.skin]
  const hair = mode === 'mono' ? '#454247' : mode === 'ghost' ? '#91ced5' : AVATAR_PALETTES.hair[config.hairColor]
  const outfit = mode === 'mono' ? '#666269' : mode === 'ghost' ? '#8bc7cd' : AVATAR_PALETTES.outfit[config.outfit]
  const legShift = frame === 2 ? 1 : frame === 3 ? -1 : 0
  const bob = frame === 1 ? 1 : 0

  // Shadow is part of the sprite so it stays pixel-locked.
  if (mode !== 'ghost') {
    px(ctx, 'rgba(24,18,31,.35)', x + 4, 22, 8, 1)
    px(ctx, 'rgba(24,18,31,.2)', x + 6, 23, 4, 1)
  }

  // Back hair silhouettes vary structurally by style.
  if (config.hair === 0) {
    px(ctx, outline, x + 4, 2 + bob, 8, 9)
    px(ctx, hair, x + 5, 3 + bob, 6, 8)
  } else if (config.hair === 1) {
    px(ctx, outline, x + 3, 2 + bob, 10, 11)
    px(ctx, hair, x + 4, 3 + bob, 8, 9)
  } else if (config.hair === 2) {
    ;[[4,2],[7,1],[10,2],[3,5],[11,5],[4,8],[10,8]].forEach(([dx,dy]) => {
      px(ctx, outline, x + dx, dy + bob, 3, 3)
      px(ctx, hair, x + dx + 1, dy + 1 + bob, 2, 2)
    })
  } else {
    px(ctx, outline, x + 4, 2 + bob, 8, 5)
    px(ctx, hair, x + 5, 3 + bob, 6, 3)
  }

  // Head.
  px(ctx, outline, x + 4, 4 + bob, 8, 8)
  px(ctx, outline, x + 3, 6 + bob, 10, 4)
  px(ctx, skin, x + 4, 5 + bob, 8, 6)
  px(ctx, skin, x + 5, 11 + bob, 6, 1)

  // Hairline and face.
  px(ctx, hair, x + 4, 4 + bob, 8, 2)
  if (config.hair === 1) px(ctx, hair, x + 4, 6 + bob, 2, 5)
  if (frame === 1) {
    px(ctx, outline, x + 5, 8 + bob, 2, 1)
    px(ctx, outline, x + 9, 8 + bob, 2, 1)
  } else {
    px(ctx, outline, x + 6, 8 + bob)
    px(ctx, outline, x + 10, 8 + bob)
  }
  px(ctx, '#d15f72', x + 8, 10 + bob, 2, 1)

  // Torso and arms.
  px(ctx, outline, x + 4, 12 + bob, 8, 7)
  px(ctx, outfit, x + 5, 13 + bob, 6, 6)
  px(ctx, outline, x + 2, 13 + bob, 2, 6)
  px(ctx, outline, x + 12, 13 + bob, 2, 6)
  px(ctx, skin, x + 3, 14 + bob, 1, 4)
  px(ctx, skin, x + 12, 14 + bob, 1, 4)
  px(ctx, '#f8edcf', x + 7, 14 + bob, 2, 2)

  // Legs move on walk frames.
  px(ctx, outline, x + 5 + Math.max(0, legShift), 19 + bob, 3, 4)
  px(ctx, outline, x + 9 + Math.min(0, legShift), 19 + bob, 3, 4)
  px(ctx, '#34283d', x + 6 + Math.max(0, legShift), 19 + bob, 2, 3)
  px(ctx, '#34283d', x + 9 + Math.min(0, legShift), 19 + bob, 2, 3)

  if (mode === 'ghost') {
    px(ctx, 'rgba(220,250,255,.65)', x + 3, 5 + bob, 1, 11)
    px(ctx, 'rgba(220,250,255,.45)', x + 12, 8 + bob, 1, 8)
  }
}

export function ensureAvatarTexture(scene, config, mode = 'color') {
  const key = `avatar-${mode}-${config.skin}-${config.hair}-${config.hairColor}-${config.outfit}`
  if (scene.textures.exists(key)) return key

  const texture = scene.textures.createCanvas(key, 64, 24)
  const ctx = texture.context
  ctx.imageSmoothingEnabled = false
  for (let frame = 0; frame < 4; frame += 1) {
    drawAvatarFrame(ctx, frame * 16, config, frame, mode)
    texture.add(frame, 0, frame * 16, 0, 16, 24)
  }
  texture.refresh()
  return key
}

export function createSharedTextures(scene) {
  if (!scene.textures.exists('pixel')) {
    const pixel = scene.textures.createCanvas('pixel', 2, 2)
    pixel.context.fillStyle = '#ffffff'
    pixel.context.fillRect(0, 0, 2, 2)
    pixel.refresh()
  }

  if (!scene.textures.exists('spark')) {
    const spark = scene.textures.createCanvas('spark', 5, 5)
    const ctx = spark.context
    px(ctx, '#ffffff', 2, 0, 1, 5)
    px(ctx, '#ffffff', 0, 2, 5, 1)
    px(ctx, '#fff0a0', 1, 1, 3, 3)
    spark.refresh()
  }
}

export function drawDither(graphics, x, y, width, height, color, alpha = 0.18, step = 4) {
  graphics.fillStyle(color, alpha)
  for (let py = y; py < y + height; py += step) {
    for (let pxX = x + ((py / step) % 2) * 2; pxX < x + width; pxX += step) {
      graphics.fillRect(Math.floor(pxX), Math.floor(py), 1, 1)
    }
  }
}

export function drawRoom(scene, monochrome = false) {
  const g = scene.add.graphics()
  const wall = monochrome ? 0x3b3941 : 0x29324b
  const darkWall = monochrome ? 0x25242a : 0x1c2238
  const floor = monochrome ? 0x555159 : 0x62465f
  const trim = monochrome ? 0x87828a : 0xd68c76

  g.fillStyle(darkWall).fillRect(0, 0, 640, 360)
  g.fillStyle(wall).fillRect(0, 42, 640, 224)
  drawDither(g, 0, 42, 640, 224, 0xffffff, 0.08, 5)
  g.fillStyle(trim).fillRect(0, 258, 640, 8)
  g.fillStyle(floor).fillRect(0, 266, 640, 94)

  for (let y = 270; y < 360; y += 16) {
    g.lineStyle(1, monochrome ? 0x47434b : 0x4b344b, 0.7)
    g.lineBetween(0, y, 640, y)
  }
  for (let x = 0; x < 640; x += 32) {
    g.lineStyle(1, monochrome ? 0x47434b : 0x4b344b, 0.55)
    g.lineBetween(x, 266, x - 26, 360)
  }

  // Window with a living city beyond it.
  g.fillStyle(0x14111d).fillRect(59, 67, 157, 112)
  g.fillStyle(monochrome ? 0x646169 : 0x344d72).fillRect(64, 72, 147, 102)
  g.fillStyle(monochrome ? 0x39373d : 0x18223a).fillRect(64, 126, 147, 48)
  g.fillStyle(monochrome ? 0x99969b : 0xf5cc5f)
  ;[[72,84],[97,103],[126,79],[155,96],[187,82],[79,145],[112,135],[149,153],[194,139]].forEach(([x,y]) => g.fillRect(x,y,3,3))
  g.fillStyle(0x15111d).fillRect(134, 70, 5, 106)
  g.fillRect(62, 121, 151, 5)

  // Wardrobe and poster make the room feel inhabited.
  g.fillStyle(monochrome ? 0x343238 : 0x3b2941).fillRect(468, 82, 108, 178)
  g.fillStyle(monochrome ? 0x77737a : 0xb06d75).fillRect(476, 90, 92, 164)
  g.fillStyle(0x1b1521).fillRect(520, 90, 4, 164)
  g.fillStyle(monochrome ? 0xaaa7ac : 0xffd866).fillRect(513, 169, 4, 4)
  g.fillRect(528, 169, 4, 4)

  g.fillStyle(0x17121f).fillRect(269, 70, 107, 74)
  g.fillStyle(monochrome ? 0x8c898e : 0xf46f9b).fillRect(275, 76, 95, 62)
  g.fillStyle(0x17121f).fillRect(287, 87, 71, 9)
  g.fillStyle(monochrome ? 0xd1ced2 : 0xfff8df).fillRect(287, 104, 53, 4)
  g.fillRect(287, 116, 66, 4)

  // Lamp pool.
  g.fillStyle(monochrome ? 0x77737a : 0xf0b958).fillRect(410, 192, 6, 68)
  g.fillStyle(0x17121f).fillRect(394, 188, 38, 6)
  g.fillStyle(monochrome ? 0x9a969d : 0xffd866).fillRect(400, 172, 26, 17)
  g.fillStyle(monochrome ? 0x77737a : 0xf0b958, 0.08).fillCircle(413, 194, 74)

  return g
}
