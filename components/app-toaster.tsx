"use client";

import { GooeyToaster } from "goey-toast";

/** Global gooey toasts — import `gooeyToast` from `@/lib/toast`. Defaults tuned for a calm, institutional feel. */
export function AppToaster() {
    return (
        <GooeyToaster
            position="top-right"
            theme="light"
            preset="smooth"
            spring={false}
            bounce={0.15}
            closeOnEscape
            offset={20}
            gap={12}
        />
    );
}
