import React from "react";

const INPUT_EMAIL_JANE_HTML = `<input type="email" name="Email" placeholder="jane@framer.com" class="framer-form-input framer-form-input-empty" value="">`;

const INPUT_EMAIL_TITLE_HTML = `<input type="email" name="Email" placeholder="Enter a title for the email" class="framer-form-input framer-form-input-empty" value="">`;

const RADIO_OPTION_1_HTML = `<input class="framer-form-boolean-input framer-1b87gx5" type="radio" name="Radio" checked="" value="Option 1">`;

const RADIO_OPTION_2_HTML = `<input class="framer-form-boolean-input framer-130k4o4" type="radio" name="Radio" value="Option 2">`;

const RADIO_OPTION_3_HTML = `<input class="framer-form-boolean-input framer-1x4fm1v" type="radio" name="Radio" value="Option 3">`;

const RADIO_OPTION_1_ALT_HTML = `<input class="framer-form-boolean-input framer-1khf9qd" type="radio" name="Radio" checked="" value="Option 1">`;

const RADIO_OPTION_2_ALT_HTML = `<input class="framer-form-boolean-input framer-837om" type="radio" name="Radio" value="Option 2">`;

const RADIO_OPTION_3_ALT_HTML = `<input class="framer-form-boolean-input framer-8rx0n" type="radio" name="Radio" value="Option 3">`;

const CHECKBOX_NEWSLETTER_HTML = `<input class="framer-form-boolean-input framer-wsw7yz" type="checkbox" name="Newsletter">`;

const CHECKBOX_NEWSLETTER_ALT_HTML = `<input class="framer-form-boolean-input framer-vjczzd" type="checkbox" name="Newsletter">`;

const HONEYPOT_WEBSITE_HTML = `<input type="text" name="website" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_COMPANY_HTML = `<input type="text" name="company" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_MESSAGE_HTML = `<input type="text" name="message" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_SUBJECT_HTML = `<input type="text" name="subject" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_TITLE_HTML = `<input type="text" name="title" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_DESCRIPTION_HTML = `<input type="text" name="description" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_FEEDBACK_HTML = `<input type="text" name="feedback" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_NOTES_HTML = `<input type="text" name="notes" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_DETAILS_HTML = `<input type="text" name="details" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_REMARKS_HTML = `<input type="text" name="remarks" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const HONEYPOT_COMMENTS_HTML = `<input type="text" name="comments" tabindex="-1" autocomplete="one-time-code" aria-hidden="true" style="position:absolute;transform:scale(0)" data-1p-ignore="true" data-lpignore="true" data-form-type="other" data-bwignore="true" value="">`;

const SELECT_LOCATION_HTML = `<select name="Location" required="" class="framer-form-input"><option value="" disabled="" selected="">Selectâ</option><option value="amsterdam">Amsterdam</option><option value="barcelona">Barcelona</option></select>`;

const TEXTAREA_EMAIL_DESCRIPTION_HTML = `<textarea required="" name="Email" placeholder="Enter a description for the opportunity" class="framer-form-input"></textarea>`;

export function FInputEmailJane() {
  return <span dangerouslySetInnerHTML={{ __html: INPUT_EMAIL_JANE_HTML }} />;
}

export function FInputEmailTitle() {
  return <span dangerouslySetInnerHTML={{ __html: INPUT_EMAIL_TITLE_HTML }} />;
}

export function FInputRadioOption1() {
  return <span dangerouslySetInnerHTML={{ __html: RADIO_OPTION_1_HTML }} />;
}

export function FInputRadioOption2() {
  return <span dangerouslySetInnerHTML={{ __html: RADIO_OPTION_2_HTML }} />;
}

export function FInputRadioOption3() {
  return <span dangerouslySetInnerHTML={{ __html: RADIO_OPTION_3_HTML }} />;
}

export function FInputRadioOption1Alt() {
  return <span dangerouslySetInnerHTML={{ __html: RADIO_OPTION_1_ALT_HTML }} />;
}

export function FInputRadioOption2Alt() {
  return <span dangerouslySetInnerHTML={{ __html: RADIO_OPTION_2_ALT_HTML }} />;
}

export function FInputRadioOption3Alt() {
  return <span dangerouslySetInnerHTML={{ __html: RADIO_OPTION_3_ALT_HTML }} />;
}

export function FInputCheckboxNewsletter() {
  return <span dangerouslySetInnerHTML={{ __html: CHECKBOX_NEWSLETTER_HTML }} />;
}

export function FInputCheckboxNewsletterAlt() {
  return <span dangerouslySetInnerHTML={{ __html: CHECKBOX_NEWSLETTER_ALT_HTML }} />;
}

export function FInputHoneypotWebsite() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_WEBSITE_HTML }} />;
}

export function FInputHoneypotCompany() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_COMPANY_HTML }} />;
}

export function FInputHoneypotMessage() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_MESSAGE_HTML }} />;
}

export function FInputHoneypotSubject() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_SUBJECT_HTML }} />;
}

export function FInputHoneypotTitle() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_TITLE_HTML }} />;
}

export function FInputHoneypotDescription() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_DESCRIPTION_HTML }} />;
}

export function FInputHoneypotFeedback() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_FEEDBACK_HTML }} />;
}

export function FInputHoneypotNotes() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_NOTES_HTML }} />;
}

export function FInputHoneypotDetails() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_DETAILS_HTML }} />;
}

export function FInputHoneypotRemarks() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_REMARKS_HTML }} />;
}

export function FInputHoneypotComments() {
  return <span dangerouslySetInnerHTML={{ __html: HONEYPOT_COMMENTS_HTML }} />;
}

export function FSelectLocation() {
  return <span dangerouslySetInnerHTML={{ __html: SELECT_LOCATION_HTML }} />;
}

export function FTextareaEmailDescription() {
  return <span dangerouslySetInnerHTML={{ __html: TEXTAREA_EMAIL_DESCRIPTION_HTML }} />;
}
