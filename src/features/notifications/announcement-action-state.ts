export type AnnouncementActionState = Readonly<{
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Readonly<{
    title?: string;
    body?: string;
    href?: string;
    audience?: string;
  }>;
}>;

export const INITIAL_ANNOUNCEMENT_ACTION_STATE: AnnouncementActionState = {
  status: "idle",
};
