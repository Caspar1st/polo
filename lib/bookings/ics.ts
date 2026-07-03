/** Minimal RFC 5545 .ics generator for booking confirmations. */

function icsDate(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export interface IcsEventInput {
  uid: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
}

export function buildIcs(event: IcsEventInput): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Frankfurter Polo Club//Booking//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}@frankfurterpoloclub`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(event.startsAt)}`,
    `DTEND:${icsDate(event.endsAt)}`,
    `SUMMARY:${escapeText(event.title)}`,
    ...(event.description
      ? [`DESCRIPTION:${escapeText(event.description)}`]
      : []),
    "LOCATION:Frankfurter Polo Club\\, Oeserstr. 80\\, 65934 Frankfurt am Main",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
