// Page gutter (24px, = px-6). RULE: the gutter lives in the navigator scene
// (Stack `contentStyle` / Tabs `sceneStyle`); screens must not add horizontal page padding.
// Full-bleed elements opt out with `marginHorizontal: -SCREEN_GUTTER`.
export const SCREEN_GUTTER = 24;

export const SCENE_GUTTER_STYLE = { paddingHorizontal: SCREEN_GUTTER } as const;

// For a navigator whose scenes are themselves navigators: the inner one already applies the gutter.
export const NO_GUTTER_STYLE = { paddingHorizontal: 0 } as const;
