/**
 * Make sure the page runs this bundle and not one left over from before an update.
 *
 * The Home Assistant apps keep the page alive across a server restart. The
 * previous bundle has then already defined our custom elements, so the new one
 * cannot define them again and the old panel stays on screen. When this bundle
 * finds an older one in the page it reloads once, which loads only the new one.
 *
 * This module must be imported before anything that defines an element.
 */

declare const __SHC_VERSION__: string;

export const BUNDLE_VERSION: string = __SHC_VERSION__;

const MARKER = "__SMART_HEAT_VERSION__";
const RELOAD_KEY = "smart-heat-controller:reloaded-for";

function reloadOnce(): void {
  try {
    if (sessionStorage.getItem(RELOAD_KEY) === BUNDLE_VERSION) {
      // Already tried for this version; never loop.
      return;
    }
    sessionStorage.setItem(RELOAD_KEY, BUNDLE_VERSION);
  } catch {
    // Storage blocked: reloading without the guard could loop, so do not.
    return;
  }
  window.location.reload();
}

const page = window as unknown as Record<string, unknown>;
const loaded = page[MARKER];

if (loaded === undefined) {
  // Bundles up to 0.1.14 did not set the marker; an element that is already
  // defined means one of them is running in this page.
  if (customElements.get("smart-heat-panel")) {
    reloadOnce();
  }
  page[MARKER] = BUNDLE_VERSION;
} else if (loaded !== BUNDLE_VERSION) {
  reloadOnce();
}

export const STALE_BUNDLE = loaded !== undefined && loaded !== BUNDLE_VERSION;
