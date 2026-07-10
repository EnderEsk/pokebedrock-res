import {
  defineUI,
  panel,
  prefix,
  phudPhoneBinding,
  conditionalBindings,
  phudVisibility,
  animation,
  animRef,
  image,
  ImageBuilder,
  ref,
} from "mcbe-ts-ui";

export const NAMESPACE = "phud_phone";
export const INSTANCE = "phone";

/** Cross-namespace mount into `phud.elements`. */
export const mainRef = (overrides: Record<string, unknown> = {}) =>
  ref(`${INSTANCE}@${NAMESPACE}.main`, overrides);

const animations = [
  animation("anim__ringing")
    .flipBook()
    .initialUV(0, 0)
    .frameCount(11)
    .fps(11)
    .frameStep(64),
  animation("anim__oak_start_flipbook")
    .flipBook()
    .initialUV(0, 0)
    .frameCount(12)
    .fps(12)
    .frameStep(64),
  animation("anim__oak_start_destroy").wait(0.97).destroyAtEnd("start"),
  animation("anim__oak_loop_flipbook")
    .flipBook()
    .initialUV(0, 0)
    .frameCount(8)
    .fps(12)
    .frameStep(64),
  animation("anim__oak_loop_show__0")
    .wait(0.97)
    .next(animRef(NAMESPACE, "anim__oak_loop_show__1")),
  animation("anim__oak_loop_show__1").alpha(1, 1).duration(0),
];

// Image base with #value binding — no texture (children set their own).
// Empty texture:"" breaks panel extensions like oak_talk (unknown property).
const abstractPhoneConditional = new ImageBuilder("abstract_phone_conditional")
  .fullSize()
  .bindings(phudPhoneBinding("#value"), ...conditionalBindings());

const oakIcon = image("oak_icon", "('textures/ui/phud/oak_' + $name)")
  .uvSize(64, 64)
  .bindings(phudPhoneBinding("#value"));

// Extend typed bases with default shouldClearType — inherit type/texture from @parent.
const icon = new ImageBuilder("icon")
  .extends(`${NAMESPACE}.abstract_phone_conditional`)
  .texture("('textures/ui/phud/' + $name)");

const oakTalkStart = new ImageBuilder("start")
  .extends(`${NAMESPACE}.oak_icon`)
  .uvAnim(animRef(NAMESPACE, "anim__oak_start_flipbook"))
  .anims(animRef(NAMESPACE, "anim__oak_start_destroy"))
  .variable("name", "start");

const oakTalkLoop = new ImageBuilder("loop")
  .extends(`${NAMESPACE}.oak_icon`)
  .uvAnim(animRef(NAMESPACE, "anim__oak_loop_flipbook"))
  .anims(animRef(NAMESPACE, "anim__oak_loop_show__0"))
  .alpha(0)
  .variable("name", "loop");

// Panel that hosts start/loop oak flipbooks — must not inherit image texture.
const oakTalk = panel("oak_talk")
  .extends(`${NAMESPACE}.abstract_phone_conditional`)
  .rawProp("type", "panel")
  .variable("condition", prefix(4, "#value", "loop"))
  .controls(oakTalkStart, oakTalkLoop);

const ringing = new ImageBuilder("ringing")
  .extends(`${NAMESPACE}.icon`)
  .uvAnim(animRef(NAMESPACE, "anim__ringing"))
  .uvSize(64, 64)
  .variable("name", "ringing")
  .variable("condition", "(#value = 'ring')");

const standby = new ImageBuilder("standby")
  .extends(`${NAMESPACE}.icon`)
  .variable("name", "standby")
  .variable("condition", "(#value = 'standby')");

const icons = panel("icons")
  .layer(1)
  .controls(ringing, standby, ref("oak_talk@oak_talk"));

const phoneBackground = new ImageBuilder("phone_background")
  .extends(`${NAMESPACE}.abstract_phone_conditional`)
  .texture("textures/ui/phud/box_small")
  .variable("condition", "((#value = 'ring') or (#value = 'standby'))");

const oakTalkBg = new ImageBuilder("oak_talk_bg")
  .extends(`${NAMESPACE}.abstract_phone_conditional`)
  .texture("textures/ui/phud/box_wide")
  .alpha(0)
  .anims(animRef(NAMESPACE, "anim__oak_loop_show__0"))
  .variable("condition", prefix(4, "#value", "loop"));

const backgrounds = panel("backgrounds").controls(
  phoneBackground,
  oakTalkBg
);

export default defineUI(NAMESPACE, (ns) => {
  for (const anim of animations) ns.addAnimation(anim);

  abstractPhoneConditional.addToNamespace(ns);
  oakIcon.addToNamespace(ns);
  icon.addToNamespace(ns);
  oakTalk.addToNamespace(ns);

  return ns.setMain(
    panel("main")
      .controls(icons, backgrounds)
      .bindings(...phudVisibility("#phone"))
  );
});
