import React from "react";

const GRADIENT_BOTTOM_MASK_HTML = `<div class="framer-j4ugry" data-framer-name="Bottom" style="mask:linear-gradient(180deg, rgba(0,0,0,0) 65%, rgba(0,0,0,1) 100%) add;-webkit-mask:linear-gradient(180deg, rgba(0,0,0,0) 65%, rgba(0,0,0,1) 100%) add;border-bottom-left-radius:11px;border-bottom-right-radius:11px;border-top-left-radius:11px;border-top-right-radius:11px;box-shadow:inset 0px 0px 0px 1px rgb(0, 0, 0);opacity:0.06"></div>`;

export function FGradientBottomMask() {
  return <span dangerouslySetInnerHTML={{ __html: GRADIENT_BOTTOM_MASK_HTML }} />;
}
