import { hasRegistrationForm } from "@/lib/event-registration-form";

type RegistrationFieldsInput = Parameters<typeof hasRegistrationForm>[0];

/** Public listing/home: show “Register here” only when the event has saved registration fields. */
export function showRegisterHereOnListing(registrationFormFields: RegistrationFieldsInput): boolean {
  return hasRegistrationForm(registrationFormFields);
}

export function eventRegisterPath(eventId: string): string {
  return `/events/${eventId}/register`;
}
