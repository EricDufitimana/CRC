import React from "react";

const DEFAULT_BUTTON_HTML = `<button type="submit" class="framer-KGu8n framer-jxmfz4 framer-v-jxmfz4" data-framer-name="Default" data-reset="button" style="background-color:rgb(51, 51, 51);height:100%;width:100%;border-bottom-left-radius:10px;border-bottom-right-radius:10px;border-top-left-radius:10px;border-top-right-radius:10px;opacity:1" tabindex="0"><div class="framer-1ylka0v" style="--extracted-r6o4lv:rgb(255, 255, 255);--framer-link-text-color:rgb(0, 153, 255);--framer-link-text-decoration:underline;transform:none" data-framer-component-type="RichTextContainer"><p style="--font-selector:SW50ZXItU2VtaUJvbGQ=;--framer-font-family:&quot;Inter&quot;, &quot;Inter Placeholder&quot;, sans-serif;--framer-font-size:14px;--framer-font-weight:600;--framer-text-color:var(--extracted-r6o4lv, rgb(255, 255, 255))" class="framer-text">Submit</p></div></button>`;

const CANCEL_BUTTON_HTML = `<button type="submit" class="framer-51Zpa framer-1vu6bk6 framer-v-hw2cpm" data-framer-name="Cancel" data-reset="button" style="--border-bottom-width:1px;--border-color:rgba(34, 34, 34, 0.2);--border-left-width:1px;--border-right-width:1px;--border-style:solid;--border-top-width:1px;background-color:rgb(255, 255, 255);height:100%;width:100%;border-bottom-left-radius:10px;border-bottom-right-radius:10px;border-top-left-radius:10px;border-top-right-radius:10px;opacity:1" data-border="true"><div class="framer-50scrv" style="--extracted-r6o4lv:rgb(255, 255, 255);--framer-link-text-color:rgb(0, 153, 255);--framer-link-text-decoration:underline;transform:none" data-framer-component-type="RichTextContainer"><p dir="auto" style="--font-selector:SW50ZXItU2VtaUJvbGQ=;--framer-font-size:14px;--framer-font-weight:600" class="framer-text">Cancel</p></div></button>`;

const NEXT_BUTTON_HTML = `<button class="framer-51Zpa framer-1vu6bk6 framer-v-sob4fd" data-framer-name="Next" data-reset="button" style="--border-bottom-width:0px;--border-color:rgba(0, 0, 0, 0);--border-left-width:0px;--border-right-width:0px;--border-style:solid;--border-top-width:0px;background-color:rgb(51, 51, 51);height:100%;width:100%;border-bottom-left-radius:10px;border-bottom-right-radius:10px;border-top-left-radius:10px;border-top-right-radius:10px;opacity:1"><div class="framer-50scrv" style="--extracted-r6o4lv:rgb(255, 255, 255);--framer-link-text-color:rgb(0, 153, 255);--framer-link-text-decoration:underline;transform:none" data-framer-component-type="RichTextContainer"><p dir="auto" style="--font-selector:SW50ZXItU2VtaUJvbGQ=;--framer-font-size:14px;--framer-font-weight:600;--framer-text-color:var(--extracted-r6o4lv, rgb(255, 255, 255))" class="framer-text">Next</p></div></button>`;

export function FButtonDefault() {
  return <span dangerouslySetInnerHTML={{ __html: DEFAULT_BUTTON_HTML }} />;
}

export function FButtonCancel() {
  return <span dangerouslySetInnerHTML={{ __html: CANCEL_BUTTON_HTML }} />;
}

export function FButtonNext() {
  return <span dangerouslySetInnerHTML={{ __html: NEXT_BUTTON_HTML }} />;
}
