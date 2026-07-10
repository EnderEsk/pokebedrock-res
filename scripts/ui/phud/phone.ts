import {
  defineUI,
  panel,
  prefix,
  phudPhoneBinding,
  conditionalBindings,
  phudVisibility,
  animation,
  animRef,
  extend,
  image,
} from "mcbe-ts-ui";

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
    .next(animRef("phud_phone", "anim__oak_loop_show__1")),

  animation("anim__oak_loop_show__1").alpha(1, 1).duration(0),
];

export default defineUI("phud_phone", (ns) => {
  for (const anim of animations) ns.addAnimation(anim);

  // Image base with #value data binding (NOT texture binding — conditions use #value).
  const [abstractPhoneNS, ns1] = ns.add(
    image("abstract_phone_conditional", "")
      .fullSize()
      .bindings(phudPhoneBinding("#value"), ...conditionalBindings())
  );

  // Fixed: main had extra `)` — keep oak_ textures (tutorial PHUD).
  const [oakIcon, ns2] = ns1.add(
    image("oak_icon", "('textures/ui/phud/oak_' + $name)")
      .uvSize(64, 64)
      .bindings(phudPhoneBinding("#value"))
  );

  const [icon, ns3] = ns2.add(
    extend("icon", abstractPhoneNS).texture("('textures/ui/phud/' + $name)")
  );

  const oakTalk = extend("oak_talk", abstractPhoneNS)
    .rawProp("type", "panel")
    .variable("$condition", prefix(4, "#value", "loop"))
    .controls(
      extend("start", oakIcon)
        .uvAnim(animRef("phud_phone", "anim__oak_start_flipbook"))
        .anims(animRef("phud_phone", "anim__oak_start_destroy"))
        .variable("$name", "start"),
      extend("loop", oakIcon)
        .uvAnim(animRef("phud_phone", "anim__oak_loop_flipbook"))
        .anims(animRef("phud_phone", "anim__oak_loop_show__0"))
        .alpha(0)
        .variable("$name", "loop")
    );

  const icons = panel("icons")
    .layer(1)
    .controls(
      extend("ringing", icon)
        .uvAnim(animRef("phud_phone", "anim__ringing"))
        .uvSize(64, 64)
        .variable("$name", "ringing")
        .variable("$condition", "(#value = 'ring')"),
      extend("standby", icon)
        .variable("$name", "standby")
        .variable("$condition", "(#value = 'standby')"),
      oakTalk
    );

  const backgrounds = panel("backgrounds").controls(
    // Fixed: main was missing closing `)`.
    extend("phone_background", abstractPhoneNS)
      .texture("textures/ui/phud/box_small")
      .variable("$condition", "((#value = 'ring') or (#value = 'standby'))"),
    extend("oak_talk_bg", abstractPhoneNS)
      .texture("textures/ui/phud/box_wide")
      .alpha(0)
      .anims(animRef("phud_phone", "anim__oak_loop_show__0"))
      .variable("$condition", prefix(4, "#value", "loop"))
  );

  return ns3.setMain(
    panel("main")
      .controls(icons, backgrounds)
      .bindings(...phudVisibility("#phone"))
  );
});
