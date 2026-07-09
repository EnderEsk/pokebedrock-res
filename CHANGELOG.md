**Update v2.18.4**

- Added animated XP progress bars to the party sidebar PHUD, including per-slot clip bindings, tighter stack spacing, and status tags beside each Pokémon's level.
- Localized the ping indicator with a static `phud.playerPing.label` prefix beside the dynamic colored ping value, and wired the HUD background alpha binding.
- Rebuilt fly-mount visuals: new `ride_flying` animation-controller states, `v.is_gliding` Molang, landing-puff particles on rider touchdown, and per-species 3D animation controllers for flyable Pokémon (Arceus plates, Ditto, Flygon, Golurk, Lugia, Mew, Rayquaza, Yveltal, and more).
- Added a `pokeb:landing_puff` gust particle and Charizard `ride_flying` wing-flap animation with speed-scaled playback.
- Cleaned up crate rendering: removed the old rotate animation controller and variant-based facing animations; crates now face via entity body yaw from the behavior pack.
- Synced a large localization pass across all seven locales: PC action buttons and headers, full Pokémon summary strings, Showdown type/egg-group/color names, and split `/playerinfo` body/footer keys to fix long rank-list overflow.
- Tweaked Pokédex chest-form layout bindings for the updated localization flow.
